const mongoose = require("mongoose");

const showDayEntries = new mongoose.Schema({
  date: Date,
  clockIn: Date,
  breakTime: Number,
  clockOut: Date,
  description: String,
  totalHours: Number,
  totalMinutes: Number,
  duration: String,
  isSubmitted: { type: Boolean, default: false },
  straightTime: Number,
  overTime: Number,
  doubleTime: Number,
});

const timecardSchema = new mongoose.Schema(
  {
    showDayEntries: [showDayEntries],
    clockIn: Date,
    clockOut: Date,
    description: String,
    totalHours: Number,
    totalMinutes: Number,
    duration: String,
    isSubmitted: { type: Boolean, default: false },
    dateSubmited: Date,
    submissionBatchID: String,
    jobID: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // Import Job ID from job model
    day,
  },

  {
    timestamps: true,
  }
);

const Timecard = mongoose.model("Timecard", timecardSchema);

module.exports = Timecard;
