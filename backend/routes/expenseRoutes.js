const express = require("express");
const router = express.Router();
const Job = require("../models/jobs.model");

// EXPENSES ROUTES
// ---------------------------------------------------------

// GET single Expense
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.status(200).json(job.expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch Expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH new expenses by ending jobId
router.patch("/:id", async (req, res) => {
  const { expenseDate, amount, expenseDescription, category } = req.body;
  try {
    const job = await Job.findById(req.params.id);
    job.expenses.push({ expenseDate, amount, expenseDescription, category });
    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH expenses by sending jobId and expenseId
router.patch("/:jobId/:expenseId", async (req, res) => {
  const { expenseDate, amount, expenseDescription, category } = req.body;
  try {
    const job = await Job.findById(req.params.jobId);

    // Find the expense by its id
    const expense = job.expenses.id(req.params.expenseId);

    // If the expense exists, update its fields
    if (expense) {
      expense.expenseDate = expenseDate;
      expense.amount = amount;
      expense.expenseDescription = expenseDescription;
      expense.category = category;
      const updatedJob = await job.save();
      res.status(200).json(updatedJob);
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  /*   // if expense doesnt exists and jobId is valid push new expense
    if (req.params.jobId && req.params.expenseId) {
      const { expenseDate, amount, expenseDescription, category } = req.body;
      try {
        const job = await Job.findById(req.params.jobId);
        job.expenses.push({ expenseDate, amount, expenseDescription, category });
        const updatedJob = await job.save();
        res.status(200).json(updatedJob);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } */
});

// DELETE expenses by sending jobId and expenseId
router.delete("/:jobId/:expenseId", async (req, res) => {
  try {
    // Find the job by its id
    const job = await Job.findById(req.params.jobId);

    // Remove the expense from the job
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Find the expense by its id
    const expense = job.expenses.id(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    console.log("Expense found:", expense);
    if (expense) {
      // Remove the expense from the job
      job.expenses.remove(expense._id);
      const updatedJob = await job.save();
      res.status(200).json(updatedJob);
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
