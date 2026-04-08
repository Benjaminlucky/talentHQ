// server/utils/env-check.js
// Call this at the very top of index.js, before any other imports.
// A server that starts with missing config will silently fail at runtime
// in the worst possible moment. Fail fast and loud at boot instead.

const REQUIRED = [
  {
    key: "MONGO_URI",
    hint: "MongoDB connection string. Get one at https://cloud.mongodb.com",
  },
  {
    key: "JWT_SECRET",
    hint: "Random string, min 64 characters. Generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
  },
  {
    key: "RESEND_API_KEY",
    hint: "Get a free API key at https://resend.com — required for email verification and password reset",
  },
];

const WARNINGS = [
  {
    key: "FRONTEND_URL",
    hint: "e.g. https://talenthq.netlify.app — used in email links. Defaults to localhost:3000 in dev.",
  },
  {
    key: "EMAIL_FROM",
    hint: "e.g. TalentHQ <noreply@talenthq.ng> — the from address on all emails. Requires a verified Resend domain.",
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
      "Server cannot start. Add the above variables to your .env file.\n",
    );
    process.exit(1);
  }

  // Warn about weak JWT_SECRET
  const secret = process.env.JWT_SECRET || "";
  if (secret.length < 32) {
    console.warn(
      "⚠️  JWT_SECRET is too short (< 32 chars). Use at least 64 random characters in production.",
    );
  }

  // Soft warnings for optional-but-important vars
  const unset = WARNINGS.filter(({ key }) => !process.env[key]);
  if (unset.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(
      "\n⚠️  These variables are unset (non-fatal, but recommended for production):",
    );
    unset.forEach(({ key, hint }) => {
      console.warn(`  ${key}: ${hint}`);
    });
    console.warn("");
  }

  console.log("✅ Environment variables validated");
}
