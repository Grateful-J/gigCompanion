const express = require("express");
const router = express.Router();
const { register, login, update, deleteUser, adminAuth } = require("../utils/auth"); // imports auth & login functions for user auth
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

/* 
//POST a new User
router.post("/", async (req, res) => {
  const newUser = new User(req.body);
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); */

//POST a new User
router.route("/register").post(register);

//POST a new login
router.route("/login").post(login);

//PUT an update to user Role
router.route("/update").put(adminAuth, update);

// DELETE a user
router.route("/deleteUser").delete(adminAuth, deleteUser);

//PATCH a User
router.patch("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
