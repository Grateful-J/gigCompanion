const mongoose = require("mongoose");

const timecardSchema = new mongoose.Schema(
  {
    clockIn: Date,
    clockOut: Date,
    description: String,
    totalHours: Number,
    totalMinutes: Number,
    duration: String,
    isSubmitted: { type: Boolean, default: false },
    dateSubmited: Date,
    submissionBatchID: String,
    jobID: String,
  },

  {
    timestamps: true,
  }
);

const Timecard = mongoose.model("Timecard", timecardSchema);

module.exports = Timecard;
