// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "./common/Ownable.sol";
import {SafeERC20Like} from "./common/SafeERC20Like.sol";
import {IJobPaymentRouter} from "./interfaces/IJobPaymentRouter.sol";
import {AgentNFT} from "./AgentNFT.sol";
import {ITransferGuard} from "./interfaces/ITransferGuard.sol";
import {TransferGuardBlocked} from "./AgentNFT.sol";

/// @title AgentMarket — Fixed-price secondary market for Agent NFTs
contract AgentMarket is Ownable {
    using SafeERC20Like for address;

    struct Listing {
        uint256 id;
        uint256 agentId;
        address seller;
        address paymentToken;
        uint256 price;
        uint64 expiry;
        bool active;
    }

    AgentNFT public immutable agentNFT;
    uint256 public nextListingId = 1;

    mapping(uint256 => Listing) private _listings;
    mapping(uint256 => uint256) public activeListingIdByAgent;
    mapping(address => bool) public supportedPaymentToken;

    event ListingCreated(uint256 indexed listingId, uint256 indexed agentId, address indexed seller, address paymentToken, uint256 price, uint64 expiry);
    event ListingCancelled(uint256 indexed listingId, uint256 indexed agentId, address indexed cancelledBy);
    event ListingPurchased(uint256 indexed listingId, uint256 indexed agentId, address indexed buyer, address seller, address paymentToken, uint256 price);
    event PaymentTokenSupportUpdated(address indexed token, bool supported);

    constructor(address initialOwner, address agentNFTAddress, address[] memory supportedTokens) Ownable(initialOwner) {
        require(agentNFTAddress != address(0), "ZERO_AGENT_NFT");
        agentNFT = AgentNFT(agentNFTAddress);
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            _setSupportedToken(supportedTokens[i], true);
        }
    }

    function setSupportedPaymentToken(address token, bool supported) external onlyOwner {
        _setSupportedToken(token, supported);
    }

    function createListing(uint256 agentId, address paymentToken, uint256 price, uint64 expiry) external returns (uint256 listingId) {
        require(price > 0, "ZERO_PRICE");
        require(expiry > block.timestamp, "INVALID_EXPIRY");
        require(supportedPaymentToken[paymentToken], "UNSUPPORTED_TOKEN");
        require(agentNFT.ownerOf(agentId) == msg.sender, "NOT_AGENT_OWNER");
        require(agentNFT.getApproved(agentId) == address(this) || agentNFT.isApprovedForAll(msg.sender, address(this)), "NOT_APPROVED");

        _clearInactiveListing(agentId);
        require(activeListingIdByAgent[agentId] == 0, "ACTIVE_LISTING_EXISTS");

        address guard = agentNFT.transferGuard();
        if (guard != address(0)) {
            (bool allowed, bytes32 reason) = ITransferGuard(guard).canTransfer(agentId, msg.sender, address(this));
            if (!allowed) revert TransferGuardBlocked(agentId, reason);
        }

        listingId = nextListingId++;
        _listings[listingId] = Listing({id: listingId, agentId: agentId, seller: msg.sender, paymentToken: paymentToken, price: price, expiry: expiry, active: true});
        activeListingIdByAgent[agentId] = listingId;

        emit ListingCreated(listingId, agentId, msg.sender, paymentToken, price, expiry);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = _listings[listingId];
        require(listing.id != 0, "NOT_FOUND");
        require(listing.active, "INACTIVE");
        address currentOwner = agentNFT.ownerOf(listing.agentId);
        require(msg.sender == listing.seller || msg.sender == currentOwner, "NOT_AUTHORIZED");
        listing.active = false;
        if (activeListingIdByAgent[listing.agentId] == listingId) activeListingIdByAgent[listing.agentId] = 0;
        emit ListingCancelled(listingId, listing.agentId, msg.sender);
    }

    function buyListing(uint256 listingId) external {
        Listing storage listing = _listings[listingId];
        require(listing.id != 0, "NOT_FOUND");
        require(listing.active, "INACTIVE");
        require(block.timestamp <= listing.expiry, "EXPIRED");
        require(msg.sender != listing.seller, "SELLER_CANNOT_BUY");
        require(agentNFT.ownerOf(listing.agentId) == listing.seller, "SELLER_NOT_OWNER");

        listing.active = false;
        if (activeListingIdByAgent[listing.agentId] == listingId) activeListingIdByAgent[listing.agentId] = 0;

        bool ok = listing.paymentToken.safeTransferFrom(msg.sender, listing.seller, listing.price);
        require(ok, "PAYMENT_FAILED");

        agentNFT.safeTransferFrom(listing.seller, msg.sender, listing.agentId);
        emit ListingPurchased(listingId, listing.agentId, msg.sender, listing.seller, listing.paymentToken, listing.price);
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        require(_listings[listingId].id != 0, "NOT_FOUND");
        return _listings[listingId];
    }

    function _clearInactiveListing(uint256 agentId) internal {
        uint256 existingId = activeListingIdByAgent[agentId];
        if (existingId == 0) return;
        Listing storage existing = _listings[existingId];
        if (!existing.active || block.timestamp > existing.expiry) {
            existing.active = false;
            activeListingIdByAgent[agentId] = 0;
        }
    }

    function _setSupportedToken(address token, bool supported) internal {
        require(token != address(0), "ZERO_TOKEN");
        supportedPaymentToken[token] = supported;
        emit PaymentTokenSupportUpdated(token, supported);
    }
}
