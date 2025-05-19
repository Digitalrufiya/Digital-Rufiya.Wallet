
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract DRFFeeSender {
    address public owner;
    address public feeRecipient = 0x88253D87990EdD1E647c3B6eD21F57fb061a3040;
    IERC20 public drfToken;

    event SentWithFee(address indexed sender, address indexed recipient, uint256 amount, uint256 fee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(address _token) {
        drfToken = IERC20(_token);
        owner = msg.sender;
    }

    function sendWithFee(address recipient, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        uint256 fee = (amount * 5) / 100;
        uint256 netAmount = amount - fee;

        // Transfer full amount from sender to contract
        require(drfToken.transferFrom(msg.sender, address(this), amount), "TransferFrom failed");

        // Send 95% to recipient
        require(drfToken.transfer(recipient, netAmount), "Transfer to recipient failed");

        // Send 5% fee to feeRecipient
        require(drfToken.transfer(feeRecipient, fee), "Fee transfer failed");

        emit SentWithFee(msg.sender, recipient, netAmount, fee);
    }

    // Optional: allow contract owner to withdraw tokens (in case of emergency)
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }

    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }
}
