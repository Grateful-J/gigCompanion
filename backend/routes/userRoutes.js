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

// POST a new Admin

//POST a new login
router.route("/login").post(login);

//PUT an update to user Role
router.route("/update").put(adminAuth, update);

// AUTH DELETE a user
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

/* // delete a user without auth
router.delete("/:id", async (req, res) => {
  try {
    const token = req.cookies.jwt; // Get JWT token from cookies
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    } else {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      res.status(200).json(deletedUser);
    }
    //const deletedUser = await User.findByIdAndDelete(req.params.id);
    //res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
 */
module.exports = router;
