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
              maxAge: maxAge * 1000, // 3hrs in ms
            });
            res.status(201).json({
              message: "User successfully created",
              user: user_id,
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

// Login a User and return it
exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  // Validates if username and passwordare not empty
  if (!username || !password) {
    return res.status(400).json({ message: "Both username & password are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ message: "User or password combo not found" });
    } else {
      //uses bcrypt to compare passwords
      bcrypt.compare(password, user.password).then((result) => {
        if (result) {
          const maxAge = 3 * 60 * 60;
          const token = jwt.sign({ id: user._id, username, role: user.role }, jwtSecret, {
            expiresIn: maxAge, // 3 hours in seconds
          });
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 3hrs in ms
          });
          res.status(200).json({
            message: "User successfully logged in",
            user: user._id,
          });
        } else {
          res.status(400).json({ message: "User or password combo not found" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Error occured",
      error: error.mesage,
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
exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;
  await User.findById(id)
    .then((user) => {
      if (user) {
        return user.deleteOne();
      } else {
        res.status(400).json({ message: "User not found" });
      }
    })
    .then((user) => res.status(201).json({ message: "User successfully deleted", user }))
    .catch((error) => res.status(400).json({ message: "An error occurred", error: error.message }));
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
