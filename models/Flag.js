const mongoose = require("mongoose");

const flagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Flag name is required"],
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      required: [true, "Flag image is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Flag", flagSchema);
