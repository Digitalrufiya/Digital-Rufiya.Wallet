async function connectWallet() {
    if (window.ethereum) {
        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            console.error(error);
            alert("Wallet connection failed!");
        }
    } else {
        alert('Install MetaMask!');
    }
}

async function swapTokens() {
    const fromToken = document.getElementById('fromToken').value;
    const toToken = document.getElementById('toToken').value;
    const amount = document.getElementById('amount').value;
    const slippage = document.getElementById('slippage').value;

    if (!fromToken || !toToken || !amount) {
        alert('Fill all fields!');
        return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PancakeSwap Router
    const routerAbi = [
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
    ];
    const router = new ethers.Contract(routerAddress, routerAbi, signer);

    const tokenAbi = [
        "function approve(address spender, uint amount) public returns (bool)"
    ];
    const token = new ethers.Contract(fromToken, tokenAbi, signer);

    const path = [fromToken, toToken];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const amountIn = ethers.utils.parseUnits(amount, 18);

    const amountsOut = await router.getAmountsOut(amountIn, path);
    const amountOutMin = amountsOut[1].mul((1000 - slippage * 10) / 1000);

    await token.approve(routerAddress, amountIn);

    try {
        const tx = await router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            await signer.getAddress(),
            deadline
        );
        await tx.wait();
        alert('Swap Success!');
    } catch (error) {
        console.error(error);
        alert('Swap Failed!');
    }
}
