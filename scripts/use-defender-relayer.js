#!/usr/bin/env node

require('dotenv').config({ path: './config.env' });
const { Relayer } = require('@openzeppelin/defender-relay-client');
const { ethers } = require('ethers');

async function main() {
  const relayerApiKey = process.env.DEFENDER_RELAYER_API_KEY;
  const relayerApiSecret = process.env.DEFENDER_RELAYER_API_SECRET;
  const contractAddress = process.env.BOND_CONTRACT_ADDRESS;
  const network = 'sepolia';
  const method = process.argv[2];
  const args = process.argv.slice(3);

  if (!relayerApiKey || !relayerApiSecret) {
    console.error('❌ Defender Relayer API credentials not set in config.env');
    process.exit(1);
  }
  if (!method) {
    console.error('❌ Please provide a contract method to call');
    console.error('Supported methods:');
    console.error('  transfer <recipient> <amount>');
    console.error('  makePayment <paymentId>');
    console.error('  mint <recipient> <amount>');
    console.error('  updateBlacklist <address> <blacklisted>');
    console.error('  updateWhitelist <address> <whitelisted>');
    process.exit(1);
  }

  const relayer = new Relayer({ apiKey: relayerApiKey, apiSecret: relayerApiSecret });
  const provider = relayer.provider;
  const signer = relayer.getSigner();

  // Load ABI (using the full ABI you provided)
  const abi = [
    {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint256","name":"_faceValue","type":"uint256"},{"internalType":"uint256","name":"_couponRate","type":"uint256"},{"internalType":"uint256","name":"_maturityDate","type":"uint256"},{"internalType":"address","name":"_monitor","type":"address"},{"internalType":"address","name":"_treasury","type":"address"},{"internalType":"address","name":"_compliance","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"bool","name":"blacklisted","type":"bool"}],"name":"BlacklistUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"by","type":"address"},{"indexed":false,"internalType":"string","name":"reason","type":"string"}],"name":"BondPaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"by","type":"address"}],"name":"BondUnpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"string","name":"violationType","type":"string"},{"indexed":false,"internalType":"string","name":"details","type":"string"}],"name":"ComplianceViolation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"holder","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EarlyRedemptionRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"paymentId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"dueDate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"InterestPaymentDue","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"paymentId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"payer","type":"address"}],"name":"PaymentMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"paymentId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"dueDate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PrincipalPaymentDue","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"bool","name":"blocked","type":"bool"}],"name":"TransferAttempt","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"limit","type":"uint256"}],"name":"TransferLimitUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"bool","name":"whitelisted","type":"bool"}],"name":"WhitelistUpdated","type":"event"},{"inputs":[],"name":"COMPLIANCE_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MONITOR_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TREASURY_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"blacklistedAddresses","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bondDetails","outputs":[{"internalType":"uint256","name":"maturityDate","type":"uint256"},{"internalType":"uint256","name":"couponRate","type":"uint256"},{"internalType":"uint256","name":"faceValue","type":"uint256"},{"internalType":"string","name":"bondName","type":"string"},{"internalType":"string","name":"bondSymbol","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBondDetails","outputs":[{"internalType":"uint256","name":"maturityDate","type":"uint256"},{"internalType":"uint256","name":"couponRate","type":"uint256"},{"internalType":"uint256","name":"faceValue","type":"uint256"},{"internalType":"string","name":"bondName","type":"string"},{"internalType":"string","name":"bondSymbol","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getJurisdiction","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOverduePayments","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"paymentId","type":"uint256"}],"name":"getPaymentSchedule","outputs":[{"internalType":"uint256","name":"dueDate","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bool","name":"paid","type":"bool"},{"internalType":"uint256","name":"paymentType","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalPayments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getTransferLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isBlacklisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isKYCVerified","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isWhitelisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"jurisdictions","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"kycVerified","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"paymentId","type":"uint256"}],"name":"makePayment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"maxHoldingLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextPaymentId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"reason","type":"string"}],"name":"pauseBond","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"paymentSchedules","outputs":[{"internalType":"uint256","name":"dueDate","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bool","name":"paid","type":"bool"},{"internalType":"uint256","name":"paymentType","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"callerConfirmation","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"requestEarlyRedemption","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"transferLimits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"unpauseBond","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"blacklisted","type":"bool"}],"name":"updateBlacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"string","name":"jurisdiction","type":"string"}],"name":"updateJurisdiction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"verified","type":"bool"}],"name":"updateKYCStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"updateMaxHoldingLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"updateTransferLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"whitelisted","type":"bool"}],"name":"updateWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"whitelistedAddresses","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];

  const contract = new ethers.Contract(contractAddress, abi, signer);

  console.log(`🔧 Using Defender Relayer: ${await signer.getAddress()}`);
  console.log(`📋 Contract: ${contractAddress}`);
  console.log(`🎯 Method: ${method}`);
  console.log(`📝 Arguments: ${args.join(', ')}`);
  console.log('');

  let tx;
  try {
    switch (method) {
      case 'transfer':
        if (args.length !== 2) {
          console.error('❌ transfer requires 2 arguments: <recipient> <amount>');
          process.exit(1);
        }
        const recipient = args[0];
        const amount = ethers.parseEther(args[1]);
        tx = await contract.transfer(recipient, amount);
        console.log('📝 Transfer transaction sent:', tx.hash);
        await tx.wait();
        console.log('✅ Transfer completed via Defender Relayer!');
        break;

      case 'makePayment':
        if (args.length !== 1) {
          console.error('❌ makePayment requires 1 argument: <paymentId>');
          process.exit(1);
        }
        const paymentId = parseInt(args[0]);
        tx = await contract.makePayment(paymentId);
        console.log('📝 makePayment transaction sent:', tx.hash);
        await tx.wait();
        console.log('✅ Payment enforced via Defender Relayer!');
        break;

      case 'mint':
        if (args.length !== 2) {
          console.error('❌ mint requires 2 arguments: <recipient> <amount>');
          process.exit(1);
        }
        const mintRecipient = args[0];
        const mintAmount = ethers.parseEther(args[1]);
        tx = await contract.mint(mintRecipient, mintAmount);
        console.log('📝 Mint transaction sent:', tx.hash);
        await tx.wait();
        console.log('✅ Tokens minted via Defender Relayer!');
        break;

      case 'updateBlacklist':
        if (args.length !== 2) {
          console.error('❌ updateBlacklist requires 2 arguments: <address> <blacklisted>');
          process.exit(1);
        }
        const blacklistAddress = args[0];
        const blacklisted = args[1] === 'true';
        tx = await contract.updateBlacklist(blacklistAddress, blacklisted);
        console.log('📝 updateBlacklist transaction sent:', tx.hash);
        await tx.wait();
        console.log(`✅ Blacklist updated via Defender Relayer! (${blacklistAddress}: ${blacklisted})`);
        break;

      case 'updateWhitelist':
        if (args.length !== 2) {
          console.error('❌ updateWhitelist requires 2 arguments: <address> <whitelisted>');
          process.exit(1);
        }
        const whitelistAddress = args[0];
        const whitelisted = args[1] === 'true';
        tx = await contract.updateWhitelist(whitelistAddress, whitelisted);
        console.log('📝 updateWhitelist transaction sent:', tx.hash);
        await tx.wait();
        console.log(`✅ Whitelist updated via Defender Relayer! (${whitelistAddress}: ${whitelisted})`);
        break;

      default:
        console.error('❌ Unsupported method:', method);
        console.error('Supported methods: transfer, makePayment, mint, updateBlacklist, updateWhitelist');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Transaction failed:', error.message);
    process.exit(1);
  }

  console.log('');
  console.log('🎉 Transaction completed successfully!');
  console.log('📧 Check your email for notifications');
  console.log('📱 Check your Slack for notifications (if configured)');
}

main().catch(console.error); 