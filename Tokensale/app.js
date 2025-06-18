// app.js
(async () => {
  const usdcAddress = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'; // USDC on BSC Mainnet
  const charityAddress = '0x88253D87990EdD1E647c3B6eD21F57fb061a3040'; // Your receiving address

  let provider, signer, userAddress;

  const connectBtn = document.getElementById('connectWallet');
  const donateBtn = document.getElementById('donateNow');
  const amountInput = document.getElementById('donationAmount');
  const anonymousToggle = document.getElementById('anonymousToggle');
  const referralCodeElem = document.getElementById('referralCode');

  // Detect referral from URL ?ref=
  function getReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      return ref.toLowerCase();
    }
    return null;
  }

  // Show referral code if present
  const referral = getReferral();
  if (referral) {
    referralCodeElem.textContent = referral;
    referralCodeElem.style.display = 'inline-block';
  }

  // Check if MetaMask or wallet is available
  async function connectWallet() {
    if (!window.ethereum) {
      alert('Please install MetaMask or a compatible wallet extension!');
      return;
    }
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      connectBtn.textContent = `Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
      connectBtn.disabled = true;
    } catch (err) {
      console.error(err);
      alert('Connection failed');
    }
  }

  // Approve USDC transfer if needed
  async function approveUSDC(spender, amount) {
    const erc20ABI = [
      'function allowance(address owner, address spender) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)'
    ];
    const usdcContract = new ethers.Contract(usdcAddress, erc20ABI, signer);
    const allowance = await usdcContract.allowance(userAddress, spender);
    if (allowance.lt(amount)) {
      const tx = await usdcContract.approve(spender, amount);
      await tx.wait();
    }
  }

  // Send USDC donation to charity address
  async function sendDonation() {
    if (!signer) {
      alert('Please connect your wallet first!');
      return;
    }

    let amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid donation amount');
      return;
    }

    // USDC uses 6 decimals
    const amountWei = ethers.utils.parseUnits(amount.toString(), 6);

    try {
      const erc20ABI = [
        'function transfer(address to, uint amount) returns (bool)'
      ];
      const usdcContract = new ethers.Contract(usdcAddress, erc20ABI, signer);

      // Transfer USDC to charity
      const tx = await usdcContract.transfer(charityAddress, amountWei);
      await tx.wait();

      alert(`Thank you for your donation of ${amount} USDC!`);

      // Show referral and anonymous info (just console log here, can expand)
      console.log('Donation details:');
      console.log('From:', userAddress);
      console.log('Amount:', amount);
      console.log('Anonymous:', anonymousToggle.checked);
      console.log('Referral:', referral || 'none');

      // TODO: Generate and offer downloadable receipt (future)

      amountInput.value = '';
      anonymousToggle.checked = false;

    } catch (err) {
      console.error(err);
      alert('Donation transaction failed');
    }
  }

  connectBtn.addEventListener('click', connectWallet);
  donateBtn.addEventListener('click', sendDonation);
})();
