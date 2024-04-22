const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    name: String,
    fullAddress: String,
    street: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: String,
    country: String,
  },

  { timestamps: true }
);

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
