const express = require("express");
const router = express.Router();
const { createUploader } = require("../middlewares/uploadMiddleware");

const {
  addFlag,
  getAllFlags,
  getFlagById,
  updateFlag,
  deleteFlag,
} = require("../controllers/flagController");

const flagUpload = createUploader();

// @route   POST /api/flag/add
// @desc    Add a new flag with image upload
// @access  Private/Admin
router.post("/add", flagUpload.single("image"), addFlag);

// @route   GET /api/flag
// @desc    Get all flags
// @access  Public
router.get("/", getAllFlags);

// @route   GET /api/flag/:id
// @desc    Get a single flag by ID
// @access  Public
router.get("/:id", getFlagById);

// @route   PUT /api/flag/:id
// @desc    Update a flag (optional image replacement)
// @access  Private/Admin
router.put("/:id", flagUpload.single("image"), updateFlag);

// @route   DELETE /api/flag/:id
// @desc    Delete a flag
// @access  Private/Admin
router.delete("/:id", deleteFlag);

module.exports = router;
