const User = require("../models/users.model");
const bcrypt = require("bcryptjs"); //encrypts passwords
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// POST a new User and return it
exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" });
  }
  try {
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      } else {
        await User.create({
          username,
          password: hash,
        })
          .then((user) => {
            const maxAge = 3 * 60 * 60;
            const token = jwt.sign({ id: user._id, username, role: user.role }, jwtSecret, {
              expiresIn: maxAge, // 3 hours in seconds
            });
            res.cookie("jwt", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              maxAge: maxAge * 1000, // 3hrs in ms
            });
            res.status(201).json({
              message: "User successfully created",
              user: user._id,
            });
          })
          .catch((error) => {
            res.status(400).json({
              message: "Error occured",
              error: error.message,
            });
          });
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Error occured",
      error: error.message,
    });
  }
};

// POST a login
exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Both username & password are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User or password combination not found" });
    }
    bcrypt.compare(password, user.password).then((result) => {
      if (result) {
        const maxAge = 3 * 60 * 60; // 3 hours in seconds
        const token = jwt.sign({ id: user._id, username, role: user.role }, jwtSecret, {
          expiresIn: maxAge,
        });
        console.log("Setting cookie");
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000, // Convert to milliseconds
          secure: process.env.NODE_ENV === "production", // Secure cookie in production
        });
        console.log("Cookie set");
        res.status(200).json({
          message: "User successfully logged in",
          user: user._id,
        });
      } else {
        res.status(400).json({ message: "User or password combination not found" });
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Error occurred",
      error: error.message,
    });
  }
};

// PATCH an update to user Role
exports.update = async (req, res, next) => {
  const { role, id } = req.body;
  // Verifying if role and id is presnt
  if (role && id) {
    // Verifying if the value of role is admin
    if (role === "admin") {
      await User.findById(id)
        .then((user) => {
          // Third - Verifies the user is not an admin
          if (user.role !== "admin") {
            user.role = role;
            return user.save(); // Save the updated user object to the database
          } else {
            res.status(400).json({ message: "User is already an Admin" });
          }
        })
        .catch((error) => {
          res.status(400).json({ message: "An error occurred", error: error.message });
        });
    } else {
      res.status(400).json({
        message: "Role is not admin",
      });
    }
  } else {
    res.status(400).json({ message: "Role or Id not present" });
  }
};
// DELETE a user
// Function to Delete User
exports.deleteUser = async (req, res, next) => {
  const userId = req.body.userId; // Assuming userId is sent in the request body
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optionally verify the role from the token instead of middleware
    const token = req.cookies.jwt; // Get JWT token from cookies
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Authenticates an admin user
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

//Authenticates basic user
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
