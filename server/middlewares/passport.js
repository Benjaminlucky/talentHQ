// server/middlewares/passport.js
// Passport.js OAuth strategies for Google and LinkedIn.
// These plug into your existing JWT+cookie auth — no separate session system.
//
// npm install passport passport-google-oauth20 passport-linkedin-oauth2

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

// ── Startup guard ─────────────────────────────────────────────────────────────
const missingGoogle = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"].filter(
  (k) => !process.env[k],
);
const missingLinkedIn = ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"].filter(
  (k) => !process.env[k],
);

if (missingGoogle.length > 0) {
  console.warn(
    `⚠️  Google OAuth disabled — missing: ${missingGoogle.join(", ")}\n` +
      "   Get credentials at https://console.cloud.google.com/apis/credentials",
  );
}
if (missingLinkedIn.length > 0) {
  console.warn(
    `⚠️  LinkedIn OAuth disabled — missing: ${missingLinkedIn.join(", ")}\n` +
      "   Get credentials at https://www.linkedin.com/developers/apps",
  );
}

const BACKEND =
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talenthq-vl3n.onrender.com"
    : "http://localhost:5000");

// ── Helper: find or create a user from an OAuth profile ───────────────────────
async function findOrCreateOAuthUser(profile, provider) {
  const email = profile.emails?.[0]?.value?.toLowerCase().trim();
  const fullName =
    profile.displayName ||
    `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
    "User";
  const avatar = profile.photos?.[0]?.value || "";
  const oauthId = profile.id;

  // 1. Returning OAuth user — fastest path
  const [jOAuth, hOAuth, eOAuth] = await Promise.all([
    Jobnode.findOne({ oauthProvider: provider, oauthId }),
    Handyman.findOne({ oauthProvider: provider, oauthId }),
    Employer.findOne({ oauthProvider: provider, oauthId }),
  ]);
  const byOAuth = jOAuth || hOAuth || eOAuth;
  if (byOAuth) return byOAuth;

  // 2. Email matches an existing account → link OAuth to it
  if (email) {
    const [jEmail, hEmail, eEmail] = await Promise.all([
      Jobnode.findOne({ email }),
      Handyman.findOne({ email }),
      Employer.findOne({ email }),
    ]);
    const byEmail = jEmail || hEmail || eEmail;
    if (byEmail) {
      byEmail.oauthProvider = provider;
      byEmail.oauthId = oauthId;
      if (!byEmail.avatar && avatar) byEmail.avatar = avatar;
      byEmail.emailVerified = true;
      await byEmail.save();
      return byEmail;
    }
  }

  // 3. Brand new user — create as jobseeker by default
  //    They'll complete onboarding to set role/details
  return Jobnode.create({
    fullName,
    email: email || `${provider}_${oauthId}@oauth.placeholder`,
    password: `oauth_${provider}_no_password`, // never used — OAuth users can't log in with password
    role: "jobseeker",
    avatar,
    oauthProvider: provider,
    oauthId,
    emailVerified: true, // OAuth providers already confirm the email
    onboardingComplete: false,
  });
}

// ── Google ────────────────────────────────────────────────────────────────────
if (missingGoogle.length === 0) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND}/api/auth/google/callback`,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser(profile, "google");
          done(null, user);
        } catch (err) {
          console.error("❌ Google OAuth:", err.message);
          done(err, null);
        }
      },
    ),
  );
}

// ── LinkedIn ──────────────────────────────────────────────────────────────────
if (missingLinkedIn.length === 0) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: `${BACKEND}/api/auth/linkedin/callback`,
        scope: ["openid", "profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser(profile, "linkedin");
          done(null, user);
        } catch (err) {
          console.error("❌ LinkedIn OAuth:", err.message);
          done(err, null);
        }
      },
    ),
  );
}

// Passport requires these even when not using server sessions
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser((id, done) => done(null, { id }));

export default passport;
