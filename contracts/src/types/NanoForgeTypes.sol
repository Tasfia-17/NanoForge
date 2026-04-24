// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

enum JobStatus {
    None,
    Created,
    Paid,
    PreviewReady,
    Confirmed,
    Rejected,
    Refunded,
    Cancelled
}

enum SettlementKind {
    Confirmed,
    RejectedValidPreview,
    FailedOrNoValidPreview
}

struct JobRecord {
    uint256 id;
    uint256 agentId;
    address buyer;
    uint256 grossAmount;
    JobStatus status;
    bool previewValid;
    bool cancelledAsExpired;
    uint64 createdAt;
    uint64 paidAt;
    uint64 previewReadyAt;
    uint64 settledAt;
    uint64 cancelledAt;
}

struct SettlementInput {
    uint256 jobId;
    uint256 agentId;
    address buyer;
    address settlementBeneficiary;
    address paymentToken;
    uint256 paymentAmount;
    uint256 grossAmount;
    bool dividendEligible;
}

struct SettlementBreakdown {
    SettlementKind kind;
    uint256 refundToBuyer;
    uint256 rejectionFee;
    uint256 platformShare;
    uint256 agentShare;
    bool dividendEligible;
}
