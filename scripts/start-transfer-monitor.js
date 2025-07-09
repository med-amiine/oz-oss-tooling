#!/usr/bin/env node

/**
 * Start Transfer Event Monitor
 * Monitors all transfer events on the TokenizedBond contract
 */

require('dotenv').config({ path: './config.env' });
const TransferMonitor = require('../src/monitors/transfer-monitor');

async function startTransferMonitor() {
  console.log('🚀 Starting OpenZeppelin Transfer Monitor...\n');
  
  const monitor = new TransferMonitor();
  
  try {
    await monitor.startMonitoring();
    
    console.log('🎯 Transfer Monitor is now active!');
    console.log('📡 Listening for transfer events...');
    console.log('📧 Email notifications will be sent for all events');
    console.log('📱 Slack notifications will be sent for all events');
    console.log('');
    console.log('💡 To test the monitor:');
    console.log('   1. Make a transfer using the contract');
    console.log('   2. Try to transfer to a blacklisted address');
    console.log('   3. Watch for real-time notifications');
    console.log('');
    console.log('🛑 Press Ctrl+C to stop monitoring');
    
  } catch (error) {
    console.error('❌ Failed to start transfer monitor:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down transfer monitor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down transfer monitor...');
  process.exit(0);
});

startTransferMonitor().catch(console.error); 