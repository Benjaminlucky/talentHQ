import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token || // ✅ from cookie
    req.headers["authorization"]?.split(" ")[1]; // fallback: Bearer token

  if (!token) {
    return res.status(401).json({ message: "No token, unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ attach user info
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
