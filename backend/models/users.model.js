const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      //required: true,
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
      required: true,
      //unique: true,
    },
    firstName: String,
    lastName: String,
    //birthday: Date,
    phoneNumber: String,
    role: {
      type: String,
      enum: ["user", "tech", "manager", "admin", "client", "freelancer", "projectManager"],
      default: "user",
    },
    assignedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], // List of jobs assigned to the user
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
