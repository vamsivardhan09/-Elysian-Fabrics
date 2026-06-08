import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendOtpEmail(email: string, code: string, name: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'Elysian Fabrics <vamsivardhan0918@gmail.com>',
    to: email,
    subject: 'Verify Your Email - Elysian Fabrics',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body {
              background-color: #fdfbf7;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 24px;
              padding: 48px;
              box-shadow: 0 10px 30px rgba(183, 110, 121, 0.05);
              border: 1px solid #f5eae4;
            }
            .logo {
              text-align: center;
              font-family: 'Playfair Display', 'Georgia', serif;
              font-size: 28px;
              color: #8c4f5a;
              letter-spacing: 2px;
              margin-bottom: 30px;
              font-weight: 700;
            }
            .header-image {
              width: 80px;
              height: 2px;
              background: linear-gradient(90deg, transparent, #b76e79, transparent);
              margin: 0 auto 30px auto;
            }
            h1 {
              font-family: 'Playfair Display', 'Georgia', serif;
              color: #2c1a1d;
              font-size: 24px;
              font-weight: 600;
              text-align: center;
              margin-bottom: 24px;
            }
            p {
              color: #5c4a4c;
              font-size: 15px;
              line-height: 1.6;
              margin-bottom: 24px;
              font-weight: 300;
            }
            .greeting {
              text-align: center;
              font-style: italic;
              color: #8c4f5a;
              font-size: 16px;
              margin-bottom: 30px;
              line-height: 1.5;
            }
            .otp-container {
              background-color: #fdfbf7;
              border: 1px dashed #b76e79;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-family: 'Courier New', Courier, monospace;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #8c4f5a;
              margin: 0;
            }
            .expiry-text {
              text-align: center;
              color: #a39092;
              font-size: 12px;
              margin-top: 10px;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #f5eae4;
              padding-top: 24px;
              text-align: center;
              font-size: 12px;
              color: #a39092;
              line-height: 1.5;
            }
            .signature {
              font-family: 'Playfair Display', 'Georgia', serif;
              color: #8c4f5a;
              font-weight: 600;
              margin-top: 24px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Elysian Fabrics</div>
            <div class="header-image"></div>
            <h1>Your Journey of Elegance Begins</h1>
            
            <p class="greeting">
              "Welcome to Elysian Fabrics, where every thread tells a story of elegance and grace. We are absolutely thrilled to welcome you to our family. You are one step away from discovering custom-tailored masterpieces crafted just for you."
            </p>
            
            <p>Hello ${name},</p>
            <p>Thank you for creating an account with us. To complete your registration and verify your email address, please use the secure 6-digit verification code below:</p>
            
            <div class="otp-container">
              <div class="otp-code">${code}</div>
              <div class="expiry-text">This code is valid for 10 minutes.</div>
            </div>
            
            <p>If you did not request this code, you can safely ignore this email. Your email will not be registered until the code is verified.</p>
            
            <div class="footer">
              <p>This is an automated message from Elysian Fabrics. Please do not reply directly to this email.</p>
              <div class="signature">With warmth and style,<br>The Elysian Fabrics Team</div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification OTP sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
    return false;
  }
}
