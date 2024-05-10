const express = require("express");
const router = express.Router();
const Location = require("../models/location.model");

//GET all locations
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find({});
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST route to add a new location
router.post("/", async (req, res) => {
  try {
    const { name, fullAddress } = req.body;

    // Check if the location already exists based on Venue Name or Full Address
    const existingLocation = await Location.findOne({ name, fullAddress });

    if (existingLocation) {
      // Location already exists, return a 409 Conflict status
      return res.status(409).json({ error: "Location already exists" });
    }

    // Location doesn't exist, proceed with adding it to the database
    const newLocation = new Location(req.body);

    await newLocation.save();

    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error adding location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//PATCH location
router.patch("/:id", async (req, res) => {
  try {
    const updatedLocation = await Location.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//PUT location
router.put("/:id", async (req, res) => {
  try {
    const updatedLocation = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//DELETE location
router.delete("/:id", async (req, res) => {
  try {
    const deletedLocation = await Location.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
