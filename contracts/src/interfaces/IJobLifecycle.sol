// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IJobLifecycle {
    function getJob(uint256 jobId) external view returns (
        uint256 id, uint256 agentId, address buyer, uint256 grossAmount,
        uint8 status, bool previewValid, bool cancelledAsExpired,
        uint64 createdAt, uint64 paidAt, uint64 previewReadyAt, uint64 settledAt, uint64 cancelledAt
    );
    function createJobForBuyer(address buyer, uint256 agentId, uint256 grossAmount) external returns (uint256 jobId);
    function markJobPaid(uint256 jobId, bool dividendEligible, bool refundAuthorized, address paymentToken, uint256 paymentAmount) external;
    function settlementBeneficiaryByJob(uint256 jobId) external view returns (address);
}
