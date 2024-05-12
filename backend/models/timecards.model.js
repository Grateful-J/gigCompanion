const mongoose = require("mongoose");

// Schema for showDayEntries
const showDayEntries = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

// Schema for Timecard
const timecardSchema = new mongoose.Schema(
  {
    showDayEntries: [showDayEntries], // Import showDayEntries from showDayEntries model
    clockIn: Date, // Legacy field- used for task hour tracking
    clockOut: Date, // Legacy field- used for task hour tracking
    description: String,
    totalHours: Number,
    totalMinutes: Number,
    duration: String, // Legacy field- used for task hour tracking
    isSubmitted: { type: Boolean, default: false },
    jobID: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // Import Job ID from job model
  },

  {
    timestamps: true,
  }
);

// Function to calculate duration
function calculateDuration(clockIn, clockOut) {
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  console.log("Calculated Duration:", duration);
  return duration;
}

// Pre-save hook to calculate duration
timecardSchema.pre("save", function (next) {
  const clockIn = this.clockIn;
  const clockOut = this.clockOut;
  const duration = calculateDuration(clockIn, clockOut);
  this.duration = duration;
  next();
});

// TODO: Find out if this will work with the nested showDayEntries model
// pre-findOneAndUpdate hook to calculate duration
timecardSchema.pre("findOneAndUpdate", function (next) {
  const clockIn = this._update.clockIn;
  const clockOut = this._update.clockOut;
  const duration = calculateDuration(clockIn, clockOut);
  this._update.duration = duration;
  next();
});

const Timecard = mongoose.model("Timecard", timecardSchema);

module.exports = Timecard;
