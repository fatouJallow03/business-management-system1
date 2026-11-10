import express from "express";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
const app = express();
app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json());

app.use("/products", productRoutes);
app.use("/auth", authRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});