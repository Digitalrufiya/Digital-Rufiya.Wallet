const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
const drfAddress = "0x657f33094eD55c2864b0f9De0B11127e08165FAd"; // your DRF token address
const usdcAddress = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"; // USDC on BSC

document.getElementById("connectWallet").onclick = async () => {
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  const address = await signer.getAddress();
  document.getElementById("walletAddress").textContent = address;
  const network = await provider.getNetwork();
  document.getElementById("networkName").textContent = network.name.toUpperCase();
  document.getElementById("walletInfo").style.display = "block";
  loadBalances();
  generateQR(address);
};

async function loadBalances() {
  const address = await signer.getAddress();
  const bnbBalance = await provider.getBalance(address);
  document.getElementById("bnbBalance").textContent = ethers.utils.formatEther(bnbBalance);

  const usdc = new ethers.Contract(usdcAddress, ["function balanceOf(address) view returns (uint)"], signer);
  const drf = new ethers.Contract(drfAddress, ["function balanceOf(address) view returns (uint)"], signer);

  const usdcBal = await usdc.balanceOf(address);
  const drfBal = await drf.balanceOf(address);

  document.getElementById("usdcBalance").textContent = ethers.utils.formatUnits(usdcBal, 18);
  document.getElementById("drfBalance").textContent = ethers.utils.formatUnits(drfBal, 18);
}

document.getElementById("sendDRF").onclick = async () => {
  const to = document.getElementById("sendAddress").value;
  const amount = document.getElementById("sendAmount").value;
  const drf = new ethers.Contract(drfAddress, ["function transfer(address to, uint amount) returns (bool)"], signer);
  await drf.transfer(to, ethers.utils.parseUnits(amount, 18));
  alert("DRF Sent!");
};

function generateQR(address) {
  const qr = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${address}`;
  document.getElementById("qrcode").innerHTML = `<img src="${qr}"/>`;
}
