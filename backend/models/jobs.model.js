const mongoose = require("mongoose");
const rtwStates = require("../utils/rtwStates");

// Schema for showDayEntries
const showDayEntriesSchema = new mongoose.Schema({
  rowId: String,
  clockIn: String, // in 24 hour HH:MM format
  breakTime: { type: Number, default: 0 }, // In minutes
  clockOut: String, // in 24 hour HH:MM format
  description: String,
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

function calculateTravelDays(duration, isLocal) {
  if (isLocal) {
    return 0;
  } else {
    return 2;
  }
}
function calculateWorkHours(clockIn, clockOut, breakTime) {
  // clockIn and clockOut are strings in 24 hour HH:MM format
  const [startHours, startMinutes] = clockIn.split(":").map(Number);
  const [endHours, endMinutes] = clockOut.split(":").map(Number);

  const start = new Date();
  start.setHours(startHours, startMinutes, 0, 0);

  const end = new Date();
  end.setHours(endHours, endMinutes, 0, 0);

  const breakDuration = breakTime * 60 * 1000; // Convert break time to milliseconds
  const totalMilliseconds = end - start - breakDuration;
  const totalMinutes = Math.max(totalMilliseconds / 1000 / 60, 0); // Ensure no negative duration

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const dailyDuration = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  // Calculate straight time, overtime, and double time
  let straightTime = 0;
  let overTime = 0;
  let doubleTime = 0;

  if (hours <= 10) {
    straightTime = 10; // 10 hours minimum
  } else if (hours > 10 && hours <= 12) {
    straightTime = 10;
    overTime = hours - 10; // up to 2 hours overtime
  } else if (hours > 12) {
    straightTime = 10;
    overTime = 2;
    doubleTime = hours - 12; // anything after 12 hours is double time
  }

  return { hours, minutes, dailyDuration, straightTime, overTime, doubleTime };
}
function calculateFields(doc, update) {
  let startDate = update.startDate ? new Date(update.startDate) : new Date(doc.startDate);
  let endDate = update.endDate ? new Date(update.endDate) : new Date(doc.endDate);

  if (startDate && endDate) {
    let duration = calculateDuration(startDate, endDate);
    doc.duration = duration;
    update.duration = duration;
  }

  let isLocal = update.hasOwnProperty("isLocal") ? update.isLocal : doc.isLocal;

  if (typeof doc.duration === "number") {
    let travelDays = calculateTravelDays(isLocal, doc.duration);
    doc.travelDays = travelDays;
    update.travelDays = travelDays;
  }

  if (update.location) {
    let isRTW = rtwStates.includes(update.location);
    doc.isRTW = isRTW;
    update.isRTW = isRTW;
  }
}

function calculateTotalTimes(entries) {
  let totalStraightTime = 0;
  let totalOverTime = 0;
  let totalDoubleTime = 0;

  entries.forEach((entry) => {
    totalStraightTime += entry.straightTime || 0;
    totalOverTime += entry.overTime || 0;
    totalDoubleTime += entry.doubleTime || 0;
  });

  return { totalStraightTime, totalOverTime, totalDoubleTime };
}

jobSchema.pre("save", function (next) {
  console.log("Pre-save: Starting to calculate fields for save operation.");
  calculateFields(this, this);

  this.showDayEntries.forEach((entry) => {
    const { clockIn, clockOut, breakTime } = entry;
    const { dailyDuration, straightTime, overTime, doubleTime } = calculateWorkHours(clockIn, clockOut, breakTime);

    entry.dailyDuration = dailyDuration;
    entry.straightTime = straightTime;
    entry.overTime = overTime;
    entry.doubleTime = doubleTime;
  });

  const { totalStraightTime, totalOverTime, totalDoubleTime } = calculateTotalTimes(this.showDayEntries);

  this.totalStraightTime = totalStraightTime;
  this.totalOverTime = totalOverTime;
  this.totalDoubleTime = totalDoubleTime;

  next();
});
jobSchema.pre("findOneAndUpdate", function (next) {
  console.log("Pre-findOneAndUpdate: Starting to calculate fields for update operation.");
  const update = this.getUpdate();

  // Extract fields from the update object
  const { showDayEntries, startDate, endDate, clockIn, clockOut, breakTime } = update;

  // Check if the update involves calculation-related fields
  const needsCalculation = showDayEntries || startDate || endDate || clockIn || clockOut || breakTime;

  if (needsCalculation) {
    calculateFields(this._update, update);

    if (update.showDayEntries) {
      update.showDayEntries.forEach((entry) => {
        const { clockIn, clockOut, breakTime } = entry;
        const { dailyDuration, straightTime, overTime, doubleTime } = calculateWorkHours(clockIn, clockOut, breakTime);

        entry.dailyDuration = dailyDuration;
        entry.straightTime = straightTime;
        entry.overTime = overTime;
        entry.doubleTime = doubleTime;
      });

      const { totalStraightTime, totalOverTime, totalDoubleTime } = calculateTotalTimes(update.showDayEntries);

      update.totalStraightTime = totalStraightTime;
      update.totalOverTime = totalOverTime;
      update.totalDoubleTime = totalDoubleTime;
    }
  }

  this.setUpdate(update);
  next();
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
