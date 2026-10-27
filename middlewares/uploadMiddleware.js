const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary once using .env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — multer holds file in buffer, we stream it to Cloudinary
const memoryStorage = multer.memoryStorage();

/**
 * Creates a Multer instance using memory storage.
 * Compatible with multer v2.x
 *
 * @returns {import("multer").Multer}
 */
const createUploader = () => multer({ storage: memoryStorage });

/**
 * Uploads a single file buffer to Cloudinary via upload stream.
 *
 * @param {Buffer} buffer - File buffer from req.file.buffer
 * @param {string} folder - Cloudinary destination folder
 * @returns {Promise<{ url: string, public_id: string }>}
 */
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"] },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

// Pre-built multer instances (call .single() or .fields() on these in routes)
const categoryUpload = createUploader();
const productUpload = createUploader();

module.exports = {
  createUploader,      // generic factory for new modules
  uploadToCloudinary,  // use inside controllers to push buffer → Cloudinary
  categoryUpload,      // categoryUpload.single("categoryImage")
  productUpload,       // productUpload.fields([...])
};
