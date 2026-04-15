// server/middlewares/passport.js
// npm install passport passport-google-oauth20 passport-linkedin-oauth2

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

// Resolved once at startup (after dotenv is loaded via --require ./env-loader.js)
const BACKEND_URL =
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talenthq-vl3n.onrender.com"
    : "http://localhost:5000");

async function findOrCreateOAuthUser(profile, provider) {
  const email = profile.emails?.[0]?.value?.toLowerCase().trim();
  const fullName =
    profile.displayName ||
    `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
    "User";
  const avatar = profile.photos?.[0]?.value || "";
  const oauthId = profile.id;

  // 1. Check all collections for an existing OAuth-linked account
  const [jOAuth, hOAuth, eOAuth] = await Promise.all([
    Jobnode.findOne({ oauthProvider: provider, oauthId }),
    Handyman.findOne({ oauthProvider: provider, oauthId }),
    Employer.findOne({ oauthProvider: provider, oauthId }),
  ]);
  if (jOAuth || hOAuth || eOAuth) return jOAuth || hOAuth || eOAuth;

  // 2. Check all collections for an existing email-based account and link it
  if (email) {
    const [jEmail, hEmail, eEmail] = await Promise.all([
      Jobnode.findOne({ email }),
      Handyman.findOne({ email }),
      Employer.findOne({ email }),
    ]);
    const existing = jEmail || hEmail || eEmail;
    if (existing) {
      existing.oauthProvider = provider;
      existing.oauthId = oauthId;
      if (!existing.avatar && avatar) existing.avatar = avatar;
      existing.emailVerified = true;
      await existing.save();
      return existing;
    }
  }

  // 3. Brand-new user — create a temporary Jobnode record.
  //    needsRoleSelection=true sends them to /oauth/select-role after login.
  return Jobnode.create({
    fullName,
    email: email || `${provider}_${oauthId}@oauth.placeholder`,
    password: `oauth_${provider}_${Date.now()}`,
    role: "jobseeker",
    avatar,
    oauthProvider: provider,
    oauthId,
    emailVerified: true,
    onboardingComplete: false,
    needsRoleSelection: true,
  });
}

// ── Google Strategy ───────────────────────────────────────────────────────────
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      proxy: true, // trust X-Forwarded-Proto from Render's reverse proxy
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser(profile, "google");
        done(null, user);
      } catch (err) {
        console.error("❌ Google OAuth error:", err.message);
        done(err, null);
      }
    },
  ),
);

// ── LinkedIn Strategy ─────────────────────────────────────────────────────────
passport.use(
  "linkedin",
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/linkedin/callback`,
      scope: ["openid", "profile", "email"],
      proxy: true,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser(profile, "linkedin");
        done(null, user);
      } catch (err) {
        console.error("❌ LinkedIn OAuth error:", err.message);
        done(err, null);
      }
    },
  ),
);

// ── Session serialization ─────────────────────────────────────────────────────
// Only used during the OAuth redirect dance — JWT takes over after that.
passport.serializeUser((user, done) => done(null, user._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    const user =
      (await Jobnode.findById(id).lean()) ||
      (await Handyman.findById(id).lean()) ||
      (await Employer.findById(id).lean());
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
