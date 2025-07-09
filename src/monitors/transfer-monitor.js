const { ethers } = require('ethers');
const EmailService = require('../services/email-service');
const SlackService = require('../services/slack-service');
require('dotenv').config({ path: './config.env' });

/**
 * Transfer Event Monitor
 * Monitors all transfer events on the TokenizedBond contract
 */
class TransferMonitor {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    this.bondAddress = process.env.BOND_CONTRACT_ADDRESS;
    this.emailService = new EmailService();
    this.slackService = new SlackService();
    this.isMonitoring = false;
    this.monitoringStats = {
      totalTransfers: 0,
      blockedTransfers: 0,
      successfulTransfers: 0,
      lastEventTime: null
    };
  }

  /**
   * Start monitoring transfer events
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Transfer monitoring is already active');
      return;
    }

    console.log('🔍 Starting Transfer Event Monitor...');
    console.log(`📡 Monitoring contract: ${this.bondAddress}`);
    console.log('');

    this.isMonitoring = true;

    // Contract ABI for transfer events
    const bondABI = [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "blocked",
            "type": "bool"
          }
        ],
        "name": "TransferAttempt",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "violationType",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "details",
            "type": "string"
          }
        ],
        "name": "ComplianceViolation",
        "type": "event"
      }
    ];

    const bondContract = new ethers.Contract(this.bondAddress, bondABI, this.provider);

    // Monitor Transfer events
    bondContract.on('Transfer', async (from, to, value, event) => {
      await this.handleTransferEvent(from, to, value, event);
    });

    // Monitor TransferAttempt events
    bondContract.on('TransferAttempt', async (from, to, amount, blocked, event) => {
      await this.handleTransferAttemptEvent(from, to, amount, blocked, event);
    });

    // Monitor ComplianceViolation events
    bondContract.on('ComplianceViolation', async (account, violationType, details, event) => {
      await this.handleComplianceViolationEvent(account, violationType, details, event);
    });

    console.log('✅ Transfer monitoring started successfully!');
    console.log('📊 Monitoring events: Transfer, TransferAttempt, ComplianceViolation');
    console.log('📧 Notifications will be sent for all transfer events');
    console.log('');

    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping transfer monitor...');
      this.stopMonitoring();
      process.exit(0);
    });
  }

  /**
   * Handle Transfer events (SUCCESSFUL only)
   */
  async handleTransferEvent(from, to, value, event) {
    this.monitoringStats.totalTransfers++;
    this.monitoringStats.successfulTransfers++;
    this.monitoringStats.lastEventTime = new Date();

    const transferData = {
      from: from,
      to: to,
      amount: ethers.formatEther(value),
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: Date.now(),
      contractAddress: this.bondAddress,
      status: 'SUCCESSFUL',
      reason: 'Transfer successful'
    };

    console.log(`🔄 Transfer Event Detected!`);
    console.log(`   From: ${from}`);
    console.log(`   To: ${to}`);
    console.log(`   Amount: ${transferData.amount} tokens`);
    console.log(`   Status: SUCCESSFUL`);
    console.log(`   TX Hash: ${event.transactionHash}`);
    console.log('');

    // Send notifications
    await this.sendTransferNotifications(transferData);
    this.displayStats();
  }

  /**
   * Handle TransferAttempt events (BLOCKED only)
   */
  async handleTransferAttemptEvent(from, to, amount, blocked, event) {
    if (!blocked) return; // Only notify on blocked attempts
    this.monitoringStats.totalTransfers++;
    this.monitoringStats.blockedTransfers++;
    this.monitoringStats.lastEventTime = new Date();

    const transferData = {
      from: from,
      to: to,
      amount: ethers.formatEther(amount),
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: Date.now(),
      contractAddress: this.bondAddress,
      status: 'BLOCKED',
      reason: 'Transfer blocked by contract'
    };

    console.log(`🎯 Blocked Transfer Attempt!`);
    console.log(`   From: ${from}`);
    console.log(`   To: ${to}`);
    console.log(`   Amount: ${transferData.amount} tokens`);
    console.log(`   Status: BLOCKED`);
    console.log(`   TX Hash: ${event.transactionHash}`);
    console.log('');

    await this.sendTransferNotifications(transferData);
    this.displayStats();
  }

  /**
   * Handle ComplianceViolation events
   */
  async handleComplianceViolationEvent(account, violationType, details, event) {
    const violationData = {
      account: account,
      violationType: violationType,
      details: details,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: Date.now(),
      contractAddress: this.bondAddress,
      severity: this.getViolationSeverity(violationType)
    };

    console.log(`🚨 Compliance Violation Detected!`);
    console.log(`   Account: ${account}`);
    console.log(`   Type: ${violationType}`);
    console.log(`   Details: ${details}`);
    console.log(`   Severity: ${violationData.severity}`);
    console.log(`   TX Hash: ${event.transactionHash}`);
    console.log('');

    // Send compliance violation notifications
    await this.sendComplianceViolationNotifications(violationData);
  }

  /**
   * Send transfer notifications
   */
  async sendTransferNotifications(transferData) {
    try {
      // Send email notification
      await this.emailService.sendTransferNotificationEmail(transferData);
      
      // Send Slack notification
      await this.slackService.sendTransferAlert(transferData);
      
      console.log('📧 Transfer notifications sent successfully');
    } catch (error) {
      console.error('❌ Failed to send transfer notifications:', error.message);
    }
  }

  /**
   * Send compliance violation notifications
   */
  async sendComplianceViolationNotifications(violationData) {
    try {
      // Send email notification
      await this.emailService.sendComplianceViolationEmail(violationData);
      
      // Send Slack notification
      await this.slackService.sendComplianceViolationAlert(violationData);
      
      console.log('📧 Compliance violation notifications sent successfully');
    } catch (error) {
      console.error('❌ Failed to send compliance notifications:', error.message);
    }
  }

  /**
   * Get violation severity
   */
  getViolationSeverity(violationType) {
    const severityMap = {
      'UNAUTHORIZED_TRANSFER': 'HIGH',
      'TRANSFER_LIMIT_EXCEEDED': 'MEDIUM',
      'HOLDING_LIMIT_EXCEEDED': 'MEDIUM',
      'BLACKLISTED_SENDER': 'HIGH',
      'BLACKLISTED_RECEIVER': 'HIGH'
    };
    return severityMap[violationType] || 'LOW';
  }

  /**
   * Display monitoring statistics
   */
  displayStats() {
    console.log('📊 Monitoring Statistics:');
    console.log(`   Total Transfers: ${this.monitoringStats.totalTransfers}`);
    console.log(`   Successful: ${this.monitoringStats.successfulTransfers}`);
    console.log(`   Blocked: ${this.monitoringStats.blockedTransfers}`);
    console.log(`   Last Event: ${this.monitoringStats.lastEventTime ? this.monitoringStats.lastEventTime.toLocaleString() : 'None'}`);
    console.log('');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.isMonitoring) {
      this.isMonitoring = false;
      console.log('🛑 Transfer monitoring stopped');
      this.displayStats();
    }
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      contractAddress: this.bondAddress,
      stats: this.monitoringStats
    };
  }
}

module.exports = TransferMonitor; 