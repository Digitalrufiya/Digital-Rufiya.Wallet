// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DRFTube Token (DRFT)
 * @dev BEP20 token with fixed supply, burn on comment, reward on like/share/subscribe,
 * hidden zakat/jizya wallets, annual zakat distribution, and new upload payment logic.
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DRFTube is ERC20, Ownable {
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000_000_000 * 10**18;

    address private zakatWallet;
    address private jizyaWallet;

    event CommentBurn(address indexed user, uint256 amount);
    event LikeReward(address indexed user, uint256 amount);
    event ShareReward(address indexed user, uint256 amount);
    event SubscribeReward(address indexed user, uint256 amount);
    event ZakatDistributed(uint256 totalDistributed, uint256 timestamp);

    event UploadPaid(address indexed user, uint256 totalAmount, bool withEditing);
    event UserTypeSet(address indexed user, bool isBeliever);

    uint256 public burnPerComment = 10 * 10**18;
    uint256 public rewardPerLike = 5 * 10**18;
    uint256 public rewardPerShare = 20 * 10**18;
    uint256 public rewardPerSubscribe = 50 * 10**18;

    bool public active = true;

    // Fees in DRFT tokens
    uint256 public believerUploadFee = 30 * 10**18;
    uint256 public disbelieverUploadFee = 60 * 10**18;
    uint256 public editableFee = 10 * 10**18;

    // Track user types: true = believer, false = disbeliever
    mapping(address => bool) public isBeliever;

    modifier onlyActive() {
        require(active, "DRFTube: Contract is paused");
        _;
    }

    constructor(address _zakatWallet, address _jizyaWallet) ERC20("DRFTube", "DRFT") {
        require(_zakatWallet != address(0) && _jizyaWallet != address(0), "Invalid wallet addresses");
        zakatWallet = _zakatWallet;
        jizyaWallet = _jizyaWallet;

        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // === User interaction ===
    function comment() external onlyActive {
        _burn(msg.sender, burnPerComment);
        emit CommentBurn(msg.sender, burnPerComment);
    }

    function rewardLike(address user) external onlyOwner onlyActive {
        _transfer(jizyaWallet, user, rewardPerLike);
        emit LikeReward(user, rewardPerLike);
    }

    function rewardShare(address user) external onlyOwner onlyActive {
        _transfer(jizyaWallet, user, rewardPerShare);
        emit ShareReward(user, rewardPerShare);
    }

    function rewardSubscribe(address user) external onlyOwner onlyActive {
        _transfer(jizyaWallet, user, rewardPerSubscribe);
        emit SubscribeReward(user, rewardPerSubscribe);
    }

    // === Zakat distribution ===
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

    // === New: Upload payment with editable option ===
    function setUserType(address user, bool believer) external onlyOwner {
        isBeliever[user] = believer;
        emit UserTypeSet(user, believer);
    }

    function payForUpload(bool withEditing) external onlyActive {
        uint256 baseFee = isBeliever[msg.sender] ? believerUploadFee : disbelieverUploadFee;
        uint256 totalFee = baseFee;

        if (withEditing) {
            totalFee += editableFee;
        }

        require(balanceOf(msg.sender) >= totalFee, "Insufficient balance");
        require(allowance(msg.sender, address(this)) >= totalFee, "Allowance too low");

        uint256 zakatPart = totalFee / 2;
        uint256 jizyaPart = totalFee - zakatPart;

        _transfer(msg.sender, zakatWallet, zakatPart);
        _transfer(msg.sender, jizyaWallet, jizyaPart);

        emit UploadPaid(msg.sender, totalFee, withEditing);
    }

    // === Admin controls ===
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

    function setActive(bool _active) external onlyOwner {
        active = _active;
    }

    function setZakatWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        zakatWallet = _wallet;
    }

    function setJizyaWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        jizyaWallet = _wallet;
    }

    function setBelieverUploadFee(uint256 fee) external onlyOwner {
        believerUploadFee = fee;
    }

    function setDisbelieverUploadFee(uint256 fee) external onlyOwner {
        disbelieverUploadFee = fee;
    }

    function setEditableFee(uint256 fee) external onlyOwner {
        editableFee = fee;
    }

    function renounceOwnership() public override onlyOwner {
        super.renounceOwnership();
    }

    function getZakatWallet() external view onlyOwner returns (address) {
        return zakatWallet;
    }

    function getJizyaWallet() external view onlyOwner returns (address) {
        return jizyaWallet;
    }
}
