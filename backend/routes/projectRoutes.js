const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Job = require("../models/Job");
const User = require("../models/User");

// Get all projects
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find({});
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single project
router.get("/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new project
router.post("/projects", async (req, res) => {
  const { projectName, projectManager, description, startDate, endDate } = req.body;
  try {
    const newProject = new Project({ projectName, projectManager, description, startDate, endDate });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign a job to a user within a project
router.post("/projects/:projectId/assign-job", async (req, res) => {
  const { projectId } = req.params;
  const { userId, jobDetails } = req.body; // jobDetails should contain necessary job info

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const newJob = new Job({ ...jobDetails, project: projectId });
    await newJob.save();

    project.jobs.push(newJob._id);
    await project.save();

    const user = await User.findById(userId);
    user.assignedJobs.push(newJob._id);
    await user.save();

    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a project via PATCH
router.patch("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { projectName, projectManager, description, startDate, endDate } = req.body;
  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    project.projectName = projectName;
    project.projectManager = projectManager;
    project.description = description;
    project.startDate = startDate;
    project.endDate = endDate;
    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a project
router.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    await project.remove();
    res.status(200).json({ message: "Project successfully deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove a job from a user within a project by user ID & job ID
router.delete("/projects/:projectId/assign-job/:jobId", async (req, res) => {
  const { projectId, jobId, userId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.assignedJobs.remove(jobId);
    await user.save();

    project.jobs.remove(jobId);
    await project.save();

    res.status(200).json({ message: "Job removed from user successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
