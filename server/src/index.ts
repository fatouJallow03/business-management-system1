
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { csrfMiddleware } from "./middleware/csrfMiddleware.js";

/**
 * Creates and configures the Walo Express API.
 *
 * Uses the configured frontend origin for CORS
 * while retaining cookie-based authentication
 * and CSRF protection.
 */
const app = express();

const clientUrl =
  process.env.CLIENT_URL || "http://localhost:5173";

// Allow credentialed requests from the trusted frontend.
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

// Check request origins before processing mutations.
app.use(csrfMiddleware);

// Parse JSON request bodies.
app.use(express.json());

// Parse authentication cookies.
app.use(cookieParser());

// Register API routes.
app.use("/products", productRoutes);
app.use("/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
