const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: String,
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    description: String,
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
