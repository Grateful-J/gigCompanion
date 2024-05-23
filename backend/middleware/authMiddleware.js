const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const User = require("../models/users.model");

exports.adminAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        if (decodedToken.role !== "admin") {
          return res.status(401).json({ message: "Not authorized" });
        } else {
          next();
        }
      }
    });
  } else {
    return res.status(401).json({ message: "Not authorized, token not available" });
  }
};
exports.userAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        if (decodedToken.role !== "Basic") {
          return res.status(401).json({ message: "Not authorized" });
        } else {
          next();
        }
      }
    });
  } else {
    return res.status(401).json({ message: "Not authorized, token not available" });
  }
};

//!--------------- OLD AUTH MIDDLEWARE ----------------- ! \\

const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("requireAuth token", token);
    const decodedData = jwt.verify(token, jwtSecret);
    req.userDecodedData = decodedData;

    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ message: "Auth Failed" });
  }
};

/* const requireAuth = (req, res, next) => {
  //console.log(`requireAuth called- headers: ${JSON.stringify(req.headers)}`);
  const token = req.headers.authorization.split(" ")[1];
  //console.log("requireAuth token", token);

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
}; */

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
    res.locals.user = user; // Fixed typo from res.local to res.locals
    next();
  });
};

module.exports = { requireAuth, checkUser };
