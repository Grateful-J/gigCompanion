const express = require("express");
const router = express.Router();
const Job = require("../models/jobs.model");

// NOTES ROUTES
// ---------------------------------------------------------

// PATCH a new note in job/notes/:id
router.patch("/:id", async (req, res) => {
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
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.status(200).json(job.notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a note
router.delete("/:id", async (req, res) => {
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

module.exports = router;
