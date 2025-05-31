// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DRFTube Token (DRFT)
 * @dev BEP20 token with fixed supply, burn on comment, reward on like/share/subscribe,
 * hidden zakat/jizya wallets, and annual zakat distribution.
 * Ownership renounce enabled for decentralization.
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DRFTube is ERC20, Ownable {
    // Fixed supply: 1,000,000,000,000,000 DRFT (1 quadrillion)
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000_000_000 * 10**18;

    // Addresses to hold hidden zakat and jizya balances (internal use)
    address private zakatWallet;
    address private jizyaWallet;

    // Events for burning and rewarding
    event CommentBurn(address indexed user, uint256 amount);
    event LikeReward(address indexed user, uint256 amount);
    event ShareReward(address indexed user, uint256 amount);
    event SubscribeReward(address indexed user, uint256 amount);
    event ZakatDistributed(uint256 totalDistributed, uint256 timestamp);

    // Burn and reward amounts (example values, can be updated by owner if needed)
    uint256 public burnPerComment = 10 * 10**18;    // 10 DRFT burned per comment
    uint256 public rewardPerLike = 5 * 10**18;      // 5 DRFT rewarded per like
    uint256 public rewardPerShare = 20 * 10**18;    // 20 DRFT rewarded per share
    uint256 public rewardPerSubscribe = 50 * 10**18;// 50 DRFT rewarded per subscribe

    // Track if contract is active (can pause if needed)
    bool public active = true;

    // Modifier to check active state
    modifier onlyActive() {
        require(active, "DRFTube: Contract is paused");
        _;
    }

    constructor(address _zakatWallet, address _jizyaWallet) ERC20("DRFTube", "DRFT") {
        require(_zakatWallet != address(0) && _jizyaWallet != address(0), "Invalid wallet addresses");
        zakatWallet = _zakatWallet;
        jizyaWallet = _jizyaWallet;

        // Mint fixed supply to owner initially
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // === Core user interactions ===

    // User comments: burns fixed amount of tokens from user balance
    function comment() external onlyActive {
        _burn(msg.sender, burnPerComment);
        emit CommentBurn(msg.sender, burnPerComment);
    }

    // Like reward: platform calls this to reward user on like
    function rewardLike(address user) external onlyOwner onlyActive {
        _transfer(jizyaWallet, user, rewardPerLike);
        emit LikeReward(user, rewardPerLike);
    }

    // Share reward: platform calls this to reward user on share
    function rewardShare(address user) external onlyOwner onlyActive {
        _transfer(jizyaWallet, user, rewardPerShare);
        emit ShareReward(user, rewardPerShare);
    }

    // Subscribe reward: platform calls this to reward user on subscribe
    function rewardSubscribe(address user) external onlyOwner onlyActive {
        _transfer(jizyaWallet, user, rewardPerSubscribe);
        emit SubscribeReward(user, rewardPerSubscribe);
    }

    // === Annual zakat distribution ===
    // Distributes all zakatWallet tokens equally to a list of user addresses
    function distributeZakat(address[] calldata users) external onlyOwner onlyActive {
        uint256 balance = balanceOf(zakatWallet);
        require(balance > 0, "No zakat tokens to distribute");
        require(users.length > 0, "No users provided");

        uint256 share = balance / users.length;

        for (uint i = 0; i < users.length; i++) {
            _transfer(zakatWallet, users[i], share);
        }
        emit ZakatDistributed(balance, block.timestamp);
    }

    // === Admin controls ===

    // Owner can update burn/reward amounts as needed
    function setBurnAndRewards(
        uint256 _burnComment,
        uint256 _rewardLike,
        uint256 _rewardShare,
        uint256 _rewardSubscribe
    ) external onlyOwner {
        burnPerComment = _burnComment;
        rewardPerLike = _rewardLike;
        rewardPerShare = _rewardShare;
        rewardPerSubscribe = _rewardSubscribe;
    }

    // Pause or unpause contract activity (emergency use)
    function setActive(bool _active) external onlyOwner {
        active = _active;
    }

    // Change zakat and jizya wallets (only if necessary)
    function setZakatWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        zakatWallet = _wallet;
    }

    function setJizyaWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        jizyaWallet = _wallet;
    }

    // To renounce ownership for decentralization once ready
    function renounceOwnership() public override onlyOwner {
        super.renounceOwnership();
    }

    // View zakat and jizya wallet addresses (no direct balances exposed publicly)
    function getZakatWallet() external view onlyOwner returns (address) {
        return zakatWallet;
    }

    function getJizyaWallet() external view onlyOwner returns (address) {
        return jizyaWallet;
    }
}
