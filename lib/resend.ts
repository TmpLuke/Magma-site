/**
 * Central Resend config. All email sending goes through this.
 * Env: RESEND_API_KEY (required), RESEND_FROM_EMAIL (optional).
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "Magma <onboarding@resend.dev>";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set. Add it to your .env file.");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export function getResendFrom(): string {
  return fromEmail;
}

export function isResendConfigured(): boolean {
  return Boolean(apiKey);
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    if (!isResendConfigured()) {
      return { success: false, error: "RESEND_API_KEY is not set. Add it to your .env file." };
    }

    const client = getResend();
    const to = Array.isArray(params.to) ? params.to : [params.to];

    const { data, error } = await client.emails.send({
      from: fromEmail,
      to,
      subject: params.subject,
      html: params.html,
      ...(params.text && { text: params.text }),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id ?? "unknown" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send email";
    return { success: false, error: msg };
  }
}
