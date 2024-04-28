const express = require("express");
const router = express.Router();
const Timecard = require("../models/timecards.model");

//GET all timecards
router.get("/", async (req, res) => {
  try {
    const timecard = await Timecard.find({});
    res.status(200).json(timecard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//POST new timecard
router.post("/", async (req, res) => {
  const newTimecard = new Timecard(req.body);
  try {
    const savedTimecard = await newTimecard.save();
    res.status(201).json(savedTimecard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//PATCH a timecard
router.patch("/:id", async (req, res) => {
  try {
    const updatedTimecard = await Timecard.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedTimecard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH to mark timecard as submitted
router.patch("/submit/:id", async (req, res) => {
  try {
    const updatedTimecard = await Timecard.findByIdAndUpdate(req.params.id, { isSubmited: true }, { new: true });
    res.status(200).json(updatedTimecard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH to mark multiple timecards as submitted
router.patch("/submit-multiple", async (req, res) => {
  const { ids } = req.body; // Array of timecard IDs
  try {
    const updates = await Timecard.updateMany(
      { _id: { $in: ids } }, // Filter to select timecards with IDs in the provided array
      { $set: { isSubmited: true } } // Set isSubmitted to true
    );
    if (updates.modifiedCount === ids.length) {
      res.status(200).json({ message: `${updates.modifiedCount} timecards submitted successfully` });
    } else {
      res.status(400).json({ message: "Some timecards were not found and could not be updated" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//DELETE a timecard
router.delete("/:id", async (req, res) => {
  try {
    const deletedTimecard = await Timecard.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedTimecard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
