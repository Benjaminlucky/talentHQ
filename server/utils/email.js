// server/utils/email.js
// Uses Resend (https://resend.com) — reliable transactional email API.
// npm install resend
import { Resend } from "resend";

// ── Lazy Resend initialisation ─────────────────────────────────────────────
// We cannot validate or instantiate at module load time because ES module
// imports are hoisted and evaluated before dotenv.config() runs in index.js.
// env-check.js already enforces RESEND_API_KEY at startup — so by the time
// sendEmail() is ever called, the key is guaranteed to be present.
let _resend = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to your .env file. " +
          "Get a free key at https://resend.com",
      );
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "TalentHQ <noreply@talenthq.ng>";

const FRONTEND =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talenthq.netlify.app"
    : "http://localhost:3000");

// ── Shared HTML wrapper ────────────────────────────────────────────────────
function emailHtml(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TalentHQ</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f9fafb;
      padding: 40px 16px;
      color: #374151;
    }
    .wrapper {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    .header {
      background-color: #004b23;
      padding: 24px 32px;
    }
    .logo {
      font-size: 22px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .logo-accent { color: #7fba00; }
    .body {
      padding: 32px;
      line-height: 1.65;
    }
    .body h1 {
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 12px;
    }
    .body p {
      font-size: 15px;
      color: #4b5563;
      margin-bottom: 16px;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background-color: #004b23;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 15px;
      margin: 8px 0 24px;
    }
    .divider {
      border: none;
      border-top: 1px solid #f3f4f6;
      margin: 20px 0;
    }
    .note {
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.5;
    }
    .link-fallback {
      font-size: 12px;
      color: #9ca3af;
      word-break: break-all;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Talent<span class="logo-accent">HQ</span></div>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      © 2025 TalentHQ Nigeria · Lagos, Nigeria<br />
      <span style="color:#d1d5db">You're receiving this because you have an account on TalentHQ.</span>
    </div>
  </div>
</body>
</html>`;
}

// ── Internal send helper ───────────────────────────────────────────────────
// Wraps Resend's send call with logging and error normalisation.
async function sendEmail({ to, subject, html }) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) {
    // Resend returns structured errors — surface them clearly
    console.error("❌ Resend send error:", JSON.stringify(error));
    throw new Error(
      `Email delivery failed: ${error.message || JSON.stringify(error)}`,
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`📧 Email sent → ${to} | id: ${data?.id}`);
  }

  return data;
}

// ── Email verification ─────────────────────────────────────────────────────
export async function sendVerificationEmail(to, token) {
  const link = `${FRONTEND}/verify-email?token=${token}`;

  return sendEmail({
    to,
    subject: "Verify your TalentHQ email address",
    html: emailHtml(`
      <h1>Confirm your email</h1>
      <p>
        Thanks for signing up! Click the button below to verify your email
        address and fully activate your TalentHQ account.
      </p>
      <a href="${link}" class="btn">Verify Email Address</a>
      <hr class="divider" />
      <p class="note">This link expires in <strong>24 hours</strong>.</p>
      <p class="note">
        If you didn't create a TalentHQ account, you can safely ignore this email —
        no action is needed.
      </p>
      <p class="link-fallback">
        Link not working? Copy and paste this into your browser:<br />${link}
      </p>
    `),
  });
}

// ── Password reset ─────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to, token) {
  const link = `${FRONTEND}/reset-password?token=${token}`;

  return sendEmail({
    to,
    subject: "Reset your TalentHQ password",
    html: emailHtml(`
      <h1>Reset your password</h1>
      <p>
        We received a request to reset the password for your TalentHQ account.
        Click the button below to choose a new password.
      </p>
      <a href="${link}" class="btn">Reset Password</a>
      <hr class="divider" />
      <p class="note">This link expires in <strong>1 hour</strong>.</p>
      <p class="note">
        If you didn't request a password reset, you can safely ignore this email.
        Your password will not change.
      </p>
      <p class="link-fallback">
        Link not working? Copy and paste this into your browser:<br />${link}
      </p>
    `),
  });
}
