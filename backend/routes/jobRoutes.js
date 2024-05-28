const express = require("express");
const router = express.Router();
const Job = require("../models/jobs.model");
const authenticateToken = require("../middleware/authMiddleware");

// Middleware to ensure the user is authenticated
router.use(authenticateToken);

/* //GET all jobs - No Auth
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); */

// Route to get jobs for the logged-in user
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET single job
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/* 
//POST new job - No Auth
router.post("/", async (req, res) => {
  const newJob = new Job(req.body);
  try {
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); */

// Route to create a new job for the logged-in user
router.post("/", async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      user: req.user.id,
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH jobs
router.patch("/:id", async (req, res) => {
  console.log("Received PATCH request for job:", req.params.id);
  try {
    // Log the incoming request body to see what's being updated
    //console.log("Updating job with data:", req.body);

    const updatedJob = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Ensure the user owns the job
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      console.log("No job found with ID or user does not own the job:", req.params.id);
      return res.status(404).json({ message: "Job not found" });
    }

    //console.log("Updated job:", updatedJob);
    res.status(200).json(updatedJob);
  } catch (error) {
    console.error("Error in PATCH job route:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update job show timesheets
// PATCH a job to add or update showDayEntries
router.patch("/daily/:id", async (req, res) => {
  const { rowId, clockIn, breakTime, clockOut, description } = req.body;
  // Log the user ID and job ID for debugging
  console.log("User ID:", req.user.id);
  console.log("Job ID:", req.params.id);

  try {
    //const job = await Job.findById(req.params.id); OLD- functional but not with new auth
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });

    // Check if entry with the same rowId already exists
    const entryIndex = job.showDayEntries.findIndex((entry) => entry.rowId === rowId);

    if (entryIndex !== -1) {
      // Update existing entry
      job.showDayEntries[entryIndex] = { rowId, clockIn, breakTime, clockOut, description };
      console.log("Entry updated:", job.showDayEntries[entryIndex]);
    } else {
      // Add new entry
      job.showDayEntries.push({ rowId, clockIn, breakTime, clockOut, description });
      console.log("Entry added:", job.showDayEntries[job.showDayEntries.length - 1]);
    }

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE job
router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
