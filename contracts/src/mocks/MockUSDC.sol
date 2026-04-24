// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Mock USDC with EIP-3009 receiveWithAuthorization for Arc testnet
contract MockUSDC {
    string public name = "USD Coin";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(bytes32 => bool) public authorizationState;

    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant RECEIVE_WITH_AUTHORIZATION_TYPEHASH =
        keccak256("ReceiveWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);

    constructor() {
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes("USD Coin")),
            keccak256(bytes("2")),
            block.chainid,
            address(this)
        ));
    }

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function receiveWithAuthorization(
        address from, address to, uint256 value,
        uint256 validAfter, uint256 validBefore, bytes32 nonce,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        require(block.timestamp > validAfter, "AUTH_NOT_YET_VALID");
        require(block.timestamp < validBefore, "AUTH_EXPIRED");
        require(!authorizationState[nonce], "AUTH_USED");

        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(RECEIVE_WITH_AUTHORIZATION_TYPEHASH, from, to, value, validAfter, validBefore, nonce))
        ));

        address signer = ecrecover(digest, v, r, s);
        require(signer == from, "INVALID_SIGNATURE");

        authorizationState[nonce] = true;
        balanceOf[from] -= value;
        balanceOf[to] += value;

        emit AuthorizationUsed(from, nonce);
        emit Transfer(from, to, value);
    }
}
