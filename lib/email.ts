import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendBookingAcceptanceEmail(
  clientEmail: string,
  lawyerName: string,
  lawyerEmail: string,
  lawyerPhone: string,
  chargesPerHearing: number,
  hearingDate?: Date,
  hearingTime?: string
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lexconnect.com';
  
  const mailtoLink = `mailto:${lawyerEmail}?subject=Legal Consultation Request&body=Hello ${lawyerName},%0D%0A%0D%0AI would like to schedule a consultation with you.%0D%0A%0D%0AThank you.`;
  
  const dateTimeInfo = hearingDate && hearingTime 
    ? `<p><strong>Scheduled Date:</strong> ${new Date(hearingDate).toLocaleDateString()}</p>
       <p><strong>Scheduled Time:</strong> ${hearingTime}</p>`
    : '<p>Please contact the lawyer to schedule a date and time.</p>';

  const mailOptions = {
    from: `"LexConnect Admin" <${adminEmail}>`,
    to: clientEmail,
    subject: `Your Booking Request Has Been Accepted - ${lawyerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Accepted!</h1>
            </div>
            <div class="content">
              <p>Dear Client,</p>
              <p>Great news! Your booking request has been accepted by <strong>${lawyerName}</strong>.</p>
              
              <div class="info-box">
                <h3>Lawyer Details:</h3>
                <p><strong>Name:</strong> ${lawyerName}</p>
                <p><strong>Email:</strong> <a href="mailto:${lawyerEmail}">${lawyerEmail}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${lawyerPhone}">${lawyerPhone}</a></p>
                <p><strong>Charges per Hearing:</strong> ₹${chargesPerHearing}</p>
                ${dateTimeInfo}
              </div>

              <p>You can contact the lawyer directly using the button below:</p>
              <a href="${mailtoLink}" class="button">Contact Lawyer via Email</a>
              
              <p>Or call them at: <a href="tel:${lawyerPhone}">${lawyerPhone}</a></p>
              
              <p>Best regards,<br>LexConnect Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Your booking request has been accepted by ${lawyerName}.
      
      Lawyer Details:
      - Name: ${lawyerName}
      - Email: ${lawyerEmail}
      - Phone: ${lawyerPhone}
      - Charges per Hearing: ₹${chargesPerHearing}
      
      Contact the lawyer at: ${lawyerEmail} or ${lawyerPhone}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(subject: string, message: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { success: false, error: 'Admin email not configured' };

  const mailOptions = {
    from: `"LexConnect System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject,
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error };
  }
}

export async function sendBookingRejectionEmail(
  clientEmail: string,
  lawyerName: string,
  lawyerEmail: string,
  hearingDate?: Date,
  hearingTime?: string
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lexconnect.com';

  const dateTimeInfo = hearingDate && hearingTime
    ? `<p><strong>Requested Date:</strong> ${new Date(hearingDate).toLocaleDateString()}</p>
       <p><strong>Requested Time:</strong> ${hearingTime}</p>`
    : '<p>No specific date/time was provided.</p>';

  const mailOptions = {
    from: `"LexConnect Admin" <${adminEmail}>`,
    to: clientEmail,
    subject: `Booking Request Declined - ${lawyerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c; }
            .button { display: inline-block; padding: 12px 30px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Booking Declined</h1>
            </div>
            <div class="content">
              <p>Dear Client,</p>
              <p>We regret to inform you that your booking request with <strong>${lawyerName}</strong> has been declined.</p>
              
              <div class="info-box">
                <h3>Booking Details:</h3>
                <p><strong>Lawyer:</strong> ${lawyerName}</p>
                <p><strong>Email:</strong> <a href="mailto:${lawyerEmail}">${lawyerEmail}</a></p>
                ${dateTimeInfo}
              </div>

              <p>You may explore other available lawyers on our platform to proceed with your legal consultation.</p>
              <a href="https://lexconnect.com/lawyers" class="button">Find Another Lawyer</a>

              <p>We apologize for any inconvenience and appreciate your understanding.</p>
              <p>Best regards,<br>LexConnect Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Your booking request with ${lawyerName} has been declined.

      Lawyer Details:
      - Name: ${lawyerName}
      - Email: ${lawyerEmail}
      ${hearingDate ? `- Requested Date: ${new Date(hearingDate).toLocaleDateString()}` : ''}
      ${hearingTime ? `- Requested Time: ${hearingTime}` : ''}

      You can visit https://lexconnect.com/lawyers to find other available lawyers.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error };
  }
}
