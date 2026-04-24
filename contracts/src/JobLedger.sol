// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "./common/Ownable.sol";
import {ITransferGuard} from "./interfaces/ITransferGuard.sol";
import {IJobLifecycle} from "./interfaces/IJobLifecycle.sol";
import {IYieldVault} from "./interfaces/IYieldVault.sol";
import {AgentNFT} from "./AgentNFT.sol";
import {JobSettler} from "./JobSettler.sol";
import {JobRecord, JobStatus, SettlementBreakdown, SettlementInput, SettlementKind} from "./types/NanoForgeTypes.sol";

error NotPaymentAdapter(address caller);

/// @title JobLedger — Tracks job lifecycle and enforces transfer guards on agent NFTs
/// @notice Core state machine: Created → Paid → PreviewReady → Confirmed/Rejected/Refunded
contract JobLedger is Ownable, ITransferGuard {
    bytes32 public constant REASON_ACTIVE_JOB = keccak256("ACTIVE_JOB");
    bytes32 public constant REASON_UNSETTLED_YIELD = keccak256("UNSETTLED_YIELD");
    uint64 public constant UNPAID_JOB_TTL = 10 minutes;

    AgentNFT public immutable agentNFT;

    JobSettler public jobSettler;
    IYieldVault public yieldVault;

    address public paymentAdapter;
    uint256 public nextJobId = 1;

    mapping(uint256 => JobRecord) private _jobs;
    mapping(uint256 => uint256) public activeJobCountByAgent;
    mapping(uint256 => address) public settlementBeneficiaryByJob;
    mapping(uint256 => address) public paymentTokenByJob;
    mapping(uint256 => uint256) public paymentAmountByJob;
    mapping(uint256 => bool) public dividendEligibleByJob;
    mapping(uint256 => bool) public refundAuthorizedByJob;
    mapping(uint256 => bool) public settlementClassifiedByJob;

    event PaymentAdapterSet(address indexed previousAdapter, address indexed newAdapter);
    event JobSettlerSet(address indexed previousSettler, address indexed newSettler);
    event YieldVaultSet(address indexed previousVault, address indexed newVault);
    event JobCreated(uint256 indexed jobId, uint256 indexed agentId, address indexed buyer, uint256 grossAmount, address settlementBeneficiary);
    event JobClassified(uint256 indexed jobId, bool dividendEligible, bool refundAuthorized);
    event JobPaid(uint256 indexed jobId, uint256 indexed agentId, uint256 grossAmount);
    event JobCancelled(uint256 indexed jobId, uint256 indexed agentId, address indexed cancelledBy, uint64 cancelledAt, bool expired);
    event PreviewReady(uint256 indexed jobId, uint256 indexed agentId, bool validPreview);
    event JobSettled(uint256 indexed jobId, uint256 indexed agentId, SettlementKind kind, uint256 refundToBuyer, uint256 platformShare, uint256 agentShare, bool dividendEligible);

    constructor(address initialOwner, address agentNFTAddress) Ownable(initialOwner) {
        agentNFT = AgentNFT(agentNFTAddress);
    }

    modifier onlyPaymentAdapter() {
        if (msg.sender != paymentAdapter) revert NotPaymentAdapter(msg.sender);
        _;
    }

    function setPaymentAdapter(address newAdapter) external onlyOwner {
        address prev = paymentAdapter;
        paymentAdapter = newAdapter;
        emit PaymentAdapterSet(prev, newAdapter);
    }

    function setJobSettler(address settler) external onlyOwner {
        address prev = address(jobSettler);
        jobSettler = JobSettler(settler);
        emit JobSettlerSet(prev, settler);
    }

    function setYieldVault(address vault) external onlyOwner {
        address prev = address(yieldVault);
        yieldVault = IYieldVault(vault);
        emit YieldVaultSet(prev, vault);
    }

    function createJob(uint256 agentId, uint256 grossAmount) external returns (uint256 jobId) {
        jobId = _createJob(msg.sender, agentId, grossAmount);
    }

    function createJobForBuyer(address buyer, uint256 agentId, uint256 grossAmount) external onlyPaymentAdapter returns (uint256 jobId) {
        jobId = _createJob(buyer, agentId, grossAmount);
    }

    function _createJob(address buyer, uint256 agentId, uint256 grossAmount) internal returns (uint256 jobId) {
        require(grossAmount > 0, "ZERO_AMOUNT");
        require(buyer != address(0), "ZERO_BUYER");

        address agentOwner = agentNFT.ownerOf(agentId);
        jobId = nextJobId++;

        _jobs[jobId] = JobRecord({
            id: jobId,
            agentId: agentId,
            buyer: buyer,
            grossAmount: grossAmount,
            status: JobStatus.Created,
            previewValid: false,
            cancelledAsExpired: false,
            createdAt: uint64(block.timestamp),
            paidAt: 0,
            previewReadyAt: 0,
            settledAt: 0,
            cancelledAt: 0
        });

        settlementBeneficiaryByJob[jobId] = agentOwner;
        emit JobCreated(jobId, agentId, buyer, grossAmount, agentOwner);
    }

    function markJobPaid(uint256 jobId, bool dividendEligible, bool refundAuthorized, address paymentToken, uint256 paymentAmount) external onlyPaymentAdapter {
        JobRecord storage job = _jobs[jobId];
        require(job.status == JobStatus.Created, "INVALID_STATUS");
        require(block.timestamp <= job.createdAt + UNPAID_JOB_TTL, "JOB_EXPIRED");

        job.status = JobStatus.Paid;
        job.paidAt = uint64(block.timestamp);
        paymentTokenByJob[jobId] = paymentToken;
        paymentAmountByJob[jobId] = paymentAmount;
        dividendEligibleByJob[jobId] = dividendEligible;
        refundAuthorizedByJob[jobId] = refundAuthorized;
        settlementClassifiedByJob[jobId] = true;
        activeJobCountByAgent[job.agentId] += 1;

        emit JobClassified(jobId, dividendEligible, refundAuthorized);
        emit JobPaid(jobId, job.agentId, job.grossAmount);
    }

    function markPreviewReady(uint256 jobId, bool validPreview) external {
        JobRecord storage job = _jobs[jobId];
        require(job.status == JobStatus.Paid, "INVALID_STATUS");
        require(msg.sender == settlementBeneficiaryByJob[jobId], "NOT_AGENT_OWNER");

        job.status = JobStatus.PreviewReady;
        job.previewValid = validPreview;
        job.previewReadyAt = uint64(block.timestamp);

        emit PreviewReady(jobId, job.agentId, validPreview);
    }

    function confirmResult(uint256 jobId) external {
        JobRecord storage job = _jobs[jobId];
        require(msg.sender == job.buyer, "NOT_BUYER");
        require(job.status == JobStatus.PreviewReady, "INVALID_STATUS");
        require(job.previewValid, "PREVIEW_NOT_VALID");
        _settleJob(job, SettlementKind.Confirmed);
    }

    function rejectValidPreview(uint256 jobId) external {
        JobRecord storage job = _jobs[jobId];
        require(msg.sender == job.buyer, "NOT_BUYER");
        require(job.status == JobStatus.PreviewReady, "INVALID_STATUS");
        require(job.previewValid, "PREVIEW_NOT_VALID");
        _settleJob(job, SettlementKind.RejectedValidPreview);
    }

    function refundFailed(uint256 jobId) external {
        JobRecord storage job = _jobs[jobId];
        require(job.status == JobStatus.Paid || job.status == JobStatus.PreviewReady, "INVALID_STATUS");
        require(msg.sender == job.buyer || msg.sender == settlementBeneficiaryByJob[jobId], "NOT_ALLOWED");

        if (job.status == JobStatus.PreviewReady) {
            require(!job.previewValid, "PREVIEW_VALID");
        } else {
            require(refundAuthorizedByJob[jobId], "REFUND_NOT_AUTHORIZED");
        }

        _settleJob(job, SettlementKind.FailedOrNoValidPreview);
    }

    function cancelUnpaidJob(uint256 jobId) external {
        JobRecord storage job = _jobs[jobId];
        require(job.status == JobStatus.Created, "INVALID_STATUS");
        require(msg.sender == job.buyer, "NOT_BUYER");
        require(block.timestamp <= job.createdAt + UNPAID_JOB_TTL, "JOB_EXPIRED");
        _cancelJob(job, msg.sender, false);
    }

    function expireUnpaidJob(uint256 jobId) external {
        JobRecord storage job = _jobs[jobId];
        require(job.id != 0, "JOB_NOT_FOUND");
        require(job.status == JobStatus.Created, "INVALID_STATUS");
        require(block.timestamp > job.createdAt + UNPAID_JOB_TTL, "JOB_NOT_EXPIRED");
        _cancelJob(job, msg.sender, true);
    }

    function getJob(uint256 jobId) external view returns (
        uint256 id, uint256 agentId, address buyer, uint256 grossAmount,
        uint8 status, bool previewValid, bool cancelledAsExpired,
        uint64 createdAt, uint64 paidAt, uint64 previewReadyAt, uint64 settledAt, uint64 cancelledAt
    ) {
        JobRecord storage j = _jobs[jobId];
        return (j.id, j.agentId, j.buyer, j.grossAmount, uint8(j.status), j.previewValid, j.cancelledAsExpired, j.createdAt, j.paidAt, j.previewReadyAt, j.settledAt, j.cancelledAt);
    }

    function hasActiveJobs(uint256 agentId) external view returns (bool) {
        return activeJobCountByAgent[agentId] > 0;
    }

    function canTransfer(uint256 agentId, address from, address to) external view returns (bool, bytes32) {
        from; to;
        if (activeJobCountByAgent[agentId] > 0) return (false, REASON_ACTIVE_JOB);
        if (address(yieldVault) != address(0) && yieldVault.hasUnsettledRevenue(agentId)) return (false, REASON_UNSETTLED_YIELD);
        return (true, bytes32(0));
    }

    function _settleJob(JobRecord storage job, SettlementKind kind) internal {
        require(address(jobSettler) != address(0), "SETTLER_NOT_SET");
        require(settlementClassifiedByJob[job.id], "NOT_CLASSIFIED");

        SettlementInput memory input = SettlementInput({
            jobId: job.id,
            agentId: job.agentId,
            buyer: job.buyer,
            settlementBeneficiary: settlementBeneficiaryByJob[job.id],
            paymentToken: paymentTokenByJob[job.id],
            paymentAmount: paymentAmountByJob[job.id],
            grossAmount: job.grossAmount,
            dividendEligible: dividendEligibleByJob[job.id]
        });

        SettlementBreakdown memory breakdown = jobSettler.settle(input, kind);

        if (kind == SettlementKind.Confirmed) job.status = JobStatus.Confirmed;
        else if (kind == SettlementKind.RejectedValidPreview) job.status = JobStatus.Rejected;
        else job.status = JobStatus.Refunded;

        job.settledAt = uint64(block.timestamp);
        activeJobCountByAgent[job.agentId] -= 1;

        emit JobSettled(job.id, job.agentId, kind, breakdown.refundToBuyer, breakdown.platformShare, breakdown.agentShare, breakdown.dividendEligible);
    }

    function _cancelJob(JobRecord storage job, address cancelledBy, bool expired) internal {
        job.status = JobStatus.Cancelled;
        job.cancelledAsExpired = expired;
        job.cancelledAt = uint64(block.timestamp);
        emit JobCancelled(job.id, job.agentId, cancelledBy, job.cancelledAt, expired);
    }
}
