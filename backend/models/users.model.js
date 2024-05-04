const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    email: {
      type: String,
      default: "email@email.com",
      //required: true,
      //unique: true,
    },
    //firstName: String,
    //lastName: String,
    //birthday: Date,
    //phoneNumber: String,
    role: {
      type: String,
      default: "basic",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
