#!/usr/bin/env node

/**
 * Test Transfer Script
 * Triggers various transfers to test the monitoring system
 */

require('dotenv').config({ path: './config.env' });
const { ethers } = require('ethers');

async function testTransfers() {
  console.log('🧪 Testing Transfer Monitoring System...\n');
  
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
    },
    {
      "inputs": [{"type": "address"}],
      "name": "balanceOf",
      "outputs": [{"type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
  const bondContract = new ethers.Contract(bondAddress, bondABI, wallet);
  
  try {
    // Check current balance
    const balance = await bondContract.balanceOf(wallet.address);
    console.log(`📊 Current Balance: ${ethers.formatEther(balance)} tokens`);
    console.log('');
    
    if (balance === 0n) {
      console.log('❌ No tokens available for testing');
      return;
    }
    
    // Test 1: Successful transfer to a new address
    console.log('🔄 Test 1: Successful Transfer');
    console.log('Transferring 10 tokens to a test address...');
    
    const testAddress = '0x2222222222222222222222222222222222222222';
    const transferAmount = ethers.parseEther('10');
    
    try {
      const tx = await bondContract.transfer(testAddress, transferAmount);
      console.log(`📝 Transaction hash: ${tx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      await tx.wait();
      console.log('✅ Transfer successful!');
    } catch (error) {
      console.log('❌ Transfer failed:', error.message);
    }
    
    console.log('');
    
    // Test 2: Blocked transfer to blacklisted address
    console.log('🔄 Test 2: Blocked Transfer');
    console.log('Attempting transfer to blacklisted address...');
    
    const blacklistedAddress = '0x1111111111111111111111111111111111111111';
    
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
    console.log('🎉 Transfer tests completed!');
    console.log('📧 Check your email for notifications');
    console.log('📱 Check your Slack for notifications (if configured)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTransfers().catch(console.error); 