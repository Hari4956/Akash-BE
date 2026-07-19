const Flag = require("../models/Flag");
const { uploadToCloudinary } = require("../middlewares/uploadMiddleware");

// @desc    Add a new flag
// @route   POST /api/flag/add
// @access  Private/Admin
const addFlag = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Flag name is required",
      });
    }

    // Check if flag with same name already exists
    const existingFlag = await Flag.findOne({ name });
    if (existingFlag) {
      return res.status(400).json({
        success: false,
        message: "A flag with this name already exists",
      });
    }

    // Upload flag image to Cloudinary
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Flag image is required",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, "productFlags");

    const flag = await Flag.create({
      name,
      image: result.url,
    });

    res.status(201).json({
      success: true,
      message: "Flag added successfully",
      data: flag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add flag",
      error: error.message,
    });
  }
};

// @desc    Get all flags
// @route   GET /api/flag
// @access  Public
const getAllFlags = async (req, res) => {
  try {
    const flags = await Flag.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: flags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch flags",
      error: error.message,
    });
  }
};

// @desc    Get single flag by ID
// @route   GET /api/flag/:id
// @access  Public
const getFlagById = async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id);
    if (!flag) {
      return res.status(404).json({
        success: false,
        message: "Flag not found",
      });
    }

    res.status(200).json({
      success: true,
      data: flag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch flag",
      error: error.message,
    });
  }
};

// @desc    Update flag by ID
// @route   PUT /api/flag/:id
// @access  Private/Admin
const updateFlag = async (req, res) => {
  try {
    const { name } = req.body;

    const flag = await Flag.findById(req.params.id);
    if (!flag) {
      return res.status(404).json({
        success: false,
        message: "Flag not found",
      });
    }

    if (name !== undefined) flag.name = name;

    // Replace image if a new one is uploaded
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "productFlags");
      flag.image = result.url;
    }

    const updated = await flag.save();

    res.status(200).json({
      success: true,
      message: "Flag updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update flag",
      error: error.message,
    });
  }
};

// @desc    Delete flag by ID
// @route   DELETE /api/flag/:id
// @access  Private/Admin
const deleteFlag = async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id);
    if (!flag) {
      return res.status(404).json({
        success: false,
        message: "Flag not found",
      });
    }

    await flag.deleteOne();

    res.status(200).json({
      success: true,
      message: "Flag deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete flag",
      error: error.message,
    });
  }
};

module.exports = {
  addFlag,
  getAllFlags,
  getFlagById,
  updateFlag,
  deleteFlag,
};
