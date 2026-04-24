// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "./common/Ownable.sol";
import {SafeERC20Like} from "./common/SafeERC20Like.sol";
import {IYieldVault} from "./interfaces/IYieldVault.sol";
import {SettlementBreakdown, SettlementInput, SettlementKind} from "./types/NanoForgeTypes.sol";

error NotJobLedger(address caller);

/// @title JobSettler — Computes and routes USDC settlement splits on Arc
/// @notice Platform fee: 10%. Rejection refund: 70%. Full refund on failure.
contract JobSettler is Ownable {
    using SafeERC20Like for address;

    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant PLATFORM_FEE_BPS = 1_000;       // 10%
    uint256 public constant REJECTION_REFUND_BPS = 7_000;   // 70%

    IYieldVault public immutable yieldVault;
    address public immutable nfgToken;

    address public jobLedger;
    address public platformTreasury;

    mapping(address => mapping(address => uint256)) public refundableByToken;
    mapping(address => uint256) public platformAccruedByToken;

    event JobLedgerSet(address indexed previousLedger, address indexed newLedger);
    event PlatformTreasurySet(address indexed previousTreasury, address indexed newTreasury);
    event Settled(
        uint256 indexed jobId, uint256 indexed agentId, SettlementKind kind,
        address buyer, address settlementBeneficiary,
        uint256 grossAmount, uint256 refundToBuyer, uint256 platformShare, uint256 agentShare, bool dividendEligible
    );
    event RefundClaimed(address indexed buyer, address indexed token, uint256 amount);
    event PlatformRevenueClaimed(address indexed treasury, address indexed token, uint256 amount);

    constructor(address initialOwner, address yieldVaultAddress, address nfgTokenAddress, address initialTreasury) Ownable(initialOwner) {
        require(nfgTokenAddress != address(0), "ZERO_NFG");
        yieldVault = IYieldVault(yieldVaultAddress);
        nfgToken = nfgTokenAddress;
        platformTreasury = initialTreasury;
    }

    modifier onlyJobLedger() {
        if (msg.sender != jobLedger) revert NotJobLedger(msg.sender);
        _;
    }

    function setJobLedger(address newLedger) external onlyOwner {
        address prev = jobLedger;
        jobLedger = newLedger;
        emit JobLedgerSet(prev, newLedger);
    }

    function setPlatformTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "ZERO_TREASURY");
        address prev = platformTreasury;
        platformTreasury = newTreasury;
        emit PlatformTreasurySet(prev, newTreasury);
    }

    function settle(SettlementInput calldata input, SettlementKind kind) external onlyJobLedger returns (SettlementBreakdown memory breakdown) {
        breakdown.kind = kind;
        breakdown.dividendEligible = input.dividendEligible;
        uint256 paymentBasis = input.paymentAmount > 0 ? input.paymentAmount : input.grossAmount;
        uint256 pricingBasis = input.paymentToken == nfgToken ? paymentBasis : input.grossAmount;

        if (kind == SettlementKind.Confirmed) {
            breakdown.platformShare = (paymentBasis * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
            breakdown.agentShare = pricingBasis - ((pricingBasis * PLATFORM_FEE_BPS) / BPS_DENOMINATOR);
        } else if (kind == SettlementKind.RejectedValidPreview) {
            breakdown.refundToBuyer = (paymentBasis * REJECTION_REFUND_BPS) / BPS_DENOMINATOR;
            breakdown.rejectionFee = paymentBasis - breakdown.refundToBuyer;
            breakdown.platformShare = (breakdown.rejectionFee * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
            uint256 pricingRejectionFee = pricingBasis - ((pricingBasis * REJECTION_REFUND_BPS) / BPS_DENOMINATOR);
            breakdown.agentShare = pricingRejectionFee - ((pricingRejectionFee * PLATFORM_FEE_BPS) / BPS_DENOMINATOR);
        } else {
            breakdown.refundToBuyer = paymentBasis;
        }

        if (breakdown.refundToBuyer > 0) {
            refundableByToken[input.buyer][input.paymentToken] += breakdown.refundToBuyer;
        }

        if (breakdown.platformShare > 0) {
            platformAccruedByToken[input.paymentToken] += breakdown.platformShare;
        }

        // For USDC payments: sweep non-refund, non-platform portion to treasury as reserve
        if (input.paymentToken != address(0) && input.paymentToken != nfgToken) {
            uint256 reserve = paymentBasis - breakdown.refundToBuyer - breakdown.platformShare;
            if (reserve > 0) {
                bool ok = input.paymentToken.safeTransfer(platformTreasury, reserve);
                require(ok, "RESERVE_TRANSFER_FAILED");
            }
        }

        if (breakdown.agentShare > 0) {
            if (input.paymentToken == nfgToken && breakdown.dividendEligible) {
                bool funded = nfgToken.safeTransfer(address(yieldVault), breakdown.agentShare);
                require(funded, "NFG_YIELD_FUNDING_FAILED");
            }
            yieldVault.accrueRevenue(input.agentId, input.settlementBeneficiary, input.jobId, breakdown.agentShare, breakdown.dividendEligible, input.paymentToken == nfgToken);
        }

        emit Settled(input.jobId, input.agentId, kind, input.buyer, input.settlementBeneficiary, input.grossAmount, breakdown.refundToBuyer, breakdown.platformShare, breakdown.agentShare, breakdown.dividendEligible);
    }

    function claimRefund(address token) external returns (uint256 amount) {
        require(token != address(0), "ZERO_TOKEN");
        amount = refundableByToken[msg.sender][token];
        require(amount > 0, "NOTHING_TO_CLAIM");
        refundableByToken[msg.sender][token] = 0;
        bool ok = token.safeTransfer(msg.sender, amount);
        require(ok, "TRANSFER_FAILED");
        emit RefundClaimed(msg.sender, token, amount);
    }

    function claimPlatformRevenue(address token) external returns (uint256 amount) {
        require(msg.sender == platformTreasury, "NOT_TREASURY");
        require(token != address(0), "ZERO_TOKEN");
        amount = platformAccruedByToken[token];
        require(amount > 0, "NOTHING_TO_CLAIM");
        platformAccruedByToken[token] = 0;
        bool ok = token.safeTransfer(msg.sender, amount);
        require(ok, "TRANSFER_FAILED");
        emit PlatformRevenueClaimed(msg.sender, token, amount);
    }
}
