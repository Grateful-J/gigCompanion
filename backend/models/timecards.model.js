const mongoose = require("mongoose");

const timecardSchema = new mongoose.Schema(
  {
    clockIn: Date,
    clockOut: Date,
    description: String,
    duration: Number,
    isSubmited: { type: Boolean, default: false },
  },

  {
    timestamps: true,
  }
);

const Timecard = mongoose.model("Timecard", timecardSchema);

module.exports = Timecard;
