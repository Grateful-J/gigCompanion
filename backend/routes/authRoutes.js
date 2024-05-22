const express = require("express");
const router = express.Router();
const { authController } = require("../utils/authController");
const { checkToken } = require("../utils/authController");

router.get("/logout", authController.logout_get);

module.exports = {
  router,
  checkToken,
};
