import express, { Request, Response } from "express";
import prisma from "../prisma";
import requireAdmin from "../middleware/requireAdmin";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/users",
  requireAdmin,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const users = await prisma.user.findMany({
        include: {
          branch: true,
        },
      });

      if (users.length === 0) {
        return res.status(404).json({ message: "No users available" });
      }

      res.status(200).json({ users });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/branches",
  requireAdmin,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const branches = await prisma.branch.findMany({
        include: {
          users: true,
        },
      });

      if (branches.length === 0) {
        return res.status(404).json({ message: "No branches available" });
      }

      res.status(200).json({ branches });
    } catch (error: any) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/branch",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    const branchId = Number(req.query.id);

    if (!branchId && isNaN(branchId)) {
      return res.status(400).json({ message: "Invalid branch ID" });
    }

    try {
      const branch = await prisma.branch.findUnique({
        where: {
          id: branchId,
        },
        include: {
          users: true,
        },
      });

      res.status(200).json({ branch });
    } catch (error: any) {
      console.error("Error fetching a branch:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/products",
  requireAdmin,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const products = await prisma.product.findMany();

      if (products.length === 0) {
        return res.status(404).json({ message: "No products available" });
      }

      res.status(200).json({ products });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/orders",
  requireAdmin,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          branch: true,
          products: true,
          _count: true,
        },
      });

      if (orders.length === 0) {
        return res.status(404).json({ message: "No orders available" });
      }

      res.status(200).json({ orders });
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Orders in specific branch
router.get(
  "/orders/branch/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    const branchId = Number(req.params.id);

    if (!branchId || isNaN(branchId)) {
      return res.status(400).json({ message: "Invalid branch ID" });
    }

    try {
      const orders = await prisma.order.findMany({
        where: {
          branchId,
        },
        include: {
          products: true,
          _count: true,
        },
      });

      if (orders.length === 0) {
        return res.status(404).json({ message: "No orders available" });
      }

      res.status(200).json({ orders });
    } catch (error: any) {
      console.error("Error fetching an order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
