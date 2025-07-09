const nodemailer = require('nodemailer');

/**
 * Email Notification Service
 * Handles email notifications for monitoring events
 */

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.fromEmail = process.env.SMTP_USER;
    this.toEmail = process.env.DEMO_EMAIL || 'compliance@financial-institution.com';
  }

  /**
   * Create email transporter
   */
  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Send blocked transfer notification
   */
  async sendBlockedTransferEmail(transferData) {
    const subject = '🚫 BLOCKED TRANSFER ALERT - Tokenized Bond';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
          <h1>🚫 TRANSFER BLOCKED</h1>
          <p>Unauthorized transfer attempt detected and blocked</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <h2>Transfer Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>From Address:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.from}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>To Address:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.to}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.amount} tokens</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Block Reason:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.reason}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Timestamp:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(transferData.timestamp).toLocaleString()}</td>
            </tr>
          </table>
          
          <h3>Action Taken</h3>
          <ul>
            <li>✅ Transfer automatically blocked by smart contract</li>
            <li>📊 Security event logged in audit trail</li>
            <li>🔍 Compliance team notified for review</li>
            <li>📋 Regulatory report generated</li>
          </ul>
          
          <h3>Next Steps</h3>
          <ol>
            <li>Review the blocked transfer in the compliance dashboard</li>
            <li>Investigate the source address for potential risks</li>
            <li>Update blacklist if necessary</li>
            <li>Generate regulatory report if required</li>
          </ol>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated alert from the OpenZeppelin Bond Monitoring System</p>
          <p>Contract: ${transferData.contractAddress}</p>
        </div>
      </div>
    `;

    return this.sendEmail(subject, html);
  }

  /**
   * Send overdue payment notification
   */
  async sendOverduePaymentEmail(paymentData) {
    const subject = '⚠️ OVERDUE PAYMENT ALERT - Tokenized Bond';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ffc107; color: white; padding: 20px; text-align: center;">
          <h1>⚠️ PAYMENT OVERDUE</h1>
          <p>Interest payment is overdue and requires immediate attention</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <h2>Payment Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment ID:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentData.paymentId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Due Date:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(paymentData.dueDate * 1000).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentData.amount} tokens</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Days Overdue:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentData.daysOverdue} days</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Grace Period:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentData.gracePeriod} hours</td>
            </tr>
          </table>
          
          <h3>Risk Assessment</h3>
          <ul>
            <li>🔴 <strong>High Risk:</strong> Payment default may trigger bond acceleration</li>
            <li>💰 <strong>Financial Impact:</strong> Potential loss of investor confidence</li>
            <li>📋 <strong>Regulatory Impact:</strong> May require regulatory reporting</li>
            <li>⚖️ <strong>Legal Impact:</strong> Could trigger legal proceedings</li>
          </ul>
          
          <h3>Immediate Actions Required</h3>
          <ol>
            <li>Review treasury reserves for payment capability</li>
            <li>Execute automatic payment if sufficient funds available</li>
            <li>Notify bondholders of payment status</li>
            <li>Prepare regulatory notifications if necessary</li>
          </ol>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated alert from the OpenZeppelin Bond Monitoring System</p>
          <p>Contract: ${paymentData.contractAddress}</p>
        </div>
      </div>
    `;

    return this.sendEmail(subject, html);
  }

  /**
   * Send payment enforcement notification
   */
  async sendPaymentEnforcedEmail(paymentData) {
    const subject = '✅ PAYMENT ENFORCED - Tokenized Bond';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
          <h1>✅ PAYMENT ENFORCED</h1>
          <p>Overdue payment has been automatically enforced</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <h2>Payment Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment ID:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentData.paymentId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount Paid:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentData.amount} tokens</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Transaction Hash:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentData.transactionHash}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Enforcement Time:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(paymentData.timestamp).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Method:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">Automatic from reserve</td>
            </tr>
          </table>
          
          <h3>Actions Completed</h3>
          <ul>
            <li>✅ Payment automatically executed from reserve funds</li>
            <li>📊 Transaction confirmed on blockchain</li>
            <li>📋 Payment records updated</li>
            <li>📧 Bondholders notified of payment</li>
            <li>📊 Compliance records updated</li>
          </ul>
          
          <h3>System Status</h3>
          <ul>
            <li>🟢 Bond payment status: UP TO DATE</li>
            <li>🟢 Default risk: MITIGATED</li>
            <li>🟢 Regulatory compliance: MAINTAINED</li>
            <li>🟢 Investor confidence: PRESERVED</li>
          </ul>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated notification from the OpenZeppelin Bond Monitoring System</p>
          <p>Contract: ${paymentData.contractAddress}</p>
        </div>
      </div>
    `;

    return this.sendEmail(subject, html);
  }

  /**
   * Send transfer notification
   */
  async sendTransferNotificationEmail(transferData) {
    const subject = `🔄 TRANSFER ${transferData.status} - Tokenized Bond`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${transferData.status === 'SUCCESSFUL' ? '#28a745' : '#dc3545'}; color: white; padding: 20px; text-align: center;">
          <h1>🔄 TRANSFER ${transferData.status}</h1>
          <p>${transferData.status === 'SUCCESSFUL' ? 'Transfer completed successfully' : 'Transfer was BLOCKED and did not go through.'}</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <h2>Transfer Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>From Address:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.from}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>To Address:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.to}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.amount} tokens</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.status}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Transaction Hash:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.transactionHash}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Block Number:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${transferData.blockNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(transferData.timestamp).toLocaleString()}</td>
            </tr>
            ${transferData.status === 'BLOCKED' ? `<tr><td style=\"padding: 8px; border: 1px solid #ddd;\"><strong>Block Reason:</strong></td><td style=\"padding: 8px; border: 1px solid #ddd;\">${transferData.reason}</td></tr>` : ''}
          </table>
          
          <h3>Monitoring Information</h3>
          <ul>
            <li>✅ Transfer event detected and logged</li>
            <li>📊 Compliance check completed</li>
            <li>📋 Audit trail updated</li>
            <li>🔍 Transaction details recorded</li>
          </ul>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated notification from the OpenZeppelin Bond Monitoring System</p>
          <p>Contract: ${transferData.contractAddress}</p>
        </div>
      </div>
    `;

    return this.sendEmail(subject, html);
  }

  /**
   * Send compliance violation notification
   */
  async sendComplianceViolationEmail(violationData) {
    const subject = '🚨 COMPLIANCE VIOLATION - Tokenized Bond';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
          <h1>🚨 COMPLIANCE VIOLATION</h1>
          <p>Regulatory compliance violation detected</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <h2>Violation Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Violation Type:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${violationData.violationType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Account:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${violationData.account}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Details:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${violationData.details}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Severity:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${violationData.severity}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Timestamp:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(violationData.timestamp).toLocaleString()}</td>
            </tr>
          </table>
          
          <h3>Enforcement Actions</h3>
          <ul>
            <li>🔒 Account frozen pending investigation</li>
            <li>📋 Regulatory report generated</li>
            <li>📧 Authorities notified</li>
            <li>📊 Audit trail updated</li>
          </ul>
          
          <h3>Required Actions</h3>
          <ol>
            <li>Review violation details in compliance dashboard</li>
            <li>Investigate account activity and history</li>
            <li>Determine appropriate enforcement actions</li>
            <li>Update regulatory authorities if required</li>
            <li>Document all actions taken</li>
          </ol>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated alert from the OpenZeppelin Bond Monitoring System</p>
          <p>Contract: ${violationData.contractAddress}</p>
        </div>
      </div>
    `;

    return this.sendEmail(subject, html);
  }

  /**
   * Send email
   */
  async sendEmail(subject, html) {
    try {
      const mailOptions = {
        from: this.fromEmail,
        to: this.toEmail,
        subject: subject,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent successfully: ${subject}`);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      // Don't throw error, just log it and continue
      console.log('📧 Email simulation: Would have sent notification');
      return { success: false, error: error.message };
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration() {
    try {
      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Email configuration failed:', error);
      return false;
    }
  }
}

module.exports = EmailService; 