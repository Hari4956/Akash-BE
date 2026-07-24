const Product = require("../models/Product");
const { uploadToCloudinary } = require("../middlewares/uploadMiddleware");

// @desc    Add new product
// @route   POST /api/products/add
// @access  Public/Private (depending on auth implementation)
const addProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      subcategory,
      brand,
      description,
      ingredients,
      nutrition,
      cookingInstructions,
      price,
      offerPrice,
      stock,
      weight,
      featuredProduct,
      trendingProduct,
      bestSeller,
      newArrival,
      flags,
      productStatus,
      seoTitle,
      seoDescription,
      redirectUrl,
      label,
    } = req.body;

    // Check for required fields
    if (!productName || !category || !description || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: productName, category, description, price, stock",
      });
    }

    // Process uploaded files — stream buffers to Cloudinary
    let thumbnail = "";
    let galleryImages = [];

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        const result = await uploadToCloudinary(req.files.thumbnail[0].buffer, "products");
        thumbnail = result.url;
      }
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        const uploads = await Promise.all(
          req.files.galleryImages.map((file) =>
            uploadToCloudinary(file.buffer, "products")
          )
        );
        galleryImages = uploads.map((u) => u.url);
      }
    }

    if (!thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required",
      });
    }

    // Parse flags — accept JSON string or array
    let parsedFlags = [];
    if (flags) {
      parsedFlags = typeof flags === "string" ? JSON.parse(flags) : flags;
    }

    // Create the product
    const product = await Product.create({
      productName,
      category,
      subcategory,
      brand,
      description,
      ingredients,
      nutrition,
      cookingInstructions,
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      stock: Number(stock),
      weight,
      thumbnail,
      galleryImages,
      featuredProduct: featuredProduct === "true" || featuredProduct === true,
      trendingProduct: trendingProduct === "true" || trendingProduct === true,
      bestSeller: bestSeller === "true" || bestSeller === true,
      newArrival: newArrival === "true" || newArrival === true,
      flags: parsedFlags,
      productStatus,
      seoTitle,
      seoDescription,
      redirectUrl,
      label,
    });

    // Populate flags to return full flag details
    await product.populate("flags");

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add product",
      error: error.message,
    });
  }
};

// @desc    Get all products (with pagination, search, filter, sort)
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      productStatus,
      minPrice,
      maxPrice,
    } = req.query;

    // Build the query object
    const query = {};

    // Search by productName and brand (case-insensitive)
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category (supports comma-separated string or array)
    if (category) {
      if (typeof category === "string" && category.includes(",")) {
        query.category = { $in: category.split(",").map((c) => c.trim()) };
      } else if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Filter by productStatus
    if (productStatus) {
      query.productStatus = productStatus;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Pagination calculations
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with pagination and sorting (latest first)
    const products = await Product.find(query)
      .populate("flags")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalPages,
        currentPage: pageNumber,
        products,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const isObjectId = id.match(/^[a-f\d]{24}$/i);
    const query = isObjectId ? { _id: id } : { slug: id };

    const product = await Product.findOne(query).populate("flags");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// @desc    Update product by ID
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productName,
      category,
      subcategory,
      brand,
      description,
      ingredients,
      nutrition,
      cookingInstructions,
      price,
      offerPrice,
      stock,
      weight,
      featuredProduct,
      trendingProduct,
      bestSeller,
      newArrival,
      flags,
      productStatus,
      seoTitle,
      seoDescription,
      redirectUrl,
      label,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update text fields only when provided
    if (productName !== undefined) product.productName = productName;
    if (category !== undefined) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (brand !== undefined) product.brand = brand;
    if (description !== undefined) product.description = description;
    if (ingredients !== undefined) product.ingredients = ingredients;
    if (nutrition !== undefined) product.nutrition = nutrition;
    if (cookingInstructions !== undefined) product.cookingInstructions = cookingInstructions;
    if (price !== undefined) product.price = Number(price);
    if (offerPrice !== undefined) product.offerPrice = Number(offerPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (weight !== undefined) product.weight = weight;
    if (featuredProduct !== undefined) product.featuredProduct = featuredProduct === "true" || featuredProduct === true;
    if (trendingProduct !== undefined) product.trendingProduct = trendingProduct === "true" || trendingProduct === true;
    if (bestSeller !== undefined) product.bestSeller = bestSeller === "true" || bestSeller === true;
    if (newArrival !== undefined) product.newArrival = newArrival === "true" || newArrival === true;
    if (flags !== undefined) {
      product.flags = typeof flags === "string" ? JSON.parse(flags) : flags;
    }
    if (productStatus !== undefined) product.productStatus = productStatus;
    if (seoTitle !== undefined) product.seoTitle = seoTitle;
    if (seoDescription !== undefined) product.seoDescription = seoDescription;
    if (redirectUrl !== undefined) product.redirectUrl = redirectUrl;
    if (label !== undefined) product.label = label;

    // Handle file replacements
    if (req.files) {
      // Replace thumbnail — no public_id stored for products, just overwrite
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        const result = await uploadToCloudinary(req.files.thumbnail[0].buffer, "products");
        product.thumbnail = result.url;
      }

      // Replace gallery images (append new ones to existing gallery)
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        const uploads = await Promise.all(
          req.files.galleryImages.map((file) => uploadToCloudinary(file.buffer, "products"))
        );
        product.galleryImages = [...product.galleryImages, ...uploads.map((u) => u.url)];
      }
    }

    const updated = await product.save();

    // Populate flags to return full flag details
    await updated.populate("flags");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// @desc    Delete product by ID
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
