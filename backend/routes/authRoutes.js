const express = require("express");
const router = express.Router();
const { register, login, update, deleteUser, getUsers } = require("../utils/authController");
const { adminAuth, userAuth } = require("../middleware/authMiddleware");
//const { checkToken } = require("../utils/authController");

router.route("/register").post(register);
router.route("/update").post(update);
router.route("/login").post(login);
router.route("/deleteUser").post(deleteUser);
router.route("/getUsers").get(getUsers);
module.exports = { router };
