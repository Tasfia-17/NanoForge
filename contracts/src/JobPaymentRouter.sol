// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "./common/Ownable.sol";
import {SafeERC20Like} from "./common/SafeERC20Like.sol";
import {IJobPaymentRouter} from "./interfaces/IJobPaymentRouter.sol";
import {JobLedger} from "./JobLedger.sol";
import {JobRecord, JobStatus} from "./types/NanoForgeTypes.sol";

interface IUSDCWithAuthorization {
    function receiveWithAuthorization(
        address from, address to, uint256 value,
        uint256 validAfter, uint256 validBefore, bytes32 nonce,
        uint8 v, bytes32 r, bytes32 s
    ) external;
}

/// @title JobPaymentRouter — Handles USDC (EIP-3009) and NFG payment entry for jobs
/// @notice Arc-native: USDC is the primary payment token. Sub-cent pricing via Nanopayments.
contract JobPaymentRouter is Ownable, IJobPaymentRouter {
    using SafeERC20Like for address;

    // Arc Nanopayments: 1 USDC = 1_000_000 units (6 decimals), 1 cent = 10_000 units
    uint256 internal constant USDC_UNITS_PER_CENT = 10_000;

    bytes32 public constant SOURCE_USDC_EIP3009 = keccak256("USDC_EIP3009");
    bytes32 public constant SOURCE_NFG_DIRECT = keccak256("NFG_DIRECT");
    bytes32 public constant SOURCE_NANOPAYMENT = keccak256("NANOPAYMENT");

    JobLedger public immutable jobLedger;
    IUSDCWithAuthorization public immutable usdc;
    address public immutable nfg;
    address public settlementEscrow;

    mapping(uint256 => bytes32) public paymentSourceByJob;

    event SettlementEscrowSet(address indexed previousEscrow, address indexed newEscrow);

    constructor(address initialOwner, address jobLedgerAddress, address usdcAddress, address nfgAddress) Ownable(initialOwner) {
        require(jobLedgerAddress != address(0), "ZERO_LEDGER");
        require(usdcAddress != address(0), "ZERO_USDC");
        require(nfgAddress != address(0), "ZERO_NFG");
        jobLedger = JobLedger(jobLedgerAddress);
        usdc = IUSDCWithAuthorization(usdcAddress);
        nfg = nfgAddress;
    }

    function setSettlementEscrow(address newEscrow) external onlyOwner {
        require(newEscrow != address(0), "ZERO_ESCROW");
        address prev = settlementEscrow;
        settlementEscrow = newEscrow;
        emit SettlementEscrowSet(prev, newEscrow);
    }

    /// @notice Pay for a job with USDC via EIP-3009 authorization (gasless for user)
    function payWithUSDC(
        uint256 jobId, uint256 amount,
        uint256 validAfter, uint256 validBefore, bytes32 nonce,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        uint256 grossAmount = _usdcUnitsToCents(amount);
        bool dividendEligible = _validateJobForPayment(jobId, grossAmount, msg.sender);
        require(validAfter <= block.timestamp, "AUTH_NOT_YET_VALID");
        require(validBefore >= block.timestamp, "AUTH_EXPIRED");

        address escrow = _escrow();
        usdc.receiveWithAuthorization(msg.sender, escrow, amount, validAfter, validBefore, nonce, v, r, s);
        _markJobPaid(jobId, amount, address(usdc), SOURCE_USDC_EIP3009, dividendEligible, msg.sender);
    }

    /// @notice Pay with NFG token directly
    function payWithNFG(uint256 jobId, uint256 amount) external {
        bool dividendEligible = _validateJobForPayment(jobId, amount, msg.sender);
        bool ok = nfg.safeTransferFrom(msg.sender, _escrow(), amount);
        require(ok, "NFG_TRANSFER_FAILED");
        _markJobPaid(jobId, amount, nfg, SOURCE_NFG_DIRECT, dividendEligible, msg.sender);
    }

    /// @notice Create job + pay with USDC in one tx (atomic, Arc-native)
    function createJobAndPayWithUSDC(
        uint256 agentId, uint256 amount,
        uint256 validAfter, uint256 validBefore, bytes32 nonce,
        uint8 v, bytes32 r, bytes32 s
    ) external returns (uint256 jobId) {
        uint256 grossAmount = _usdcUnitsToCents(amount);
        jobId = jobLedger.createJobForBuyer(msg.sender, agentId, grossAmount);
        bool dividendEligible = _validateJobForPayment(jobId, grossAmount, msg.sender);
        require(validAfter <= block.timestamp, "AUTH_NOT_YET_VALID");
        require(validBefore >= block.timestamp, "AUTH_EXPIRED");

        address escrow = _escrow();
        usdc.receiveWithAuthorization(msg.sender, escrow, amount, validAfter, validBefore, nonce, v, r, s);
        _markJobPaid(jobId, amount, address(usdc), SOURCE_USDC_EIP3009, dividendEligible, msg.sender);
    }

    /// @notice Nanopayment adapter path — called by Circle Nanopayments infrastructure
    function payJobByAdapter(uint256 jobId, uint256 amount, address paymentToken) external onlyOwner {
        require(paymentToken == address(usdc), "UNSUPPORTED_TOKEN");
        (,, address buyer, uint256 grossAmount,,,,,,,,) = jobLedger.getJob(jobId);
        uint256 gross = _usdcUnitsToCents(amount);
        bool dividendEligible = _validateJobForPayment(jobId, gross, buyer);

        bool ok = paymentToken.safeTransferFrom(msg.sender, _escrow(), amount);
        require(ok, "ADAPTER_TRANSFER_FAILED");

        _markJobPaid(jobId, amount, paymentToken, SOURCE_NANOPAYMENT, dividendEligible, msg.sender);
    }

    function createJobByAdapter(address buyer, uint256 agentId, uint256 amount) external onlyOwner returns (uint256 jobId) {
        require(buyer != address(0), "ZERO_BUYER");
        require(amount > 0, "ZERO_AMOUNT");
        jobId = jobLedger.createJobForBuyer(buyer, agentId, amount);
    }

    function _validateJobForPayment(uint256 jobId, uint256 amount, address expectedBuyer) internal view returns (bool dividendEligible) {
        (uint256 id,, address buyer, uint256 grossAmount, uint8 status,,,,,,,) = jobLedger.getJob(jobId);
        require(id != 0, "JOB_NOT_FOUND");
        require(JobStatus(status) == JobStatus.Created, "INVALID_STATUS");
        require(buyer == expectedBuyer, "NOT_BUYER");
        require(amount > 0, "ZERO_AMOUNT");
        require(grossAmount == amount, "AMOUNT_MISMATCH");
        require(paymentSourceByJob[jobId] == bytes32(0), "ALREADY_PAID");

        address beneficiary = jobLedger.settlementBeneficiaryByJob(jobId);
        dividendEligible = beneficiary != expectedBuyer;
    }

    function _markJobPaid(uint256 jobId, uint256 amount, address token, bytes32 source, bool dividendEligible, address payer) internal {
        (,uint256 agentId, address buyer,,,,,,,,,) = jobLedger.getJob(jobId);
        address beneficiary = jobLedger.settlementBeneficiaryByJob(jobId);
        paymentSourceByJob[jobId] = source;
        jobLedger.markJobPaid(jobId, dividendEligible, true, token, amount);
        emit PaymentFinalized(jobId, agentId, buyer, payer, token, amount, source, beneficiary, dividendEligible, true);
    }

    function _escrow() internal view returns (address) {
        require(settlementEscrow != address(0), "ESCROW_NOT_SET");
        return settlementEscrow;
    }

    function _usdcUnitsToCents(uint256 amount) internal pure returns (uint256) {
        require(amount > 0, "ZERO_AMOUNT");
        require(amount % USDC_UNITS_PER_CENT == 0, "INVALID_SCALE");
        return amount / USDC_UNITS_PER_CENT;
    }
}
