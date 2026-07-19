const Category = require("../models/Category");
const slugify = require("slugify");
const { uploadToCloudinary } = require("../middlewares/uploadMiddleware");

// @desc    Add new category
// @route   POST /api/category/add
// @access  Private/Admin
const addCategory = async (req, res) => {
  try {
    const { categoryName, description, status } = req.body;

    // Validate required fields
    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check for duplicate category name
    const existingCategory = await Category.findOne({
      categoryName: { $regex: `^${categoryName}$`, $options: "i" },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    // Auto-generate slug from categoryName
    const slug = slugify(categoryName, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Check for duplicate slug
    const existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "A category with a similar name (slug) already exists",
      });
    }

    // Handle uploaded category image — stream buffer to Cloudinary
    let categoryImage = { url: "", public_id: "" };
    if (req.file) {
      categoryImage = await uploadToCloudinary(req.file.buffer, "categories");
    }

    // Create the category
    const category = await Category.create({
      categoryName,
      slug,
      description,
      status: status || "Active",
      categoryImage,
    });

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      data: category,
    });
  } catch (error) {
    // Handle Mongoose unique constraint error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `A category with that ${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add category",
      error: error.message,
    });
  }
};

// @desc    Get all categories (with pagination, search, filter, sort)
// @route   GET /api/category
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    // Build query object
    const query = {};

    // Search by categoryName (case-insensitive)
    if (search) {
      query.categoryName = { $regex: search, $options: "i" };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Pagination calculations
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with sorting (latest first) and pagination
    const categories = await Category.find(query)
      .select("_id categoryName slug description categoryImage status createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Total count for pagination meta
    const totalCategories = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / limitNumber);

    res.status(200).json({
      success: true,
      data: {
        totalCategories,
        totalPages,
        currentPage: pageNumber,
        categories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/category/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Support lookup by MongoDB _id OR slug
    const isObjectId = id.match(/^[a-f\d]{24}$/i);
    const query = isObjectId ? { _id: id } : { slug: id };

    const category = await Category.findOne(query).select(
      "_id categoryName slug description categoryImage status createdAt"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

// @desc    Update category by ID
// @route   PUT /api/category/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description, status } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check for duplicate name (exclude current document)
    if (categoryName && categoryName !== category.categoryName) {
      const duplicate = await Category.findOne({
        categoryName: { $regex: `^${categoryName}$`, $options: "i" },
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
      category.categoryName = categoryName;
      // Slug will be auto-regenerated by the pre-save hook
    }

    if (description !== undefined) category.description = description;
    if (status !== undefined) category.status = status;

    // If a new image is uploaded, delete the old one from Cloudinary and upload the new one
    if (req.file) {
      if (category.categoryImage && category.categoryImage.public_id) {
        const cloudinary = require("cloudinary").v2;
        await cloudinary.uploader.destroy(category.categoryImage.public_id);
      }
      category.categoryImage = await uploadToCloudinary(req.file.buffer, "categories");
    }

    const updated = await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `A category with that ${field} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// @desc    Delete category by ID
// @route   DELETE /api/category/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Delete image from Cloudinary if it exists
    if (category.categoryImage && category.categoryImage.public_id) {
      const cloudinary = require("cloudinary").v2;
      await cloudinary.uploader.destroy(category.categoryImage.public_id);
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
