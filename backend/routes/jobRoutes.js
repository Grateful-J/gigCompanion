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
/* //old patch route
//PATCH jobs
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

//DELETE job
router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
