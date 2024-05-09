const mongoose = require("mongoose");
const rtwStates = require("../utils/rtwStates"); // Adjusted for a utils directory

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
    straightTime: Number,
    overTime: Number,
    doubleTime: Number,
    isSubmitted: { type: Boolean, default: false },
    isInvoiced: { type: Boolean, default: false },
  },

  {
    timestamps: true,
  }
);

//TODO: new jobSchema- links location to location model
/* const jobSchema = new mongoose.Schema({
  jobName: String, 
  client: String,
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  startDate: Date,
  endDate: Date,
  travelDays: Number,
  isRTW: { type: Boolean, default: false }
  jobCode: String
}); */

// Static method to calculate duration in days
jobSchema.statics.calculateDuration = function (startDate, endDate) {
  return (endDate - startDate) / (1000 * 60 * 60 * 24);
};

// Static method to calculate travel days
// If job is not local, travel days = 2
// if job is local, travel days = 0
jobSchema.statics.calculateTravelDays = function (location) {
  if (!location) {
    return 2;
  } else {
    return 0;
  }
};

// Function to calculate duration and travel days
function calculateFields(update) {
  if (update.startDate && update.endDate) {
    update.duration = jobSchema.statics.calculateDuration(new Date(update.startDate), new Date(update.endDate));
  }
  if (update.location !== undefined) {
    update.travelDays = jobSchema.statics.calculateTravelDays(update.isLocal);
  }
  if (update.location) {
    update.isRTW = rtwStates.includes(update.location);
  }
}

// Pre-save hook to set isRTW based on location
jobSchema.pre("save", function (next) {
  this.isRTW = rtwStates.includes(this.location);
  this.duration = jobSchema.statics.calculateDuration(this.startDate, this.endDate);
  this.travelDays = jobSchema.statics.calculateTravelDays(this.isLocal);
  next();
});

// Pre-findOneAndUpdate middleware
jobSchema.pre("findOneAndUpdate", function (next) {
  const update = { ...this.getUpdate() };
  calculateFields(update);
  this.setUpdate(update);
  next();
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
