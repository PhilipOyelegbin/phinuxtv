const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid authorization token" });
  }
}

module.exports = { requireAuth };
