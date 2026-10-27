const Testimonial = require("../models/Testimonial");
const { uploadToCloudinary } = require("../middlewares/uploadMiddleware");
const cloudinary = require("cloudinary").v2;

// @desc    Add a new testimonial/client
// @route   POST /api/testimonial/add
// @access  Public / Admin
const createTestimonial = async (req, res) => {
  try {
    const { name, description, websiteUrl, order, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Client or company name is required",
      });
    }

    let logoData = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "testimonials");
      logoData = {
        url: result.url,
        public_id: result.public_id,
      };
    } else if (req.body.logo) {
      logoData = {
        url: req.body.logo,
        public_id: "",
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Logo image is required",
      });
    }

    const testimonial = await Testimonial.create({
      name,
      logo: logoData,
      description: description || "",
      websiteUrl: websiteUrl || "",
      order: order !== undefined ? Number(order) : 0,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Testimonial added successfully",
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create testimonial",
      error: error.message,
    });
  }
};

// @desc    Get all testimonials (Public gets Active, Admin can get all)
// @route   GET /api/testimonial
// @access  Public
const getAllTestimonials = async (req, res) => {
  try {
    const filter = {};
    const { status, all } = req.query;

    if (all === "true" || status === "all") {
      // Return everything
    } else if (status) {
      filter.status = status;
    } else {
      // Default public: active testimonials
      filter.status = "Active";
    }

    const testimonials = await Testimonial.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
      error: error.message,
    });
  }
};

// @desc    Get single testimonial by ID
// @route   GET /api/testimonial/:id
// @access  Public
const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonial",
      error: error.message,
    });
  }
};

// @desc    Update testimonial by ID
// @route   PUT /api/testimonial/:id
// @access  Public / Admin
const updateTestimonial = async (req, res) => {
  try {
    const { name, description, websiteUrl, order, status } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    if (name !== undefined) testimonial.name = name;
    if (description !== undefined) testimonial.description = description;
    if (websiteUrl !== undefined) testimonial.websiteUrl = websiteUrl;
    if (order !== undefined) testimonial.order = Number(order);
    if (status !== undefined) testimonial.status = status;

    // Check if new file was uploaded
    if (req.file) {
      // If previous image had a public_id on Cloudinary, delete it
      if (testimonial.logo && testimonial.logo.public_id) {
        try {
          await cloudinary.uploader.destroy(testimonial.logo.public_id);
        } catch (err) {
          console.warn("Failed to delete old image from Cloudinary:", err.message);
        }
      }
      const result = await uploadToCloudinary(req.file.buffer, "testimonials");
      testimonial.logo = {
        url: result.url,
        public_id: result.public_id,
      };
    } else if (req.body.logo && typeof req.body.logo === "string") {
      testimonial.logo = {
        url: req.body.logo,
        public_id: "",
      };
    }

    const updated = await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update testimonial",
      error: error.message,
    });
  }
};

// @desc    Delete testimonial by ID
// @route   DELETE /api/testimonial/:id
// @access  Public / Admin
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    // Delete image from Cloudinary if exists
    if (testimonial.logo && testimonial.logo.public_id) {
      try {
        await cloudinary.uploader.destroy(testimonial.logo.public_id);
      } catch (err) {
        console.warn("Failed to delete image from Cloudinary:", err.message);
      }
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
      error: error.message,
    });
  }
};

module.exports = {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};
