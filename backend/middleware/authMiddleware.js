const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const User = require("../models/users.model");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    console.log("No token found");
    res.redirect("/login");
    return res.status(401).json({ message: "Login first" });
  }
  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    next();
  });
};

// Check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: "Login first" });
  }
  jwt.verify(token, jwtSecret, async (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const user = await User.findById(decodedToken.id);
    req.user = user;
    //res.local.user = user; // Tutorial method
    next();
  });
};

module.exports = { requireAuth, checkUser };
