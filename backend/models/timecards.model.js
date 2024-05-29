const mongoose = require("mongoose");

// Schema for showDayEntries
const showDayEntries = new mongoose.Schema({
  rowId: String,
  // date: Date, // TODO: new date is preventing the addToSet from working
  clockIn: String,
  breakTime: Number,
  clockOut: String,
  description: String,
  totalHours: Number,
  totalMinutes: Number,
  duration: String,
  isSubmitted: { type: Boolean, default: false },
  straightTime: Number,
  overTime: Number,
  doubleTime: Number,
});

// Schema for Timecard
const timecardSchema = new mongoose.Schema(
  {
    showDayEntries: [showDayEntries], // Import showDayEntries from showDayEntries model
    clockIn: Date, // Legacy field- used for task hour tracking
    clockOut: Date, // Legacy field- used for task hour tracking
    description: String,
    totalHours: Number,
    totalMinutes: Number,
    duration: String, // Legacy field- used for task hour tracking in HH:MM format
    isSubmitted: { type: Boolean, default: false },
    jobID: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // Import Job ID from job model
  },
  {
    timestamps: true,
  }
);

// Function to calculate duration
function calculateDuration(clockIn, clockOut) {
  if (!clockIn || !clockOut) return null;

  const start = new Date(clockIn);
  const end = new Date(clockOut);
  if (isNaN(start) || isNaN(end)) return null;

  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  console.log("Calculated Duration:", duration);
  return duration;
}

function calculateWorkHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return { totalHours: 0, straightTime: 0, overTime: 0, doubleTime: 0 };

  const start = new Date(clockIn);
  const end = new Date(clockOut);
  if (isNaN(start) || isNaN(end)) return { totalHours: 0, straightTime: 0, overTime: 0, doubleTime: 0 };

  const hours = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
  let straightTime = 0,
    overTime = 0,
    doubleTime = 0;

  if (hours <= 10) {
    straightTime = hours;
  } else if (hours <= 12) {
    straightTime = 10;
    overTime = hours - 10;
  } else {
    straightTime = 10;
    overTime = 2;
    doubleTime = hours - 12;
  }

  return { totalHours: hours, straightTime, overTime, doubleTime };
}

// Combined pre-save hook to calculate duration and work hours
timecardSchema.pre("save", function (next) {
  const clockIn = this.clockIn;
  const clockOut = this.clockOut;

  const duration = calculateDuration(clockIn, clockOut);
  this.duration = duration;

  const workHours = calculateWorkHours(clockIn, clockOut);
  this.totalHours = workHours.totalHours;
  this.straightTime = workHours.straightTime;
  this.overTime = workHours.overTime;
  this.doubleTime = workHours.doubleTime;

  next();
});

// Pre-findOneAndUpdate hook to calculate duration and work hours
timecardSchema.pre("findOneAndUpdate", function (next) {
  const clockIn = this._update.clockIn;
  const clockOut = this._update.clockOut;

  const duration = calculateDuration(clockIn, clockOut);
  this._update.duration = duration;

  const workHours = calculateWorkHours(clockIn, clockOut);
  this._update.totalHours = workHours.totalHours;
  this._update.straightTime = workHours.straightTime;
  this._update.overTime = workHours.overTime;
  this._update.doubleTime = workHours.doubleTime;

  next();
});

const Timecard = mongoose.model("Timecard", timecardSchema);

module.exports = Timecard;
