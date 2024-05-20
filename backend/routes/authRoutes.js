const express = require("express");
const router = express.Router();
const { register, login, update, deleteUser, adminAuth, userAuth, logout } = require("../utils/auth");

router.get("/logout", logout);
