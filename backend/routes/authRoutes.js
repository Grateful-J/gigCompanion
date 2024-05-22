const express = require("express");
const router = express.Router();
const { authController } = require("../utils/authController");
const { checkToken } = require("../utils/authController");

router.get("/logout", authController.logout_get);

router.post("/login", authController.login_post);

router.post("/register", authController.register_post);

router.get("/user", checkToken, authController.user_get);

module.exports = {
  router,
  checkToken,
};
