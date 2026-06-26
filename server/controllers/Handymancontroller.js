// controllers/handymanController.js
import Handyman from "../models/Handyman.js";
import HandymanPortfolio from "../models/HandymanPortfolio.js";
import cloudinary from "../middlewares/cloudinary.js";

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

    const portfolio = await HandymanPortfolio.find({ handyman: req.params.id })
      .sort({ createdAt: -1 })
      .lean()
      .catch(() => []);

    res.json({ handyman, portfolio });
  } catch (err) {
    console.error("❌ getHandymanProfile:", err);
    res.status(500).json({ message: "Failed to fetch handyman profile" });
  }
};

// ── GET /api/handymen/:id/portfolio — public portfolio list ──────────────────
export const getHandymanPortfolio = async (req, res) => {
  try {
    const portfolio = await HandymanPortfolio.find({ handyman: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ portfolio });
  } catch (err) {
    console.error("❌ getHandymanPortfolio:", err);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
};

// ── GET /api/handymen/me — own profile (auth) ─────────────────────────────────
export const getMyHandymanProfile = async (req, res) => {
  try {
    const handyman = await Handyman.findById(req.user.id)
      .select("-password -__v")
      .lean();
    if (!handyman) return res.status(404).json({ message: "Handyman not found" });
    res.json({ handyman });
  } catch (err) {
    console.error("❌ getMyHandymanProfile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ── PATCH /api/handymen/me — update own profile (auth) ───────────────────────
export const updateMyHandymanProfile = async (req, res) => {
  try {
    const { password, email, role, oauthProvider, oauthId, _id, __v, ...updates } =
      req.body;

    // Handle avatar: base64 → Cloudinary
    if (updates.avatar && updates.avatar.startsWith("data:image")) {
      try {
        const uploadRes = await cloudinary.uploader.upload(updates.avatar, {
          folder: "talenthq/avatars",
          public_id: `avatar_${req.user.id}`,
          overwrite: true,
          transformation: [
            { width: 500, height: 500, crop: "fill", quality: "auto:good" },
          ],
        });
        updates.avatar = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error("❌ Avatar upload failed:", uploadErr);
        return res.status(500).json({ message: "Avatar upload failed" });
      }
    } else if (updates.avatar === "") {
      // Allow clearing avatar
    } else {
      delete updates.avatar;
    }

    // Normalize skills
    if (updates.skills && typeof updates.skills === "string") {
      updates.skills = updates.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updated = await Handyman.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: false },
    ).select("-password -__v");

    if (!updated) return res.status(404).json({ message: "Handyman not found" });
    res.json({ message: "Profile updated", handyman: updated });
  } catch (err) {
    console.error("❌ updateMyHandymanProfile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ── GET /api/handymen/me/portfolio ───────────────────────────────────────────
export const getMyPortfolio = async (req, res) => {
  try {
    const portfolio = await HandymanPortfolio.find({ handyman: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ portfolio });
  } catch (err) {
    console.error("❌ getMyPortfolio:", err);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
};

// ── POST /api/handymen/me/portfolio ──────────────────────────────────────────
export const addPortfolioItem = async (req, res) => {
  try {
    const count = await HandymanPortfolio.countDocuments({ handyman: req.user.id });
    if (count >= 20) {
      return res.status(400).json({ message: "Portfolio limit reached (max 20 items)" });
    }

    const { title, description = "", link = "", imageUrl: rawImage = "" } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    let imageUrl = rawImage;
    if (imageUrl && imageUrl.startsWith("data:image")) {
      try {
        const uploadRes = await cloudinary.uploader.upload(imageUrl, {
          folder: "talenthq/portfolio",
          transformation: [{ width: 1200, crop: "limit", quality: "auto:good" }],
        });
        imageUrl = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error("❌ Portfolio image upload failed:", uploadErr);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    const item = await HandymanPortfolio.create({
      handyman: req.user.id,
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      imageUrl,
    });

    res.status(201).json({ message: "Portfolio item added", item });
  } catch (err) {
    console.error("❌ addPortfolioItem:", err);
    res.status(500).json({ message: "Failed to add portfolio item" });
  }
};

// ── PUT /api/handymen/me/portfolio/:itemId ────────────────────────────────────
export const updatePortfolioItem = async (req, res) => {
  try {
    const item = await HandymanPortfolio.findOne({
      _id: req.params.itemId,
      handyman: req.user.id,
    });
    if (!item) return res.status(404).json({ message: "Portfolio item not found" });

    const { title, description, link, imageUrl: rawImage } = req.body;

    if (title !== undefined) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (link !== undefined) item.link = link.trim();

    if (rawImage !== undefined) {
      if (rawImage && rawImage.startsWith("data:image")) {
        try {
          const uploadRes = await cloudinary.uploader.upload(rawImage, {
            folder: "talenthq/portfolio",
            transformation: [{ width: 1200, crop: "limit", quality: "auto:good" }],
          });
          item.imageUrl = uploadRes.secure_url;
        } catch (uploadErr) {
          console.error("❌ Portfolio image upload failed:", uploadErr);
          return res.status(500).json({ message: "Image upload failed" });
        }
      } else {
        item.imageUrl = rawImage;
      }
    }

    await item.save();
    res.json({ message: "Portfolio item updated", item });
  } catch (err) {
    console.error("❌ updatePortfolioItem:", err);
    res.status(500).json({ message: "Failed to update portfolio item" });
  }
};

// ── DELETE /api/handymen/me/portfolio/:itemId ─────────────────────────────────
export const deletePortfolioItem = async (req, res) => {
  try {
    const item = await HandymanPortfolio.findOneAndDelete({
      _id: req.params.itemId,
      handyman: req.user.id,
    });
    if (!item) return res.status(404).json({ message: "Portfolio item not found" });
    res.json({ message: "Portfolio item deleted" });
  } catch (err) {
    console.error("❌ deletePortfolioItem:", err);
    res.status(500).json({ message: "Failed to delete portfolio item" });
  }
};
