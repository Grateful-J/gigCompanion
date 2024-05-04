const express = require("express");
const router = express.Router();
const { register, login, update, deleteUser, adminAuth, userAuth } = require("../utils/auth"); // imports auth & login functions for user auth
const User = require("../models/users.model");

//Get All Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Get a single User
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//POST a new User
router.route("/register").post(register);

//POST a new login
router.route("/login").post(login);

//PUT an update to user Role
router.route("/update").put(update);

// AUTH DELETE a user
router.route("/deleteUser").delete(deleteUser);

//PATCH a User
router.patch("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete a user
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout a user
router.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});

module.exports = router;
