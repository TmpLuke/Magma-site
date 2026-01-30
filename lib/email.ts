"use server";

import { sendEmail } from "@/lib/resend";

export interface SendPurchaseEmailParams {
  customerEmail: string;
  orderNumber: string;
  productName: string;
  duration: string;
  licenseKey: string;
  expiresAt: Date;
  totalPaid: number;
}

export async function sendPurchaseEmail(params: SendPurchaseEmailParams) {
  try {
    const result = await sendEmail({
      to: params.customerEmail,
      subject: `Your Magma Cheats Order - ${params.orderNumber}`,
      html: generatePurchaseEmailHTML(params),
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return { success: true as const, emailId: result.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send email";
    return { success: false as const, error: msg };
  }
}

function generatePurchaseEmailHTML(params: SendPurchaseEmailParams): string {
  const expiryDate = params.expiresAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; overflow: hidden; border: 1px solid #1a1a1a;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">
                🔥 MAGMA CHEATS
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">
                Order Confirmation
              </p>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #1a1a1a;">
              <div style="display: inline-block; width: 64px; height: 64px; background-color: rgba(34, 197, 94, 0.1); border-radius: 50%; margin-bottom: 20px;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                Payment Successful!
              </h2>
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.6);">
                Your order has been confirmed and your license is ready to use.
              </p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                Order Details
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
                    <span style="color: rgba(255, 255, 255, 0.5); font-size: 14px;">Order Number</span>
                  </td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
                    <span style="color: #ffffff; font-weight: 600; font-family: monospace;">${params.orderNumber}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
                    <span style="color: rgba(255, 255, 255, 0.5); font-size: 14px;">Product</span>
                  </td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
                    <span style="color: #ffffff; font-weight: 600;">${params.productName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
                    <span style="color: rgba(255, 255, 255, 0.5); font-size: 14px;">Duration</span>
                  </td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
                    <span style="color: #ffffff; font-weight: 600;">${params.duration}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
                    <span style="color: rgba(255, 255, 255, 0.5); font-size: 14px;">Total Paid</span>
                  </td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
                    <span style="color: #22c55e; font-weight: 700; font-size: 18px;">$${params.totalPaid.toFixed(2)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- License Key -->
          <tr>
            <td style="padding: 30px; background-color: #0a0a0a; border-top: 1px solid #1a1a1a; border-bottom: 1px solid #1a1a1a;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                🔑 Your License Key
              </h3>
              <div style="background-color: #111111; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 12px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 1px;">
                  License Key
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #dc2626; font-family: monospace; letter-spacing: 2px; word-break: break-all;">
                  ${params.licenseKey}
                </p>
              </div>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.5); text-align: center;">
                Expires: ${expiryDate}
              </p>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                Next Steps
              </h3>
              <ol style="margin: 0; padding-left: 20px; color: rgba(255, 255, 255, 0.7); line-height: 1.8;">
                <li style="margin-bottom: 10px;">Download the cheat from your account dashboard</li>
                <li style="margin-bottom: 10px;">Follow the installation guide provided</li>
                <li style="margin-bottom: 10px;">Use your license key to activate the product</li>
                <li>Enjoy your enhanced gaming experience!</li>
              </ol>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding: 30px; background-color: #0a0a0a; border-top: 1px solid #1a1a1a; text-align: center;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                Need Help?
              </h3>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: rgba(255, 255, 255, 0.6);">
                Our support team is here to assist you 24/7
              </p>
              <a href="https://discord.gg/magmacheats" style="display: inline-block; padding: 12px 30px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                Join Discord
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #1a1a1a;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                © ${new Date().getFullYear()} Magma Cheats. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                This email was sent to ${params.customerEmail}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export interface SendPasswordResetEmailParams {
  email: string;
  username: string;
  resetLink: string;
}

export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams) {
  try {
    const result = await sendEmail({
      to: params.email,
      subject: "Reset Your Magma Cheats Password",
      html: generatePasswordResetEmailHTML(params),
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return { success: true as const, emailId: result.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send email";
    return { success: false as const, error: msg };
  }
}

function generatePasswordResetEmailHTML(params: SendPasswordResetEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; overflow: hidden; border: 1px solid #1a1a1a;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">
                🔥 MAGMA CHEATS
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">
                Password Reset Request
              </p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #1a1a1a;">
              <div style="display: inline-block; width: 64px; height: 64px; background-color: rgba(220, 38, 38, 0.1); border-radius: 50%; margin-bottom: 20px;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V17M12 9V13M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                Password Reset Request
              </h2>
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.6);">
                Hi ${params.username}, we received a request to reset your password.
              </p>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                Click the button below to reset your password. This link will expire in 1 hour for security reasons.
              </p>
              <p style="margin: 0 0 30px 0; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <div style="text-align: center;">
                <a href="${params.resetLink}" style="display: inline-block; padding: 16px 40px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
            </td>
          </tr>

          <!-- Alternative Link -->
          <tr>
            <td style="padding: 30px; background-color: #0a0a0a; border-top: 1px solid #1a1a1a;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 12px; color: #dc2626; word-break: break-all; font-family: monospace;">
                ${params.resetLink}
              </p>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #1a1a1a;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                Security Tips
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: rgba(255, 255, 255, 0.6); line-height: 1.8; font-size: 14px;">
                <li style="margin-bottom: 8px;">Never share your password with anyone</li>
                <li style="margin-bottom: 8px;">Use a strong, unique password</li>
                <li style="margin-bottom: 8px;">Enable two-factor authentication if available</li>
                <li>Contact support if you notice any suspicious activity</li>
              </ul>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding: 30px; background-color: #0a0a0a; border-top: 1px solid #1a1a1a; text-align: center;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                Need Help?
              </h3>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: rgba(255, 255, 255, 0.6);">
                Our support team is here to assist you 24/7
              </p>
              <a href="https://discord.gg/magmacheats" style="display: inline-block; padding: 12px 30px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                Join Discord
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #1a1a1a;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                © ${new Date().getFullYear()} Magma Cheats. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                This email was sent to ${params.email}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
