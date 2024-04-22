const mongoose = require("mongoose");

const timecardSchema = new mongoose.Schema(
  {
    clockIn: Date,
    clockOut: Date,
    description: String,
    totalHours: Number,
    straightTime: Number,
    overTime: Number,
    doubleTime: Number,
  },

  {
    timestamps: true,
  }
);

const Timecard = mongoose.model("Timecard", timecardSchema);
