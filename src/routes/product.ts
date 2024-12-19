import express, { Request, Response } from "express";
import prisma from "../prisma";
import requireAdmin from "../middleware/requireAdmin";
import fs from "fs";
import path from "path";

const router = express.Router();

// Create a product
router.post(
  "/",
  requireAdmin,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { name, price, description } = req.body;

      if (!name || !price) {
        return res.status(400).json({ message: "Name and price are required" });
      }

      const existingProduct = await prisma.product.findUnique({
        where: {
          name,
        },
      });

      if (existingProduct) {
        return res
          .status(409)
          .json({ message: `Product with name "${name}" already exists` });
      }

      const newProduct = await prisma.product.create({
        data: {
          name,
          price,
          description,
        },
      });

      res.status(200).json({
        message: `Product "${name}" created successfully`,
        newProduct,
      });
    } catch (error: any) {
      console.error("Error creating a product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete(
  "/:id",
  requireAdmin,
  async (req: Request, res: Response): Promise<any> => {
    const productId = Number(req.params.id);

    if (!productId || isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    try {
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with ID ${productId} not found` });
      }

      if (
        JSON.parse(product.imgUrls as string) &&
        JSON.parse(product.imgUrls as string).length !== 0
      ) {
        JSON.parse(product.imgUrls as string).forEach((imgUrl: string) => {
          const filePath = path.join(__dirname, `..${imgUrl}`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      await prisma.product.delete({
        where: {
          id: product.id,
        },
      });

      res.status(200).json({
        message: `Product ${product.name} deleted successfully`,
        product,
      });
    } catch (error: any) {
      console.error("Error deleting a product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
