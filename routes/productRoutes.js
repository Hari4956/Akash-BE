const express = require("express");
const router = express.Router();
const { productUpload } = require("../middlewares/uploadMiddleware");

const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Routes

// @route   POST /api/products/add
// @desc    Add a new product
// @access  Public or Private (Add your auth middleware here if needed)
router.post(
  "/add",
  productUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  addProduct
);

// @route   GET /api/products
// @desc    Get all products with search, filter, pagination
// @access  Public
router.get("/", getAllProducts);

// @route   GET /api/products/:id
// @desc    Get a single product by MongoDB _id or slug
// @access  Public
router.get("/:id", getProductById);

// @route   PUT /api/products/:id
// @desc    Update a product (optional thumbnail/gallery image replacement)
// @access  Private/Admin
router.put(
  "/:id",
  productUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updateProduct
);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete("/:id", deleteProduct);

module.exports = router;
