const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const User = require("../models/users.model");

const { App, Credentials } = require("realm");
const appId = process.env.MONGODB_APP_ID;
const realmApp = new App({ id: appId });

const envCheck = process.env.NODE_ENV;

async function authenticateToken(req, res, next) {
  //! Remove before deployment // !!
  if (envCheck !== "production") {
    return next();
    //! REMOVE//
  } else {
    const token = req.headers["authorization"]?.split(" ")[1] || req.cookies.authToken;
    //console.log("authenticateToken token init from middleware:", token);

    if (!token) return res.sendStatus(401); // Unauthorized

    try {
      const user = realmApp.currentUser;

      // Check if the current user is already logged in and token matches
      if (user && user.accessToken === token) {
        req.user = user;
        next();
      } else {
        return res.sendStatus(401); // Unauthorized
      }
    } catch (err) {
      console.error("User session validation failed:", err.message);
      res.sendStatus(403); // Forbidden
    }
  }
}

module.exports = authenticateToken;

/* 
exports.adminAuth = (req, res, next) => {
  const token = req.cookie;
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
 */
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

/* // Check current user
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
 */
