const mongoose = require("mongoose");
const rtwStates = require("../utils/rtwStates");

// Schema for showDayEntries
const showDayEntriesSchema = new mongoose.Schema({
  rowId: String,
  clockIn: String, // in 24 hour HH:MM format
  breakTime: { type: Number, default: 0 }, // In minutes
  clockOut: String, // in 24 hour HH:MM format
  description: String,
  //totalHours: Number,
  //totalMinutes: Number,
  dailyDuration: String, // in total 24 hour HH:MM format
  isTravelSandwich: { type: Boolean, default: false }, // TODO: logic for sandwich days
  straightTime: Number,
  overTime: Number,
  doubleTime: Number,
});

const jobSchema = new mongoose.Schema(
  {
    jobName: String,
    client: String,
    location: String,
    startDate: Date,
    endDate: Date,
    duration: Number,
    travelDays: Number,
    isRTW: { type: Boolean, default: false },
    showCode: String,
    isFreelance: { type: Boolean, default: false },
    rate: { type: Number, default: 650 },
    isLocal: { type: Boolean, default: false },
    totalStraightTime: Number, // TODO: calculate total straight time in hours
    totalOverTime: Number, // TODO: calculate total over time in hours
    totalDoubleTime: Number, // TODO: calculate total double time in hours
    isSubmitted: { type: Boolean, default: false },
    isInvoiced: { type: Boolean, default: false },
    showDayEntries: [showDayEntriesSchema], // Add showDayEntries to Job schema
  },
  {
    timestamps: true,
  }
);

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  console.log("Calculated Duration:", duration);
  return duration;
}

// Function to calculate total hours worked for each day
function calculateWorkHours(clockIn, clockOut, breakTime, dailyDuration) {
  //clock In and clock Out are strings in 24 hour HH:MM format
  const start = new Date(clockIn);
  console.log(`Clock In: ${clockIn}`);
  const end = new Date(clockOut);
  console.log(`Clock Out: ${clockOut}`);
  const breakDuration = breakTime * 60;
  console.log(`Break Duration: ${breakDuration}`);
  const duration = Math.ceil((end - start - breakDuration) / (1000 * 60 * 60)) + 1;
  console.log("Calculated Work Hours:", duration);
  dailyDuration = duration;
  return dailyDuration || 0;
}

//TODO: calculate travel days on travel/work or other outliers
function calculateTravelDays(isLocal, duration) {
  // if not local, return 0 else calculate travel days
  // travel days = duration - 2 if duration >=2
  if (!isLocal) {
    return 0;
  } else if (duration >= 2) {
    return 2;
  } else {
    return 0;
  }
  console.log("Calculated Travel Days:", travelDays);
  return travelDays;
}

function calculateFields(doc, update) {
  // startDate and endDate must be handled precisely to reflect new values
  let startDate = update.startDate ? new Date(update.startDate) : new Date(doc.startDate);
  let endDate = update.endDate ? new Date(update.endDate) : new Date(doc.endDate);

  if (startDate && endDate) {
    let duration = calculateDuration(startDate, endDate);
    doc.duration = duration;
    update.duration = duration; // Ensure updated document and update operation reflect this
  }

  // Use 'isLocal' from update or fallback to existing document value
  let isLocal = update.hasOwnProperty("isLocal") ? update.isLocal : doc.isLocal;

  if (typeof doc.duration === "number") {
    let travelDays = calculateTravelDays(isLocal, doc.duration);
    doc.travelDays = travelDays;
    update.travelDays = travelDays; // Apply to both contexts
  }

  if (update.location) {
    let isRTW = rtwStates.includes(update.location);
    doc.isRTW = isRTW;
    update.isRTW = isRTW;
  }
}

// Pre-save hook: updates the 'duration' and 'travelDays' fields on "save"
jobSchema.pre("save", function (next) {
  console.log("Pre-save: Starting to calculate fields for save operation.");
  calculateFields(this, this);
  calculateWorkHours(this.clockIn, this.clockOut, this.breakTime, this.dailyDuration);
  next();
});

// Pre-findOneAndUpdate hook: Ensure _update and update are correctly referenced
jobSchema.pre("findOneAndUpdate", function (next) {
  console.log("Pre-findOneAndUpdate: Starting to calculate fields for update operation.");
  const update = this.getUpdate();
  calculateFields(this._update, update); // Ensure this._update and update are correctly referenced
  this.setUpdate(update);
  next();
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
