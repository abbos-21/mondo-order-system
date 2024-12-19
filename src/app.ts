import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import infoRoutes from "./routes/info";
import userRoutes from "./routes/user";
import authRoutes from "./routes/auth";
import branchRoutes from "./routes/branch";
import productRoutes from "./routes/product";
import uploadRoutes from "./routes/upload";
import orderRoutes from "./routes/order";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/info", infoRoutes);
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/branch", branchRoutes);
app.use("/product", productRoutes);
app.use("/upload", uploadRoutes);
app.use("/order", orderRoutes);

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.get("/", async (req: Request, res: Response) => {
  res.json(`Hey, you just got hacked!`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
