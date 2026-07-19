const express = require("express");
const router = express.Router();
const { categoryUpload } = require("../middlewares/uploadMiddleware");

const {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

// Routes

// @route   POST /api/category/add
// @desc    Add a new category (single image upload)
// @access  Private/Admin
router.post("/add", categoryUpload.single("categoryImage"), addCategory);

// @route   GET /api/category
// @desc    Get all categories with search, filter, pagination
// @access  Public
router.get("/", getAllCategories);

// @route   GET /api/category/:id
// @desc    Get a single category by MongoDB _id or slug
// @access  Public
router.get("/:id", getCategoryById);

// @route   PUT /api/category/:id
// @desc    Update a category (optional new image upload)
// @access  Private/Admin
router.put("/:id", categoryUpload.single("categoryImage"), updateCategory);

// @route   DELETE /api/category/:id
// @desc    Delete a category and its Cloudinary image
// @access  Private/Admin
router.delete("/:id", deleteCategory);

module.exports = router;
