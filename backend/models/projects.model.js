const mongoose = require("mongoose");
const projectSchema = new mongoose.Schema(
  {
    projectName: String,
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    description: String,
    startDate: Date,
    endDate: Date,
    budget: Number,
    deadline: Date,
    status: String,
    isCompleted: { type: Boolean, default: false },
    isSubmitted: { type: Boolean, default: false },
    isInvoiced: { type: Boolean, default: false },

    client: String, //? Temp for now.. Maybe a drop down or an entire schema of its own
    location: String,
    internalShowCode: String,
    clientShowCode: String,
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
