// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "./common/Ownable.sol";
import {SimpleERC721} from "./common/SimpleERC721.sol";
import {ITransferGuard} from "./interfaces/ITransferGuard.sol";

error TransferGuardBlocked(uint256 agentId, bytes32 reason);

/// @title AgentNFT — Represents a hosted AI agent as a productive onchain asset
/// @notice Each agent NFT earns yield from confirmed job deliveries
contract AgentNFT is Ownable, SimpleERC721 {
    uint256 public nextAgentId = 1;
    address public transferGuard;

    mapping(uint256 => string) private _tokenURIs;

    event AgentMinted(uint256 indexed agentId, address indexed owner, string tokenURI);
    event TransferGuardSet(address indexed previousGuard, address indexed newGuard);

    constructor(address initialOwner) Ownable(initialOwner) SimpleERC721("NanoForge Agent", "NFA") {}

    function mintAgent(address to, string calldata uri) external onlyOwner returns (uint256 agentId) {
        agentId = nextAgentId;
        nextAgentId += 1;
        _mint(to, agentId);
        _tokenURIs[agentId] = uri;
        emit AgentMinted(agentId, to, uri);
    }

    function setTokenURI(uint256 agentId, string calldata uri) external onlyOwner {
        require(_exists(agentId), "UNKNOWN_AGENT");
        _tokenURIs[agentId] = uri;
    }

    function tokenURI(uint256 agentId) public view override returns (string memory) {
        require(_exists(agentId), "UNKNOWN_AGENT");
        return _tokenURIs[agentId];
    }

    function setTransferGuard(address newGuard) external onlyOwner {
        address previousGuard = transferGuard;
        transferGuard = newGuard;
        emit TransferGuardSet(previousGuard, newGuard);
    }

    function _beforeTokenTransfer(address from, address to, uint256 agentId) internal view override {
        if (from != address(0) && to != address(0) && transferGuard != address(0)) {
            (bool allowed, bytes32 reason) = ITransferGuard(transferGuard).canTransfer(agentId, from, to);
            if (!allowed) {
                revert TransferGuardBlocked(agentId, reason);
            }
        }
    }
}
