const express = require("express");
const { App } = require("realm");
const router = express.Router();

const appId = process.env.MONGODB_APP_ID;
// Initialize the Realm App with your App ID
const realmApp = new App({ id: appId });

// Route to handle user registration
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    await realmApp.emailPasswordAuth.registerUser({ email, password });
    res.status(200).send("Successfully registered new user.");
  } catch (err) {
    res.status(400).send(`Failed to register user: ${err.message}`);
  }
});

// Route to handle user confirmation
router.post("/confirm", async (req, res) => {
  const { token, tokenId } = req.body;
  try {
    await realmApp.emailPasswordAuth.confirmUser({ token, tokenId });
    res.status(200).send("Successfully confirmed user.");
  } catch (err) {
    res.status(400).send(`User confirmation failed: ${err.message}`);
  }
});

module.exports = router;
