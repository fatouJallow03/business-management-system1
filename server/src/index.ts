import express from "express";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import { csrfMiddleware } from "./middleware/csrfMiddleware.js";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
/**
 * Parses incoming JSON request bodies.
 */
app.use(csrfMiddleware);
app.use(express.json());

/**
 * Parses incoming cookies and makes them
 * accessible through req.cookies.
 */
app.use(cookieParser());
app.use("/products", productRoutes);
app.use("/auth", authRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});