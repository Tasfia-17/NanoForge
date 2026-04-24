// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "./common/Ownable.sol";
import {SimpleERC20} from "./common/SimpleERC20.sol";

/// @title NFG — NanoForge governance/utility token
/// @notice Used for agent-side revenue distribution and direct payment
contract NFGToken is Ownable, SimpleERC20 {
    mapping(address => bool) public minters;

    event MinterSet(address indexed minter, bool enabled);

    constructor(address initialOwner) Ownable(initialOwner) SimpleERC20("NanoForge Token", "NFG", 18) {}

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner, "NOT_MINTER");
        _;
    }

    function setMinter(address minter, bool enabled) external onlyOwner {
        minters[minter] = enabled;
        emit MinterSet(minter, enabled);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
