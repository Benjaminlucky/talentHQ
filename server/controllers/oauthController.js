// server/controllers/oauthController.js
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

const FRONTEND =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talenthq.netlify.app"
    : "http://localhost:3000");

// Parse UA into friendly labels (same helper as authController)
function parseDevice(ua = "") {
  const u = ua.toLowerCase();
  let browser = "Unknown browser";
  let device = "Unknown device";
  if (u.includes("chrome") && !u.includes("edg")) browser = "Chrome";
  else if (u.includes("firefox")) browser = "Firefox";
  else if (u.includes("safari") && !u.includes("chrome")) browser = "Safari";
  else if (u.includes("edg")) browser = "Edge";
  if (u.includes("iphone")) device = "iPhone";
  else if (u.includes("android")) device = "Android";
  else if (u.includes("windows")) device = "Windows PC";
  else if (u.includes("mac")) device = "Mac";
  return { browser, device };
}

// Called by both Google and LinkedIn callbacks after Passport authenticates the user.
// Issues your existing JWT cookie and records the session — identical to the
// email/password login flow.
export const handleOAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${FRONTEND}/login?error=oauth_failed`);
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Set httpOnly cookie — same as email login
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Record session
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const ua = req.headers["user-agent"] || "";
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip || "";
    const { browser, device } = parseDevice(ua);
    const modelName =
      user.role === "jobseeker"
        ? "Jobnode"
        : user.role === "handyman"
          ? "Handyman"
          : "Employer";

    await Session.create({
      userId: user._id,
      userModel: modelName,
      tokenHash,
      userAgent: ua,
      ip,
      browser,
      device,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Redirect to the right dashboard.
    // If onboarding isn't complete, send them there first.
    const dashboardRoutes = {
      jobseeker: "/dashboard/jobseeker",
      handyman: "/dashboard/handyman",
      employer: "/dashboard/employer",
    };

    const destination = !user.onboardingComplete
      ? `/onboarding/${user.role}?oauth=true`
      : dashboardRoutes[user.role] || "/dashboard/jobseeker";

    return res.redirect(`${FRONTEND}${destination}`);
  } catch (err) {
    console.error("❌ OAuth callback error:", err.message);
    return res.redirect(`${FRONTEND}/login?error=oauth_failed`);
  }
};
