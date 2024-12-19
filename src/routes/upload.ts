import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import prisma from "../prisma";
import fs from "fs";
import path from "path";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "../uploads", "products");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only jpg, png, and webp are allowed."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

interface UploadRequest extends Request {
  files?: Express.Multer.File[];
}

router.post(
  "/product/:id",
  requireAdmin,
  upload.array("images"),
  async (
    req: UploadRequest,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const productId = Number(req.params.id);

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images were uploaded" });
      }

      const uploadedFiles = req.files as Express.Multer.File[];
      const imgUrls = uploadedFiles.map((file) => {
        const filePath = `/uploads/products/${file.filename}`;
        return filePath;
      });

      const existingImgUrls = product.imgUrls
        ? JSON.parse(product.imgUrls)
        : [];
      const updatedImgUrls = [...existingImgUrls, ...imgUrls];

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          imgUrls: JSON.stringify(updatedImgUrls),
        },
      });

      return res.status(200).json({
        message: "Images uploaded successfully",
        ...updatedProduct,
        imgUrls: JSON.parse(updatedProduct.imgUrls as string),
      });
    } catch (error: any) {
      if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({
        message: "An unexpected error occurred.",
        details: error.message,
      });
    }
  }
);

router.delete(
  "/product/:id",
  async (req: Request, res: Response): Promise<any> => {
    const productId = Number(req.params.id);
    const { imageUrl } = req.body;

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const existingImgUrls = product.imgUrls
        ? JSON.parse(product.imgUrls)
        : [];

      if (!existingImgUrls.includes(imageUrl)) {
        return res.status(404).json({ message: "Image not found in product" });
      }

      const filePath = path.join(__dirname, `..${imageUrl}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const updatedImgUrls = existingImgUrls.filter(
        (url: any) => url !== imageUrl
      );
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          imgUrls: JSON.stringify(updatedImgUrls),
        },
      });

      return res
        .status(200)
        .json({ message: "Image deleted successfully", updatedProduct });
    } catch (error: any) {
      return res.status(500).json({
        message: "An unexpected error occurred.",
        details: error.message,
      });
    }
  }
);

router.put(
  "/product/:id",
  upload.single("image"),
  async (req: UploadRequest, res: Response): Promise<any> => {
    const productId = Number(req.params.id);
    const { oldImageUrl } = req.body;

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No new image uploaded" });
      }

      const existingImgUrls = product.imgUrls
        ? JSON.parse(product.imgUrls)
        : [];

      if (!existingImgUrls.includes(oldImageUrl)) {
        return res
          .status(404)
          .json({ error: "Old image not found in product." });
      }

      const oldFilePath = path.join(__dirname, `..${oldImageUrl}`);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      const newImageUrl = `/uploads/products/${req.file.filename}`;
      const updatedImgUrls = existingImgUrls.map((url: any) =>
        url === oldImageUrl ? newImageUrl : url
      );

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          imgUrls: JSON.stringify(updatedImgUrls),
        },
      });

      return res
        .status(200)
        .json({ message: "Image updated successfully", updatedProduct });
    } catch (error: any) {
      return res.status(500).json({
        message: "An unexpected error occurred.",
        details: error.message,
      });
    }
  }
);

export default router;
