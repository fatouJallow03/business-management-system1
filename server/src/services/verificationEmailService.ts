
import { sendEmail } from "./emailService.js";
import { createEmailVerificationToken } from "./emailVerificationService.js";

/**
 * Escapes characters that have special meaning in HTML.
 *
 * @param value - Untrusted text.
 * @returns HTML-safe text.
 */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[character] ?? character;
  });
}

/**
 * Sends an email verification link to a Walo user.
 *
 * Generates a secure, single-use token and saves
 * its hash in PostgreSQL before requesting email delivery.
 *
 * @param userId - ID of the user being verified.
 * @param email - Recipient email address.
 * @param username - Username displayed in the email.
 */
export async function sendVerificationEmail(
  userId: string,
  email: string,
  username: string
): Promise<void> {
  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    throw new Error("CLIENT_URL is not configured.");
  }

  const token = await createEmailVerificationToken(userId);

  const verificationUrl = new URL(
    "/verify-email",
    clientUrl
  );

  verificationUrl.searchParams.set("token", token);

  const safeUsername = escapeHtml(username);
  const safeUrl = escapeHtml(verificationUrl.toString());

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport"
              content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="
        margin: 0;
        padding: 32px 16px;
        background-color: #F7F0E5;
        font-family: Arial, sans-serif;
        color: #342A25;
      ">
        <div style="
          max-width: 520px;
          margin: 0 auto;
          padding: 36px 28px;
          background-color: #FFFFFF;
          border-radius: 12px;
        ">
          <h1 style="
            color: #A64B32;
            font-size: 30px;
            margin-top: 0;
          ">
            Walo
          </h1>

          <h2>Verify your email address</h2>

          <p>Hello ${safeUsername},</p>

          <p>
            Welcome to Walo! Please verify your email
            address to help secure your business account.
          </p>

          <p style="margin: 32px 0;">
            <a href="${safeUrl}" style="
              display: inline-block;
              padding: 14px 24px;
              background-color: #A64B32;
              color: #FFFFFF;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            ">
              Verify email
            </a>
          </p>

          <p>
            This link expires in 30 minutes.
          </p>

          <p>
            If you did not create a Walo account,
            you can ignore this email.
          </p>

          <p style="
            margin-top: 32px;
            color: #8B7A6B;
            font-size: 13px;
          ">
            Walo — Business management made simple.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail(
    email,
    "Verify your Walo email address",
    html
  );
}
