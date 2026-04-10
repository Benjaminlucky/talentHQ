// controllers/handymanController.js
import Handyman from "../models/Handyman.js";

// ── GET /api/handymen — browse all handymen (public) ─────────────────────────
export const getHandymen = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      location = "",
      trade = "",
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { trade: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }
    if (location) query.location = { $regex: location, $options: "i" };
    if (trade) query.trade = { $regex: trade, $options: "i" };

    const [handymen, total] = await Promise.all([
      Handyman.find(query)
        .select(
          "fullName avatar trade yearsExperience location skills bio avgRating reviewCount createdAt",
        )
        .sort({ avgRating: -1, createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Handyman.countDocuments(query),
    ]);

    res.json({
      handymen,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("❌ getHandymen:", err);
    res.status(500).json({ message: "Failed to fetch handymen" });
  }
};

// ── GET /api/handymen/:id — single handyman public profile ────────────────────
export const getHandymanProfile = async (req, res) => {
  try {
    const handyman = await Handyman.findById(req.params.id)
      .select(
        "-password -oauthId -oauthProvider -emailVerified -banned -onboardingComplete -__v",
      )
      .lean();

    if (!handyman) {
      return res.status(404).json({ message: "Handyman not found" });
    }

    res.json({ handyman });
  } catch (err) {
    console.error("❌ getHandymanProfile:", err);
    res.status(500).json({ message: "Failed to fetch handyman profile" });
  }
};
