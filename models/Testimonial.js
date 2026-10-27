const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Client or company name is required"],
      trim: true,
    },
    logo: {
      url: {
        type: String,
        required: [true, "Logo image is required"],
      },
      public_id: {
        type: String,
        default: "",
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
