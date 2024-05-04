const User = require("../models/users.model");

// POST a new User and return it
exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" });
  }
  try {
    await User.create({
      username,
      password,
    }).then((user) =>
      res.status(200).json({
        message: "User successfully created",
        user,
      })
    );
  } catch (err) {
    res.status(401).json({
      message: "User not successful created",
      error: error.mesage,
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
