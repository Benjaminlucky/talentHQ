// server/utils/env-check.js
// Call this at the very top of index.js, before any other imports.
// Fail fast and loud at boot — silent runtime failures are worse.

const REQUIRED = [
  {
    key: "MONGO_URI",
    hint: "MongoDB connection string. Get one at https://cloud.mongodb.com",
  },
  {
    key: "JWT_SECRET",
    hint: "Random string, min 64 chars. Generate: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
  },
  {
    key: "RESEND_API_KEY",
    hint: "Get a free API key at https://resend.com — required for contact form, email verification, and password reset emails",
  },
];

const WARNINGS = [
  {
    key: "FRONTEND_URL",
    hint: "e.g. https://talenthq.buzz — used in email links. Defaults to localhost:3000 in dev.",
  },
  {
    key: "EMAIL_FROM",
    hint: "e.g. TalentHQ <noreply@talenthq.buzz> — the from address on all emails. Requires a verified Resend domain.",
  },
  {
    key: "ADMIN_EMAIL",
    hint: "e.g. hello@talenthq.buzz — where contact form submissions are emailed. Defaults to EMAIL_FROM if not set.",
  },
  {
    key: "PAYSTACK_SECRET_KEY",
    hint: "Get from dashboard.paystack.com → Settings → API Keys. Required for payment features.",
  },
];

export function checkEnv() {
  const missing = REQUIRED.filter(({ key }) => !process.env[key]);

  if (missing.length > 0) {
    console.error("\n❌ Missing required environment variables:\n");
    missing.forEach(({ key, hint }) => {
      console.error(`  ${key}`);
      console.error(`    → ${hint}\n`);
    });
    console.error(
      "Server cannot start. Add the above variables to your .env file or Render dashboard.\n",
    );
    process.exit(1);
  }

  // Warn about weak JWT_SECRET
  if ((process.env.JWT_SECRET || "").length < 32) {
    console.warn(
      "⚠️  JWT_SECRET is too short (< 32 chars). Use at least 64 random characters in production.",
    );
  }

  // Soft warnings for optional-but-important vars (only in production)
  const unset = WARNINGS.filter(({ key }) => !process.env[key]);
  if (unset.length > 0) {
    const env = process.env.NODE_ENV === "production" ? "production" : "dev";
    console.warn(`\n⚠️  These variables are unset (recommended for ${env}):`);
    unset.forEach(({ key, hint }) => console.warn(`  ${key}: ${hint}`));
    console.warn("");
  }

  console.log("✅ Environment variables validated");
}
