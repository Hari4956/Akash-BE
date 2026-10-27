const dotenv = require("dotenv");
dotenv.config(); // Must be first — loads .env before any other module reads process.env

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const flagRoutes = require("./routes/flagRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080",
  "http://localhost:3000",
  "https://singular-pony-c89e20.netlify.app",
  "https://akashfoodadmin.netlify.app",
]; // Include .env and common Vite ports

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or any localhost origin
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/flag", flagRoutes);
app.use("/api/testimonial", testimonialRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Akash API is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
