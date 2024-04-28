const express = require("express");
const router = express.Router();
const Timecard = require("../models/timecards.model");

router.get("/", async (req, res) => {
  try {
    const isSubmitted = req.query.isSubmitted; // This will be a string "true" or "false", or undefined
    let query = {};

    if (isSubmitted !== undefined) {
      query.isSubmitted = isSubmitted === "true"; // Compare with the string "true"
    }

    const timecards = await Timecard.find(query);
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

// PATCH to mark multiple timecards as submitted
router.patch("/submit-multiple", (req, res) => {
  console.log("Handling submit-multiple with IDs:", req.body.ids);
  const { ids } = req.body;
  console.log("IDs to submit:", ids);
  Timecard.updateMany({ _id: { $in: ids } }, { $set: { isSubmitted: true } }, { $set: { dateSubmited: new Date() } }) // Set dateSubmited to current date
    .then((result) => res.status(200).json({ message: `${result.modifiedCount} timecards submitted successfully` }))
    .catch((error) => res.status(500).json({ message: error.message }));
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
