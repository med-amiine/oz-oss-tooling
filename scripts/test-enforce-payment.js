#!/usr/bin/env node

require('dotenv').config({ path: './config.env' });
const { ethers } = require('ethers');

async function enforcePayment() {
  const paymentId = process.argv[2];
  if (!paymentId) {
    console.error('❌ Please provide a paymentId as an argument.');
    process.exit(1);
  }

  console.log('🧾 Enforcing Payment...\n');

  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const bondAddress = process.env.BOND_CONTRACT_ADDRESS;

  console.log(`💰 Wallet Address: ${wallet.address}`);
  console.log(`🏗️ Bond Contract: ${bondAddress}`);
  console.log(`🔎 Payment ID: ${paymentId}`);
  console.log('');

  // Bond contract ABI for makePayment
  const bondABI = [
    {
      "inputs": [{"type": "uint256"}],
      "name": "makePayment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const bondContract = new ethers.Contract(bondAddress, bondABI, wallet);

  try {
    const tx = await bondContract.makePayment(paymentId);
    console.log(`📝 Transaction hash: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    await tx.wait();
    console.log('✅ Payment enforced successfully!');
  } catch (error) {
    console.log('❌ Payment enforcement failed:');
    console.log(`📋 Error: ${error.message}`);
  }

  console.log('');
  console.log('🎉 Payment enforcement test completed!');
  console.log('📧 Check your email for notifications');
  console.log('📱 Check your Slack for notifications (if configured)');
}

enforcePayment().catch(console.error); 