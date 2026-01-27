import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email sending API route
// This processes emails from the outbound_emails queue

interface EmailTemplateData {
  orderNumber: string;
  productName: string;
  duration: string;
  licenseKey: string;
  expiresAt: string;
  totalPaid: string;
}

// HTML Email template for purchase confirmation
function generatePurchaseConfirmationEmail(data: EmailTemplateData): string {
  const formattedExpiry = new Date(data.expiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Magma Cheats Order</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #111111; border-radius: 16px; border: 1px solid #262626; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(to right, rgba(220, 38, 38, 0.2), transparent); padding: 32px; border-bottom: 1px solid #262626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">MAGMA</h1>
                    <p style="margin: 4px 0 0; color: #dc2626; font-size: 14px;">Premium Gaming Solutions</p>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 8px 16px; border-radius: 20px; font-size: 14px;">Payment Successful</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <!-- Greeting -->
              <p style="color: #ffffff; font-size: 18px; margin: 0 0 24px;">Thank you for your purchase!</p>
              
              <!-- Order Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; margin: 0 0 8px;">Order Number</p>
                    <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 0;">${data.orderNumber}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Product Info -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; margin: 0 0 12px;">Product Details</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: rgba(255,255,255,0.8); padding: 8px 0;">Product</td>
                        <td align="right" style="color: #ffffff; font-weight: 500;">${data.productName}</td>
                      </tr>
                      <tr>
                        <td style="color: rgba(255,255,255,0.8); padding: 8px 0;">Duration</td>
                        <td align="right" style="color: #ffffff; font-weight: 500;">${data.duration}</td>
                      </tr>
                      <tr>
                        <td style="color: rgba(255,255,255,0.8); padding: 8px 0;">Expires</td>
                        <td align="right" style="color: #ffffff; font-weight: 500;">${formattedExpiry}</td>
                      </tr>
                      <tr>
                        <td style="color: rgba(255,255,255,0.8); padding: 8px 0; border-top: 1px solid #262626; padding-top: 16px;">Total Paid</td>
                        <td align="right" style="color: #dc2626; font-weight: bold; font-size: 20px; border-top: 1px solid #262626; padding-top: 16px;">$${data.totalPaid}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- License Key Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(to right, rgba(220, 38, 38, 0.1), transparent); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; margin: 0 0 12px;">Your License Key</p>
                    <p style="color: #dc2626; font-size: 24px; font-weight: bold; font-family: 'Courier New', monospace; margin: 0; letter-spacing: 2px;">${data.licenseKey}</p>
                    <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 16px 0 0;">Save this key securely. You will need it to activate your product.</p>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px;">Next Steps:</p>
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #dc2626; font-weight: bold; padding-right: 12px; vertical-align: top;">1.</td>
                        <td style="color: rgba(255,255,255,0.8); padding-bottom: 8px;">Download the loader from our website or Discord</td>
                      </tr>
                      <tr>
                        <td style="color: #dc2626; font-weight: bold; padding-right: 12px; vertical-align: top;">2.</td>
                        <td style="color: rgba(255,255,255,0.8); padding-bottom: 8px;">Run the loader as Administrator</td>
                      </tr>
                      <tr>
                        <td style="color: #dc2626; font-weight: bold; padding-right: 12px; vertical-align: top;">3.</td>
                        <td style="color: rgba(255,255,255,0.8); padding-bottom: 8px;">Enter your license key when prompted</td>
                      </tr>
                      <tr>
                        <td style="color: #dc2626; font-weight: bold; padding-right: 12px; vertical-align: top;">4.</td>
                        <td style="color: rgba(255,255,255,0.8);">Enjoy your premium experience!</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="https://discord.gg/magmacheats" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600;">Join Our Discord</a>
                  </td>
                </tr>
              </table>
              
              <!-- Support Note -->
              <p style="color: rgba(255,255,255,0.5); font-size: 14px; text-align: center; margin: 0;">
                Need help? Contact our support team on Discord or reply to this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 24px; border-top: 1px solid #262626; text-align: center;">
              <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Magma Cheats. All rights reserved.
              </p>
              <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 8px 0 0;">
                This email was sent to confirm your purchase. Please do not share your license key with others.
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

// Plain text version
function generatePlainTextEmail(data: EmailTemplateData): string {
  const formattedExpiry = new Date(data.expiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
MAGMA CHEATS - ORDER CONFIRMATION
================================

Thank you for your purchase!

ORDER DETAILS
-------------
Order Number: ${data.orderNumber}
Product: ${data.productName}
Duration: ${data.duration}
Expires: ${formattedExpiry}
Total Paid: $${data.totalPaid}

YOUR LICENSE KEY
----------------
${data.licenseKey}

Save this key securely. You will need it to activate your product.

NEXT STEPS
----------
1. Download the loader from our website or Discord
2. Run the loader as Administrator
3. Enter your license key when prompted
4. Enjoy your premium experience!

Need help? Join our Discord: https://discord.gg/magmacheats

© ${new Date().getFullYear()} Magma Cheats. All rights reserved.
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get pending emails from the queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("outbound_emails")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error("[Email] Error fetching pending emails:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch pending emails" },
        { status: 500 }
      );
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({ success: true, message: "No pending emails", processed: 0 });
    }

    const results = [];

    for (const email of pendingEmails) {
      try {
        // Mark as processing
        await supabase
          .from("outbound_emails")
          .update({ status: "processing" })
          .eq("id", email.id);

        // Generate email content based on template
        let htmlContent = "";
        let textContent = "";

        if (email.template === "purchase_confirmation" && email.template_data) {
          const templateData = email.template_data as EmailTemplateData;
          htmlContent = generatePurchaseConfirmationEmail(templateData);
          textContent = generatePlainTextEmail(templateData);
        }

        // Send email using Resend or other email service
        // For now, we'll use a simple fetch to Resend API if available
        const resendApiKey = process.env.RESEND_API_KEY;

        if (resendApiKey) {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || "Magma Cheats <noreply@magmacheats.com>",
              to: email.to_email,
              subject: email.subject,
              html: htmlContent,
              text: textContent,
            }),
          });

          if (response.ok) {
            // Mark as sent
            await supabase
              .from("outbound_emails")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
              })
              .eq("id", email.id);

            results.push({ id: email.id, status: "sent" });
          } else {
            const errorData = await response.json();
            console.error("[Email] Resend error:", errorData);

            // Mark as failed
            await supabase
              .from("outbound_emails")
              .update({
                status: "failed",
                error_message: JSON.stringify(errorData),
              })
              .eq("id", email.id);

            results.push({ id: email.id, status: "failed", error: errorData });
          }
        } else {
          // No email service configured, mark as sent (demo mode)
          console.log("[Email] No RESEND_API_KEY configured, simulating send to:", email.to_email);
          
          await supabase
            .from("outbound_emails")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              error_message: "Demo mode - no email service configured",
            })
            .eq("id", email.id);

          results.push({ id: email.id, status: "sent (demo mode)" });
        }
      } catch (emailError) {
        console.error("[Email] Error processing email:", email.id, emailError);

        await supabase
          .from("outbound_emails")
          .update({
            status: "failed",
            error_message: String(emailError),
          })
          .eq("id", email.id);

        results.push({ id: email.id, status: "failed", error: String(emailError) });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("[Email] API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check email queue status
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: stats } = await supabase
      .from("outbound_emails")
      .select("status")
      .then((result) => {
        if (!result.data) return { data: null };
        
        const counts = result.data.reduce(
          (acc, email) => {
            acc[email.status] = (acc[email.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );
        
        return { data: counts };
      });

    return NextResponse.json({
      success: true,
      stats: stats || { pending: 0, processing: 0, sent: 0, failed: 0 },
    });
  } catch (error) {
    console.error("[Email] Stats Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
