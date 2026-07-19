const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    categoryImage: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from categoryName before saving
categorySchema.pre("save", async function () {
  if (this.isModified("categoryName") || !this.slug) {
    this.slug = slugify(this.categoryName, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

module.exports = mongoose.model("Category", categorySchema);
