// MONGO AUTH ROUTES

// Register new user using email and password
await app.emailPasswordAuth.registerUser({
  email: "someone@example.com",
  password: "Pa55w0rd!",
});
