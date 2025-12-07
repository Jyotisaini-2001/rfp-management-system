import nodemailer from 'nodemailer';

export class EmailService {
  private static getTransporter() {
    // Check if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('Email not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env file');
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send RFP to a vendor via email
   */
  static async sendRFP(vendorEmail: string, vendorName: string, rfp: any) {
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 5px; }
    .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-top: 20px; }
    .item { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f0f0f0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Request for Proposal</h1>
      <p>${rfp.title}</p>
    </div>

    <div class="content">
      <h2>Dear ${vendorName},</h2>
      <p>We are inviting you to submit a proposal for the following requirement:</p>

      <div class="item">
        <h3>Items Required:</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${rfp.items.map((item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${Object.entries(item.specifications).map(([k, v]) => `${k}: ${v}`).join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="item">
        <h3>Budget:</h3>
        <p><strong>${rfp.budget.currency} ${rfp.budget.amount.toLocaleString()}</strong></p>
      </div>

      <div class="item">
        <h3>Timeline:</h3>
        <p><strong>Response Deadline:</strong> ${rfp.timeline.responseDeadline}</p>
        <p><strong>Delivery Deadline:</strong> ${rfp.timeline.deliveryDeadline}</p>
      </div>

      <div class="item">
        <h3>Terms & Requirements:</h3>
        <p><strong>Payment Terms:</strong> ${rfp.terms.paymentTerms}</p>
        <p><strong>Warranty:</strong> ${rfp.terms.warranty}</p>
        ${rfp.requirements.length > 0 ? `
          <p><strong>Additional Requirements:</strong></p>
          <ul>
            ${rfp.requirements.map((req: string) => `<li>${req}</li>`).join('')}
          </ul>
        ` : ''}
      </div>

      <p style="margin-top: 20px;">
        Please submit your proposal by replying to this email with your best offer including:
      </p>
      <ul>
        <li>Item-wise pricing</li>
        <li>Total cost</li>
        <li>Delivery timeline</li>
        <li>Payment terms</li>
        <li>Warranty details</li>
        <li>Any other relevant information</li>
      </ul>
    </div>

    <div class="footer">
      <p>This is an automated email from the RFP Management System.</p>
      <p>Please reply to this email with your proposal.</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: vendorEmail,
        subject: `RFP: ${rfp.title}`,
        html: emailHtml,
      });

      console.log('✅ Email sent successfully:', info.messageId);
      console.log('   To:', vendorEmail);
      console.log('   Subject:', `RFP: ${rfp.title}`);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('❌ Error sending email:', error.message);
      if (error.code === 'EAUTH') {
        throw new Error('Email authentication failed. Check your SMTP_USER and SMTP_PASSWORD in .env file');
      } else if (error.code === 'ECONNECTION') {
        throw new Error(`Cannot connect to SMTP server (${process.env.SMTP_HOST}). Check SMTP_HOST and SMTP_PORT in .env file`);
      } else {
        throw new Error(`Failed to send email: ${error.message}`);
      }
    }
  }

  /**
   * Verify email configuration
   */
  static async verifyConnection() {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log('✅ Email server is ready to send messages');
      return true;
    } catch (error: any) {
      console.error('❌ Email server connection error:', error.message);
      return false;
    }
  }
}
