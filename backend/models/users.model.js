const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    email: String,
    registrationDate: Date,
    firstName: String,
    lastName: String,
    birthday: Date,
    phoneNumber: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
