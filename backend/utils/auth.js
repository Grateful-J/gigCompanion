const User = require("../models/users.model");
const bcrypt = require("bcryptjs"); //encrypts passwords

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
            res.status(201).json({
              message: "User successfully created",
              user,
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
    const user = await User.findOne({ username, password });
    if (!user) {
      res.status(400).json({ message: "User or password combo not found" });
    } else {
      res.status(200).json({
        message: "User successfully logged in",
        user,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Error occured",
      error: error.mesage,
    });
  }
};

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
