// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IYieldVault {
    function accrueRevenue(uint256 agentId, address agentOwner, uint256 jobId, uint256 amount, bool dividendEligible, bool amountIsNFGWei) external;
    function hasUnsettledRevenue(uint256 agentId) external view returns (bool);
}
