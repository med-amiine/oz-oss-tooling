#!/usr/bin/env node

require('dotenv').config({ path: './config.env' });
const { Defender } = require('@openzeppelin/defender-sdk');

// Inline ABI for TokenizedBond (shortened for brevity, use full ABI in real script)
const abi = [
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"bool","name":"blocked","type":"bool"}],"name":"TransferAttempt","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"string","name":"violationType","type":"string"},{"indexed":false,"internalType":"string","name":"details","type":"string"}],"name":"ComplianceViolation","type":"event"}
];

async function setupDefenderMonitor() {
  const apiKey = process.env.DEFENDER_API_KEY;
  const apiSecret = process.env.DEFENDER_API_SECRET;
  const contractAddress = process.env.BOND_CONTRACT_ADDRESS;
  const network = 'sepolia'; // or mainnet, etc.
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const email = process.env.DEMO_EMAIL;

  if (!apiKey || !apiSecret) {
    console.error('❌ Defender API credentials not set in config.env');
    process.exit(1);
  }

  const defender = new Defender({ apiKey, apiSecret });

  // Create monitor with event conditions
  const monitor = await defender.monitors.create({
    name: 'TokenizedBond Transfer Monitor',
    network,
    addresses: [contractAddress],
    abi,
    eventConditions: [
      { eventSignature: 'Transfer(address,address,uint256)' },
      { eventSignature: 'TransferAttempt(address,address,uint256,bool)' },
      { eventSignature: 'ComplianceViolation(address,string,string)' }
    ],
    paused: false,
    notificationChannels: [
      ...(email ? [{ type: 'email', to: email }] : []),
      ...(slackUrl ? [{ type: 'slack', url: slackUrl }] : [])
    ]
  });
  console.log('✅ Defender Monitor created:', monitor.name);
}

setupDefenderMonitor().catch(console.error); 