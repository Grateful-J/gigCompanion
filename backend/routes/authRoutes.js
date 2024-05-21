const express = require("express");
const router = express.Router();
const { authController } = require("../utils/auth");

router.get("/logout", authController.logout_get);
