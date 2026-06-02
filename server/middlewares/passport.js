// server/middlewares/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

// ── BACKEND_URL ───────────────────────────────────────────────────────────────
// FIX 1: Removed hardcoded "talenthq-vl3n.onrender.com" fallback.
//         The correct production host is Railway.
// FIX 2: .replace(/\/+$/, "") strips any trailing slash from the env var.
//         A trailing slash makes the callback URL "railway.app//api/auth/..."
//         (double slash) which never matches the registered redirect URI in
//         Google/LinkedIn consoles — this was the root cause of all OAuth failures.
const BACKEND_URL = (
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talenthq-production.up.railway.app"
    : "http://localhost:5000")
).replace(/\/+$/, ""); // ← critical — strips trailing slash

// ── Find or create OAuth user ─────────────────────────────────────────────────
async function findOrCreateOAuthUser(profile, provider) {
  const email = profile.emails?.[0]?.value?.toLowerCase().trim();
  const fullName =
    profile.displayName ||
    `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
    "User";
  const avatar = profile.photos?.[0]?.value || "";
  const oauthId = profile.id;

  // 1. Existing account already linked to this provider
  const [jOAuth, hOAuth, eOAuth] = await Promise.all([
    Jobnode.findOne({ oauthProvider: provider, oauthId }),
    Handyman.findOne({ oauthProvider: provider, oauthId }),
    Employer.findOne({ oauthProvider: provider, oauthId }),
  ]);
  if (jOAuth || hOAuth || eOAuth) return jOAuth || hOAuth || eOAuth;

  // 2. Existing account with matching email — link OAuth to it
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

  // 3. Brand-new user — temp Jobnode, needsRoleSelection=true → /oauth/select-role
  return Jobnode.create({
    fullName,
    email: email || `${provider}_${oauthId}@oauth.placeholder`,
    password: `oauth_${provider}_${oauthId}_${Date.now()}`,
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
// Register this callback in Google Cloud Console:
// https://talenthq-production.up.railway.app/api/auth/google/callback
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      proxy: true,
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
// Register this callback in LinkedIn Developer Portal:
// https://talenthq-production.up.railway.app/api/auth/linkedin/callback
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
// Sessions are only used during the OAuth redirect dance.
// After handleOAuthCallback issues the httpOnly JWT cookie, regular requests
// use verifyToken (JWT) not the session.
passport.serializeUser((user, done) => done(null, user._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    const user =
      (await Jobnode.findById(id).lean()) ||
      (await Handyman.findById(id).lean()) ||
      (await Employer.findById(id).lean());
    done(null, user || false);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
