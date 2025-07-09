#!/usr/bin/env node

require('dotenv').config({ path: './config.env' });
const { ethers } = require('ethers');

async function testBlacklistedTransfer() {
  console.log('🧪 Testing Blacklisted Transfer...\n');

  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const bondAddress = process.env.BOND_CONTRACT_ADDRESS;

  console.log(`💰 Wallet Address: ${wallet.address}`);
  console.log(`🏗️ Bond Contract: ${bondAddress}`);
  console.log('');

  // Bond contract ABI for transfers
  const bondABI = [
    {
      "inputs": [{"type": "address"}, {"type": "uint256"}],
      "name": "transfer",
      "outputs": [{"type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const bondContract = new ethers.Contract(bondAddress, bondABI, wallet);

  // Attempt transfer to blacklisted address
  const blacklistedAddress = '0x1111111111111111111111111111111111111111';
  const transferAmount = ethers.parseEther('10');

  console.log('🔄 Attempting transfer to blacklisted address...');
  try {
    const tx = await bondContract.transfer(blacklistedAddress, transferAmount);
    console.log(`📝 Transaction hash: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    await tx.wait();
    console.log('❌ Transfer succeeded (unexpected)');
  } catch (error) {
    console.log('✅ Transfer blocked successfully!');
    console.log(`📋 Error: ${error.message}`);
  }

  console.log('');
  console.log('🎉 Blacklisted transfer test completed!');
  console.log('📧 Check your email for notifications');
  console.log('📱 Check your Slack for notifications (if configured)');
}

testBlacklistedTransfer().catch(console.error); 