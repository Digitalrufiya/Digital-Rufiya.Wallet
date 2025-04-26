const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PancakeSwap Router

const routerAbi = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external",
  "function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable external"
];

document.getElementById("connectWallet").onclick = async () => {
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  document.getElementById("swapSection").style.display = "block";
};

document.getElementById("swapTokens").onclick = async () => {
  const fromToken = document.getElementById("fromToken").value;
  const toToken = document.getElementById("toToken").value;
  const amount = document.getElementById("fromAmount").value;
  const slippage = parseFloat(document.getElementById("slippage").value);

  const router = new ethers.Contract(routerAddress, routerAbi, signer);
  const amountIn = ethers.utils.parseUnits(amount, 18);

  const path = [fromToken, toToken];

  const amounts = await router.getAmountsOut(amountIn, path);
  const amountOutMin = amounts[1].mul(ethers.BigNumber.from(1000 - slippage * 10)).div(1000);

  const tokenContract = new ethers.Contract(fromToken, ["function approve(address spender, uint256 amount) external returns (bool)"], signer);
  await tokenContract.approve(routerAddress, amountIn);

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

  await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
    amountIn,
    amountOutMin,
    path,
    await signer.getAddress(),
    deadline
  );

  alert("Swap complete!");
};
