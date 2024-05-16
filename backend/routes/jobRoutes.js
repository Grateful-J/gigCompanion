const express = require("express");
const router = express.Router();
const Job = require("../models/jobs.model");

//GET all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

//POST new job
router.post("/", async (req, res) => {
  const newJob = new Job(req.body);
  try {
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//old patch route
/* //PATCH jobs
router.patch("/:id", async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); */

// new patch route that allows update to submitted fields
// specifically duration and travel days pre.Save in mongoose

// PATCH jobs
router.patch("/:id", async (req, res) => {
  console.log("Received PATCH request for job:", req.params.id);
  try {
    // Log the incoming request body to see what's being updated
    console.log("Updating job with data:", req.body);

    const updatedJob = await Job.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true });

    if (!updatedJob) {
      console.log("No job found with ID:", req.params.id);
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("Updated job:", updatedJob);
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

  try {
    const job = await Job.findById(req.params.id);

    // Check if entry with the same rowId already exists
    const entryIndex = job.showDayEntries.findIndex((entry) => entry.rowId === rowId);

    if (entryIndex !== -1) {
      // Update existing entry
      job.showDayEntries[entryIndex] = { rowId, clockIn, breakTime, clockOut, description };
    } else {
      // Add new entry
      job.showDayEntries.push({ rowId, clockIn, breakTime, clockOut, description });
    }

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//DELETE job
router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NOTES ROUTES
// ---------------------------------------------------------

// PATCH a new note in job/notes/:id
router.patch("/notes/:id", async (req, res) => {
  const { note, noteDescription, noteDate, photo } = req.body;
  try {
    const job = await Job.findById(req.params.id);
    job.notes.push({ note, noteDescription, noteDate, photo });
    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Fetch notes
router.get("/notes/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.status(200).json(job.notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a note
router.delete("/notes/:id", async (req, res) => {
  const { noteId } = req.body;
  try {
    const job = await Job.findById(req.params.id);
    job.notes = job.notes.filter((note) => note._id !== noteId);
    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// EXPENSES ROUTES
// ---------------------------------------------------------

// GET single Expense
router.get("/expenses/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.status(200).json(job.expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch Expenses
router.get("/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH expenses
router.patch("/expenses/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    job.expenses.push(req.body);
    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
