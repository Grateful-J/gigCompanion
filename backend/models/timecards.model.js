const mongoose = require("mongoose");

// Schema for showDayEntries
const showDayEntries = new mongoose.Schema({
  rowId: String,
  date: Date,
  clockIn: Number,
  breakTime: Number,
  clockOut: Number,
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
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  console.log("Calculated Duration:", duration);
  return duration;
}

function calculateWorkHours(clockIn, clockOut) {
  const hours = (clockOut - clockIn) / (1000 * 60 * 60); // Convert milliseconds to hours
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

// Pre-save hook to calculate duration
timecardSchema.pre("save", function (next) {
  const clockIn = this.clockIn;
  const clockOut = this.clockOut;
  const duration = calculateDuration(clockIn, clockOut);
  this.duration = duration;
  next();
});

// TODO: try to combine pre-save hooks once established functional
// Pre-save hook to calculate work hours
timecardSchema.pre("save", function (next) {
  const clockIn = this.clockIn;
  const clockOut = this.clockOut;
  const workHours = calculateWorkHours(clockIn, clockOut);
  this.totalHours = workHours.totalHours;
  this.straightTime = workHours.straightTime;
  this.overTime = workHours.overTime;
  this.doubleTime = workHours.doubleTime;
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

// TODO: handle edge cases like clockIn and clockOut being null
// TODO: handle edge cases like clockIn and clockOut being in the future
// TODO: handle edge cases like clockIn and clockOut being in the past
// TODO: handle edge cases like rolling past midnight or a 24+ hour day on the clock

// TODO: handle edge cases like "turnaround time" where OT or DT are carried over and start the day in that time

const Timecard = mongoose.model("Timecard", timecardSchema);

module.exports = Timecard;
