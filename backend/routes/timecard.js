const express = require("express");
const router = express.Router();
const Timecard = require("../models/timecard.model");

//GET all timecards
router.get("/", async (req, res) => {
  try {
    const timecards = await Timecard.find({});
    res.status(200).json(timecards);
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
