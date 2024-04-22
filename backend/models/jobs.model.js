const mongoose = require("mongoose");
const rtwStates = require("../utils/rtwStates"); // Adjusted for a utils directory

const jobSchema = new mongoose.Schema(
  {
    jobName: String,
    client: String,
    location: String,
    startDate: Date,
    endDate: Date,
    travelDays: Number,
    isRTW: { type: Boolean, default: false },
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
}); */

// Pre-save hook to set isRTW based on location
jobSchema.pre("save", function (next) {
  this.isRTW = rtwStates.includes(this.location);
  next();
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
