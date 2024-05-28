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
  dailyRate: Number, // pulled from rate for now
  straightPay: Number, // daily rate * straight time
  overPay: Number, // daily rate * over time
  doublePay: Number,
  dailyPosition: String, // TODO: would be edge case for person performing multiple roles in same Job
});

// Schema for Expenses
const expensesSchema = new mongoose.Schema({
  expenseDate: Date,
  amount: Number,
  expenseDescription: String,
  category: String,
});

// Schema for notes
const notesSchema = new mongoose.Schema({
  noteDate: Date,
  noteDescription: String,
  note: String,
  photo: String, // TODO: Add photo upload or link to URL or GDrive API
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
    crewPosition: { type: String, default: "A2" }, // Is set by self or project manager
    rate: { type: Number, default: 650 },
    isLocal: { type: Boolean, default: false },
    totalStraightTime: Number, // Calculates total straight time in hours
    totalOverTime: Number, // Calculate total over time in hours
    totalDoubleTime: Number, // Calculate total double time in hours
    isSubmitted: { type: Boolean, default: false }, // Submits to self or to project manager
    isInvoiced: { type: Boolean, default: false }, // Submits to self or client
    showDayEntries: [showDayEntriesSchema], // Add showDayEntries to Job schema
    expenses: [expensesSchema],
    notes: [notesSchema],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // Reference to the Project
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User from MongoDB
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

function calculateTravelDays(isLocal) {
  if (isLocal === true) {
    console.log("Local Job: 0 Days");
    return 0;
  } else {
    console.log("Non-Local Job: 2 Days");
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

  // If end hours roll past midnight append remaining to current endHours
  if (end.getHours() < start.getHours()) {
    end.setHours(end.getHours() + 24);
  }

  console.log(`End Hours: ${end}`);

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
    let travelDays = calculateTravelDays(isLocal);
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

function calculateDailyWage(dailyRate, straightTime, overTime, doubleTime) {
  const sT = straightTime;
  const oT = overTime;
  const dT = doubleTime;
  const hourlyRate = dailyRate / 10; // rate is logged on 10hr day. hourly rate

  const totalSt = sT * hourlyRate;
  const totalOt = oT * hourlyRate;
  const totalDt = dT * hourlyRate;

  return totalSt, totalOt, totalDt;
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
  const { showDayEntries, startDate, endDate, clockIn, clockOut, breakTime, isLocal } = update;

  // Check if the update involves calculation-related fields
  const needsCalculation = showDayEntries || startDate || endDate || clockIn || clockOut || breakTime || isLocal;

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

    if (update.location) {
      const isRTW = rtwStates.includes(update.location);
      update.isRTW = isRTW;
    }

    // Calculate travel days
    const travelDays = calculateTravelDays(update.isLocal);
    update.travelDays = travelDays;

    // Set the update object to the calculated fields
    this.setUpdate(update);
  } else {
    console.log("Pre-findOneAndUpdate: No fields need calculation. Skipping calculation.");
  }

  next();
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
