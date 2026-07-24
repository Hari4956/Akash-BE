const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    ingredients: {
      type: String,
    },
    nutrition: {
      type: String,
    },
    cookingInstructions: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    offerPrice: {
      type: Number,
      min: [0, "Offer price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    weight: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail image is required"],
    },
    galleryImages: [
      {
        type: String,
      },
    ],
    featuredProduct: {
      type: Boolean,
      default: false,
    },
    trendingProduct: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    flags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flag",
      },
    ],
    productStatus: {
      type: String,
      enum: ["Active", "Inactive", "Draft"],
      default: "Active",
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
    },
    redirectUrl: {
      type: String,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug automatically from productName
productSchema.pre("save", async function () {
  if (this.isModified("productName")) {
    this.slug = slugify(this.productName, { lower: true, strict: true });
  }
});

module.exports = mongoose.model("Product", productSchema);
