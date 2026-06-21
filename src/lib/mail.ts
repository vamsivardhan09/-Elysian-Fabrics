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

export async function sendOrderConfirmationEmail(order: any, shopSettings: { shopName: string; shopAddress: string; contactPhone: string }) {
  let itemsHtml = '';
  let customInstructionsHtml = '';

  const items = order.items || [];
  for (const item of items) {
    const productName = item.product?.name || 'Custom Garment Service';
    itemsHtml += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f5eae4; font-size: 14px; color: #2c1a1d;">
          <strong>${productName}</strong><br>
          <span style="font-size: 11px; color: #a39092;">
            ${item.selectedSize ? `Size: ${item.selectedSize}` : ''} 
            ${item.selectedColor ? `| Color: ${item.selectedColor}` : ''}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #f5eae4; font-size: 14px; color: #2c1a1d; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #f5eae4; font-size: 14px; color: #2c1a1d; text-align: right; font-weight: bold;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>
    `;

    if (item.customization) {
      try {
        const cust = JSON.parse(item.customization);
        if (cust.type === 'custom_stitching') {
          let measurementsRows = '';
          Object.entries(cust.measurements).forEach(([k, v]) => {
            measurementsRows += `
              <tr style="border-bottom: 1px solid #fcf9f7;">
                <td style="padding: 6px; font-weight: 500; color: #5c4a4c; text-transform: capitalize;">${k.replace(/([A-Z])/g, ' $1')}</td>
                <td style="padding: 6px; color: #2c1a1d; text-align: right;">${v} inches</td>
              </tr>
            `;
          });
          customInstructionsHtml += `
            <div style="margin-top: 20px; background-color: #fdfbf7; border: 1px solid #f5eae4; border-radius: 12px; padding: 16px;">
              <h3 style="margin-top: 0; color: #8c4f5a; font-family: 'Playfair Display', serif; font-size: 15px;">Bespoke Measurements for ${productName}:</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                ${measurementsRows}
              </table>
            </div>
          `;
        } else if (cust.type === 'send_material') {
          customInstructionsHtml += `
            <div style="margin-top: 20px; background-color: #fff5f5; border: 1px solid #ffe3e3; border-radius: 12px; padding: 16px;">
              <h3 style="margin-top: 0; color: #c53030; font-family: 'Playfair Display', serif; font-size: 15px;">Material Shipping Instructions:</h3>
              <p style="font-size: 13px; color: #742a2a; margin-bottom: 10px; line-height: 1.5;">
                You opted to send your own material for <strong>${productName}</strong>. 
                Our team noticed you registered courier details: <strong>${cust.courierName} (Tracking ID: ${cust.courierTracking})</strong>.
              </p>
              <p style="font-size: 12px; color: #742a2a; line-height: 1.5;">
                Please print/write the Order ID <strong>${order.trackingId}</strong> bold on your package outer layer and place the order slip inside the package. Ship to:
              </p>
              <div style="background-color: #ffffff; border: 1px solid #f5eae4; padding: 10px; border-radius: 8px; font-size: 12px; color: #2c1a1d; font-family: monospace; margin-top: 8px;">
                <strong>${shopSettings.shopName}</strong><br>
                ${shopSettings.shopAddress}<br>
                Phone: ${shopSettings.contactPhone}
              </div>
            </div>
          `;
        }
      } catch (e) {
        customInstructionsHtml += `
          <div style="margin-top: 20px; background-color: #fdfbf7; border: 1px solid #f5eae4; border-radius: 12px; padding: 16px;">
            <h3 style="margin-top: 0; color: #8c4f5a; font-family: 'Playfair Display', serif; font-size: 15px;">Styling Specifications:</h3>
            <p style="font-size: 13px; color: #2c1a1d; line-height: 1.5;">${item.customization}</p>
          </div>
        `;
      }
    }
  }

  const isCustomized = items.some((item: any) => !!item.customization);
  const deliveryTimeStr = isCustomized ? "7 to 10 Business Days (including tailor styling)" : "3 to 5 Business Days";

  const mailOptions = {
    from: process.env.SMTP_FROM || 'Elysian Fabrics <vamsivardhan0918@gmail.com>',
    to: order.customerEmail,
    subject: `Order Confirmed - ${order.trackingId} - Elysian Fabrics`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmed</title>
          <style>
            body { background-color: #fdfbf7; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #f5eae4; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .logo { text-align: center; font-size: 26px; color: #8c4f5a; font-family: serif; letter-spacing: 2px; margin-bottom: 24px; font-weight: bold; }
            .divider { height: 1px; background-color: #f5eae4; margin: 20px 0; }
            h1 { font-size: 22px; color: #2c1a1d; text-align: center; margin-bottom: 20px; font-family: serif; }
            p { font-size: 14px; color: #5c4a4c; line-height: 1.6; }
            .order-summary-box { background-color: #fcfaf8; border-radius: 16px; padding: 20px; margin: 24px 0; border: 1px solid #fcf7f5; }
            .tracking-id { font-size: 20px; font-weight: bold; color: #8c4f5a; font-family: monospace; letter-spacing: 1px; text-align: center; margin-top: 10px; }
            .footer { font-size: 11px; text-align: center; color: #a39092; margin-top: 40px; border-top: 1px solid #f5eae4; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Elysian Fabrics</div>
            <h1>Your Custom Order has been Booked!</h1>
            <p>Dear ${order.customerName},</p>
            <p>We are delighted to confirm your order. Below is a summary of your purchases and customization requests. Your payment mode is <strong>Cash on Delivery (COD)</strong>.</p>
            
            <div class="order-summary-box">
              <p style="margin: 0; text-align: center; font-size: 12px; color: #a39092; text-transform: uppercase;">Order Tracking ID</p>
              <div class="tracking-id">${order.trackingId}</div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #fcf9f7; border-bottom: 2px solid #f5eae4;">
                  <th style="padding: 12px; text-align: left; font-size: 12px; color: #8c4f5a; font-weight: bold;">Product Details</th>
                  <th style="padding: 12px; text-align: center; font-size: 12px; color: #8c4f5a; font-weight: bold;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-size: 12px; color: #8c4f5a; font-weight: bold;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px 12px 4px 12px; text-align: right; font-size: 13px; color: #5c4a4c;">Subtotal:</td>
                  <td style="padding: 12px 12px 4px 12px; text-align: right; font-size: 13px; color: #2c1a1d; font-weight: bold;">₹${(order.total >= 999 ? order.total : order.total - 99).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 4px 12px 12px 12px; text-align: right; font-size: 13px; color: #5c4a4c;">Delivery:</td>
                  <td style="padding: 4px 12px 12px 12px; text-align: right; font-size: 13px; color: #2c1a1d; font-weight: bold;">${order.total >= 999 ? 'FREE' : '₹99'}</td>
                </tr>
                <tr style="border-top: 1px solid #f5eae4;">
                  <td colspan="2" style="padding: 12px; text-align: right; font-size: 15px; color: #8c4f5a; font-weight: bold;">Total Amount Payable:</td>
                  <td style="padding: 12px; text-align: right; font-size: 16px; color: #8c4f5a; font-weight: bold;">₹${order.total.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>

            ${customInstructionsHtml}

            <div class="divider"></div>
            <p><strong>Shipping Details:</strong><br>
            ${order.customerName}<br>
            ${order.address}</p>

            <p><strong>Expected Delivery:</strong><br>
            ${deliveryTimeStr}</p>

            <div class="footer">
              <p>For any queries, please reach out to our team at ${shopSettings.contactPhone}.</p>
              <p>&copy; ${new Date().getFullYear()} Elysian Fabrics. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${order.customerEmail}`);
    return true;
  } catch (error) {
    console.error(`Failed to send order email:`, error);
    return false;
  }
}
