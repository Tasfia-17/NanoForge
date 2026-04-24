// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "./common/Ownable.sol";
import {NFGToken} from "./NFGToken.sol";
import {IYieldVault} from "./interfaces/IYieldVault.sol";

interface IAgentOwnership {
    function ownerOf(uint256 agentId) external view returns (address);
}

error NotJobSettler(address caller);

/// @title YieldVault — Tracks and distributes agent-side yield from confirmed jobs
contract YieldVault is Ownable, IYieldVault {
    NFGToken public immutable nfgToken;
    IAgentOwnership public immutable agentNFT;
    uint256 public immutable nfgAnchorPriceCents;

    address public jobSettler;

    mapping(uint256 => uint256) public unsettledYieldByAgent;
    mapping(uint256 => mapping(address => uint256)) public claimableByAgentOwner;
    mapping(uint256 => uint256) public nonDividendYieldByAgent;

    event JobSettlerSet(address indexed previousSettler, address indexed newSettler);
    event YieldAccrued(uint256 indexed agentId, uint256 indexed jobId, address indexed agentOwner, uint256 amount, bool dividendEligible);
    event YieldClaimed(uint256 indexed agentId, address indexed agentOwner, uint256 amount);

    constructor(address initialOwner, address nfgTokenAddress, address agentNFTAddress, uint256 nfgAnchorPriceCents_) Ownable(initialOwner) {
        require(nfgAnchorPriceCents_ > 0, "ZERO_ANCHOR");
        nfgToken = NFGToken(nfgTokenAddress);
        agentNFT = IAgentOwnership(agentNFTAddress);
        nfgAnchorPriceCents = nfgAnchorPriceCents_;
    }

    modifier onlyJobSettler() {
        if (msg.sender != jobSettler) revert NotJobSettler(msg.sender);
        _;
    }

    function setJobSettler(address settler) external onlyOwner {
        address prev = jobSettler;
        jobSettler = settler;
        emit JobSettlerSet(prev, settler);
    }

    function accrueRevenue(uint256 agentId, address agentOwner, uint256 jobId, uint256 amount, bool dividendEligible, bool amountIsNFGWei) external onlyJobSettler {
        if (amount == 0) return;
        if (dividendEligible) {
            uint256 nfgAmount = amountIsNFGWei ? amount : _centsToNFGWei(amount);
            unsettledYieldByAgent[agentId] += nfgAmount;
            claimableByAgentOwner[agentId][agentOwner] += nfgAmount;
            if (!amountIsNFGWei) nfgToken.mint(address(this), nfgAmount);
            amount = nfgAmount;
        } else {
            nonDividendYieldByAgent[agentId] += amount;
        }
        emit YieldAccrued(agentId, jobId, agentOwner, amount, dividendEligible);
    }

    function claim(uint256 agentId) external returns (uint256 amount) {
        amount = claimableByAgentOwner[agentId][msg.sender];
        require(amount > 0, "NOTHING_TO_CLAIM");
        claimableByAgentOwner[agentId][msg.sender] = 0;
        unsettledYieldByAgent[agentId] -= amount;
        bool ok = nfgToken.transfer(msg.sender, amount);
        require(ok, "NFG_TRANSFER_FAILED");
        emit YieldClaimed(agentId, msg.sender, amount);
    }

    function hasUnsettledRevenue(uint256 agentId) external view returns (bool) {
        return unsettledYieldByAgent[agentId] > 0;
    }

    function _centsToNFGWei(uint256 amountCents) internal view returns (uint256) {
        return (amountCents * 1 ether) / nfgAnchorPriceCents;
    }
}
