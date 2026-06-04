// server/middlewares/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

// ── BACKEND_URL ───────────────────────────────────────────────────────────────
// .replace(/\/+$/, "") strips any trailing slash from the env var. A trailing
// slash makes the callback URL "railway.app//api/auth/..." (double slash) which
// never matches the redirect URI registered in the Google/LinkedIn consoles.
const BACKEND_URL = (
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talenthq-production.up.railway.app"
    : "http://localhost:5000")
).replace(/\/+$/, "");

// ── Find or create OAuth user ─────────────────────────────────────────────────
// `requestedRole` (optional) is the role the user picked on the signup page
// BEFORE being sent to the provider. When present and valid, a brand-new user
// is created directly in the correct collection — no /oauth/select-role detour.
// When absent (e.g. they came from the generic login button), the user is
// created as a temporary Jobnode with needsRoleSelection=true and is sent to
// /oauth/select-role to choose.
async function findOrCreateOAuthUser(profile, provider, requestedRole) {
  // Robust email extraction across Google (passport-google-oauth20) and
  // LinkedIn (passport-openidconnect). Different strategies expose the email
  // in different shapes, so we check all of them.
  const email = (
    profile.emails?.[0]?.value ||
    profile._json?.email ||
    profile.email ||
    ""
  )
    .toLowerCase()
    .trim();

  const fullName =
    profile.displayName ||
    [profile.name?.givenName, profile.name?.familyName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    profile._json?.name ||
    "User";

  const avatar = profile.photos?.[0]?.value || profile._json?.picture || "";
  const oauthId = profile.id;

  // 1. Existing account already linked to this provider
  const [jOAuth, hOAuth, eOAuth] = await Promise.all([
    Jobnode.findOne({ oauthProvider: provider, oauthId }),
    Handyman.findOne({ oauthProvider: provider, oauthId }),
    Employer.findOne({ oauthProvider: provider, oauthId }),
  ]);
  if (jOAuth || hOAuth || eOAuth) return jOAuth || hOAuth || eOAuth;

  // 2. Existing account with matching email — link OAuth to it (login path)
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

  // 3. Brand-new user.
  const validRole = ["jobseeker", "handyman", "employer"].includes(
    requestedRole,
  )
    ? requestedRole
    : null;

  const base = {
    fullName,
    email: email || `${provider}_${oauthId}@oauth.placeholder`,
    password: `oauth_${provider}_${oauthId}_${Date.now()}`,
    avatar,
    oauthProvider: provider,
    oauthId,
    emailVerified: true,
    onboardingComplete: false,
  };

  // 3a. Role was pre-selected on the signup page → create in the right place.
  if (validRole === "employer") {
    return Employer.create({
      ...base,
      role: "employer",
      needsRoleSelection: false,
    });
  }
  if (validRole === "handyman") {
    return Handyman.create({
      ...base,
      role: "handyman",
      needsRoleSelection: false,
    });
  }
  if (validRole === "jobseeker") {
    return Jobnode.create({
      ...base,
      role: "jobseeker",
      needsRoleSelection: false,
    });
  }

  // 3b. No role chosen yet → temp Jobnode, flagged for /oauth/select-role.
  return Jobnode.create({
    ...base,
    role: "jobseeker",
    needsRoleSelection: true,
  });
}

// Pull the requested role out of the OAuth `state` param (set when we kicked
// off the flow). passReqToCallback gives us the request as the first arg.
function roleFromReq(req) {
  const r = req?.query?.state;
  return ["jobseeker", "handyman", "employer"].includes(r) ? r : null;
}

// ── Google Strategy ───────────────────────────────────────────────────────────
// Register in Google Cloud Console:
//   https://talenthq-production.up.railway.app/api/auth/google/callback
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      proxy: true,
      passReqToCallback: true,
    },
    async (req, _accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser(
          profile,
          "google",
          roleFromReq(req),
        );
        done(null, user);
      } catch (err) {
        console.error("❌ Google OAuth error:", err.message);
        done(err, null);
      }
    },
  ),
);

// ── LinkedIn Strategy (OpenID Connect) ────────────────────────────────────────
// LinkedIn migrated to OpenID Connect and shut down the old v2 profile APIs that
// passport-linkedin-oauth2 relied on — that package fails on every login now.
// passport-openidconnect uses LinkedIn's current OIDC endpoints instead.
// Register in the LinkedIn Developer Portal (Auth tab):
//   https://talenthq-production.up.railway.app/api/auth/linkedin/callback
// and enable the "Sign In with LinkedIn using OpenID Connect" product.
passport.use(
  "linkedin",
  new OpenIDConnectStrategy(
    {
      issuer: "https://www.linkedin.com/oauth",
      authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
      tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
      userInfoURL: "https://api.linkedin.com/v2/userinfo",
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/linkedin/callback`,
      scope: ["openid", "profile", "email"],
      passReqToCallback: true,
    },
    // The number of args passport-openidconnect passes varies with the option
    // set, but `done` is always last and the profile object carries id /
    // displayName / emails. Normalise by taking those two explicitly.
    async (req, issuer, profile, ...rest) => {
      const done = rest[rest.length - 1];
      try {
        const user = await findOrCreateOAuthUser(
          profile,
          "linkedin",
          roleFromReq(req),
        );
        done(null, user);
      } catch (err) {
        console.error("❌ LinkedIn OAuth error:", err.message);
        done(err, null);
      }
    },
  ),
);

// ── Session serialization ─────────────────────────────────────────────────────
// Sessions are only used during the OAuth redirect dance. After
// handleOAuthCallback issues the httpOnly JWT cookie, regular requests use
// verifyToken (JWT) not the session.
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
