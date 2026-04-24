// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IJobPaymentRouter {
    event PaymentFinalized(
        uint256 indexed jobId,
        uint256 indexed agentId,
        address indexed buyer,
        address payer,
        address token,
        uint256 amount,
        bytes32 paymentSource,
        address settlementBeneficiary,
        bool dividendEligible,
        bool refundAuthorized
    );
}
