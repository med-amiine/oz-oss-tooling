const axios = require('axios');
require('dotenv').config({ path: './config.env' });

/**
 * Slack Notification Service
 * Sends monitoring alerts to Slack channels via webhook
 */
class SlackService {
  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.enabled = !!this.webhookUrl && this.webhookUrl !== 'your_slack_webhook_url_here';
  }

  /**
   * Send blocked transfer notification to Slack
   */
  async sendBlockedTransferAlert(transferData) {
    const message = {
      text: '🚫 *BLOCKED TRANSFER ALERT*',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚫 BLOCKED TRANSFER ALERT',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*From:*\n\`${transferData.from}\``
            },
            {
              type: 'mrkdwn',
              text: `*To:*\n\`${transferData.to}\``
            },
            {
              type: 'mrkdwn',
              text: `*Amount:*\n${transferData.amount} tokens`
            },
            {
              type: 'mrkdwn',
              text: `*Reason:*\n${transferData.reason}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Contract:* \`${transferData.contractAddress}\`\n*Time:* ${new Date(transferData.timestamp).toLocaleString()}`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Actions Taken:*\n• ✅ Transfer automatically blocked\n• 📊 Security event logged\n• 🔍 Compliance team notified\n• 📋 Regulatory report generated'
          }
        }
      ]
    };

    return this.sendSlackMessage(message);
  }

  /**
   * Send overdue payment notification to Slack
   */
  async sendOverduePaymentAlert(paymentData) {
    const message = {
      text: '⚠️ *OVERDUE PAYMENT ALERT*',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⚠️ OVERDUE PAYMENT ALERT',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Payment ID:*\n${paymentData.paymentId}`
            },
            {
              type: 'mrkdwn',
              text: `*Amount:*\n${paymentData.amount} tokens`
            },
            {
              type: 'mrkdwn',
              text: `*Due Date:*\n${new Date(paymentData.dueDate * 1000).toLocaleString()}`
            },
            {
              type: 'mrkdwn',
              text: `*Days Overdue:*\n${paymentData.daysOverdue} days`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Contract:* \`${paymentData.contractAddress}\`\n*Grace Period:* ${paymentData.gracePeriod} hours`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Risk Assessment:*\n• 🔴 *High Risk:* Payment default may trigger bond acceleration\n• 💰 *Financial Impact:* Potential loss of investor confidence\n• 📋 *Regulatory Impact:* May require regulatory reporting\n• ⚖️ *Legal Impact:* Could trigger legal proceedings'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Immediate Actions Required:*\n• Review treasury reserves for payment capability\n• Execute automatic payment if sufficient funds available\n• Notify bondholders of payment status\n• Prepare regulatory notifications if necessary'
          }
        }
      ]
    };

    return this.sendSlackMessage(message);
  }

  /**
   * Send payment enforcement notification to Slack
   */
  async sendPaymentEnforcedAlert(paymentData) {
    const message = {
      text: '✅ *PAYMENT ENFORCED*',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ PAYMENT ENFORCED',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Payment ID:*\n${paymentData.paymentId}`
            },
            {
              type: 'mrkdwn',
              text: `*Amount Paid:*\n${paymentData.amount} tokens`
            },
            {
              type: 'mrkdwn',
              text: `*Transaction Hash:*\n\`${paymentData.transactionHash}\``
            },
            {
              type: 'mrkdwn',
              text: `*Enforcement Time:*\n${new Date(paymentData.timestamp).toLocaleString()}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Contract:* \`${paymentData.contractAddress}\`\n*Method:* Automatic from reserve`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Actions Completed:*\n• ✅ Payment automatically executed from reserve funds\n• 📊 Transaction confirmed on blockchain\n• 📋 Payment records updated\n• 📧 Bondholders notified of payment\n• 📊 Compliance records updated'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*System Status:*\n• 🟢 Bond payment status: UP TO DATE\n• 🟢 Default risk: MITIGATED\n• 🟢 Regulatory compliance: MAINTAINED\n• 🟢 Investor confidence: PRESERVED'
          }
        }
      ]
    };

    return this.sendSlackMessage(message);
  }

  /**
   * Send compliance violation notification to Slack
   */
  async sendComplianceViolationAlert(violationData) {
    const message = {
      text: '🚨 *COMPLIANCE VIOLATION*',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 COMPLIANCE VIOLATION',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Violation Type:*\n${violationData.violationType}`
            },
            {
              type: 'mrkdwn',
              text: `*Account:*\n\`${violationData.account}\``
            },
            {
              type: 'mrkdwn',
              text: `*Severity:*\n${violationData.severity}`
            },
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${new Date(violationData.timestamp).toLocaleString()}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Contract:* \`${violationData.contractAddress}\`\n*Details:* ${violationData.details}`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Enforcement Actions:*\n• 🔒 Account frozen pending investigation\n• 📋 Regulatory report generated\n• 📧 Authorities notified\n• 📊 Audit trail updated'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Required Actions:*\n• Review violation details in compliance dashboard\n• Investigate account activity and history\n• Determine appropriate enforcement actions\n• Update regulatory authorities if required\n• Document all actions taken'
          }
        }
      ]
    };

    return this.sendSlackMessage(message);
  }

  /**
   * Send transfer alert to Slack
   */
  async sendTransferAlert(transferData) {
    const message = {
      text: `🔄 *TRANSFER ${transferData.status}* - Tokenized Bond`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🔄 TRANSFER ${transferData.status}`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*From:*\n\`${transferData.from}\``
            },
            {
              type: 'mrkdwn',
              text: `*To:*\n\`${transferData.to}\``
            },
            {
              type: 'mrkdwn',
              text: `*Amount:*\n${transferData.amount} tokens`
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n${transferData.status}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Transaction Hash:* \`${transferData.transactionHash}\`\n*Block:* ${transferData.blockNumber}\n*Time:* ${new Date(transferData.timestamp).toLocaleString()}`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Monitoring Information:*\n• ✅ Transfer event detected and logged\n• 📊 Compliance check completed\n• 📋 Audit trail updated\n• 🔍 Transaction details recorded'
          }
        }
      ]
    };

    if (transferData.status === 'BLOCKED') {
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Block Reason:* ${transferData.reason}`
        }
      });
    }

    return this.sendSlackMessage(message);
  }

  /**
   * Send general monitoring alert to Slack
   */
  async sendMonitoringAlert(alertData) {
    const message = {
      text: `🔔 *${alertData.type.toUpperCase()} ALERT*`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🔔 ${alertData.type.toUpperCase()} ALERT`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${alertData.title}*\n${alertData.message}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Contract:*\n\`${alertData.contractAddress}\``
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${new Date(alertData.timestamp).toLocaleString()}`
            }
          ]
        }
      ]
    };

    return this.sendSlackMessage(message);
  }

  /**
   * Send message to Slack webhook
   */
  async sendSlackMessage(message) {
    if (!this.enabled) {
      console.log('📱 Slack notification simulation:', message.text);
      return { success: false, error: 'Slack webhook not configured' };
    }

    try {
      const response = await axios.post(this.webhookUrl, message, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        console.log(`📱 Slack notification sent: ${message.text}`);
        return { success: true };
      } else {
        console.error('❌ Failed to send Slack notification:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test Slack configuration
   */
  async testSlackConfiguration() {
    if (!this.enabled) {
      console.log('⚠️ Slack webhook not configured');
      return false;
    }

    try {
      const testMessage = {
        text: '🧪 *TEST ALERT* - OpenZeppelin Bond Monitoring System',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '🧪 *TEST ALERT*\nThis is a test notification from the OpenZeppelin Bond Monitoring System.\n\nIf you receive this message, Slack integration is working correctly!'
            }
          }
        ]
      };

      const result = await this.sendSlackMessage(testMessage);
      return result.success;
    } catch (error) {
      console.error('❌ Slack configuration test failed:', error.message);
      return false;
    }
  }
}

module.exports = SlackService; 