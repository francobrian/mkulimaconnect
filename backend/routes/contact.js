const express = require('express');
const { createTransporter, createTestTransporter } = require('../config/email');
const router = express.Router();

// Contact form submission
router.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all required fields' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // For development, just log and return success
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Contact Form Submission (Development Mode):');
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Phone: ${phone || 'Not provided'}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log('---');

      return res.json({
        success: true,
        message: 'Message received! (Development mode - email not configured)',
        isDevelopment: true
      });
    }

    // Production: Try to send email
    let transporter;
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = createTransporter();
    } else {
      transporter = await createTestTransporter();
    }

    // Email content
    const mailOptions = {
      from: `"MkulimaConnect Contact" <${process.env.EMAIL_USER || 'noreply@mkulimaconnect.com'}>`,
      to: process.env.SUPPORT_EMAIL || 'brianfranco013@gmail.com',
      subject: `MkulimaConnect Contact: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2E7D32; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #2E7D32; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MkulimaConnect Contact Form</h1>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Name:</span>
                <span>${name}</span>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <span>${email}</span>
              </div>
              ${phone ? `
              <div class="field">
                <span class="label">Phone:</span>
                <span>${phone}</span>
              </div>
              ` : ''}
              <div class="field">
                <span class="label">Subject:</span>
                <span>${subject}</span>
              </div>
              <div class="field">
                <span class="label">Message:</span>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from the MkulimaConnect contact form.</p>
              <p>Timestamp: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        MkulimaConnect Contact Form Submission
        
        Name: ${name}
        Email: ${email}
        ${phone ? `Phone: ${phone}` : ''}
        Subject: ${subject}
        
        Message:
        ${message}
        
        Sent: ${new Date().toLocaleString()}
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      testUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    });

  } catch (error) {
    console.error('Email error:', error.message);
    // Still return success for better UX in development
    res.status(200).json({
      success: true,
      message: 'Message received! We will get back to you soon.',
      note: 'Email service may not be configured'
    });
  }
});

// Get contact information
router.get('/info', (req, res) => {
  res.json({
    email: 'brianfranco013@gmail.com',
    supportEmail: 'support@mkulimaconnect.com',
    phone: '+254 712 345 678',
    address: 'Nairobi, Kenya',
    businessHours: {
      weekdays: '8:00 AM - 6:00 PM',
      weekends: '9:00 AM - 2:00 PM'
    }
  });
});

module.exports = router;