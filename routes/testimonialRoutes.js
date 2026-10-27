const express = require("express");
const router = express.Router();
const { createUploader } = require("../middlewares/uploadMiddleware");

const {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");

const testimonialUpload = createUploader();

// @route   POST /api/testimonial/add
// @desc    Add a new testimonial with logo image upload
router.post("/add", testimonialUpload.single("logo"), createTestimonial);

// Also support POST /api/testimonial/
router.post("/", testimonialUpload.single("logo"), createTestimonial);

// @route   GET /api/testimonial
// @desc    Get all testimonials (supports ?status=Active, ?all=true)
router.get("/", getAllTestimonials);

// @route   GET /api/testimonial/:id
// @desc    Get single testimonial by ID
router.get("/:id", getTestimonialById);

// @route   PUT /api/testimonial/:id
// @desc    Update testimonial (optional new logo)
router.put("/:id", testimonialUpload.single("logo"), updateTestimonial);

// @route   DELETE /api/testimonial/:id
// @desc    Delete testimonial
router.delete("/:id", deleteTestimonial);

module.exports = router;
