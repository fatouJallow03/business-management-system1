
import { Resend } from "resend";

/**
 * Sends transactional emails through Resend.
 *
 * This service can be reused for account verification,
 * password resets, and future Walo notifications.
 *
 * @param to - Recipient email address.
 * @param subject - Email subject line.
 * @param html - Email content in HTML format.
 * @throws Error if email delivery cannot be requested.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Email service is not configured.");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

 if (error) {
  console.error("Resend email delivery failed:", {
    name: error.name,
    message: error.message,
  });

  throw new Error("Unable to send email.");
}
}
