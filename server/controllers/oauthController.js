// server/controllers/oauthController.js
import jwt from "jsonwebtoken";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

const FRONTEND =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talenthq.buzz"
    : "http://localhost:3000");

const DASH = {
  jobseeker: "/dashboard/jobseeker",
  handyman: "/dashboard/handyman",
  employer: "/dashboard/employer",
};

function issueJwt(res, user) {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

// ── GET /api/auth/google/callback  &  GET /api/auth/linkedin/callback ─────────
// Called by Passport after successful OAuth — issues cookie then redirects client.
export const handleOAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.redirect(`${FRONTEND}/login?error=oauth_failed`);

    issueJwt(res, user);

    // New user who hasn't chosen a role yet → role selection page
    if (user.needsRoleSelection) {
      return res.redirect(`${FRONTEND}/oauth/select-role`);
    }

    // Existing user — send to their dashboard or onboarding if incomplete
    const destination = !user.onboardingComplete
      ? `/onboarding/${user.role}?oauth=true`
      : DASH[user.role] || "/dashboard/jobseeker";

    return res.redirect(`${FRONTEND}${destination}`);
  } catch (err) {
    console.error("❌ OAuth callback error:", err.message);
    return res.redirect(`${FRONTEND}/login?error=oauth_failed`);
  }
};

// ── POST /api/auth/oauth/set-role ─────────────────────────────────────────────
// Called by /oauth/select-role page after the user picks their role.
// If they chose employer or handyman, we migrate them from Jobnode to the
// correct collection and issue a fresh token with the correct role.
export const setOAuthRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["jobseeker", "employer", "handyman"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const { id, role: currentRole } = req.user;

    // If role hasn't changed (or already jobseeker) just update the flag
    if (role === "jobseeker") {
      const user = await Jobnode.findByIdAndUpdate(
        id,
        { role: "jobseeker", needsRoleSelection: false },
        { new: true },
      );
      issueJwt(res, user);
      return res.json({ message: "Role set", role: "jobseeker" });
    }

    // Need to migrate from Jobnode → Employer or Handyman
    const source = await Jobnode.findById(id).lean();
    if (!source) return res.status(404).json({ message: "User not found" });

    let newUser;
    const base = {
      fullName: source.fullName,
      email: source.email,
      password: source.password,
      avatar: source.avatar || "",
      oauthProvider: source.oauthProvider,
      oauthId: source.oauthId,
      emailVerified: true,
      onboardingComplete: false,
      needsRoleSelection: false,
    };

    if (role === "employer") {
      newUser = await Employer.create({ ...base, role: "employer" });
    } else {
      newUser = await Handyman.create({ ...base, role: "handyman" });
    }

    // Delete the temporary Jobnode record
    await Jobnode.findByIdAndDelete(id);

    // Issue new JWT with the real role
    issueJwt(res, newUser);

    return res.json({ message: "Role set", role, userId: newUser._id });
  } catch (err) {
    console.error("❌ setOAuthRole:", err.message);
    return res
      .status(500)
      .json({ message: "Failed to set role. Please try again." });
  }
};
