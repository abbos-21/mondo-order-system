import express, { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();

router.post(
  "/admin",
  // requireAdmin,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { username, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (existingUser) {
        return res
          .status(409)
          .json({ message: `User with username "${username}" already exists` });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          isAdmin: true,
        },
      });

      const { password: hashed, ...adminWithoutPassword } = newAdmin;

      res.status(200).json({
        message: `Admin "${username}" created successfully`,
        newAdmin: adminWithoutPassword,
      });
    } catch (error: any) {
      console.error("Error registering an admin:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/",
  requireAdmin,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { username, password, branchId } = req.body;

      if (!branchId) {
        return res
          .status(400)
          .json({ message: "Branch ID is required to create a user" });
      }

      const branch = await prisma.branch.findUnique({
        where: {
          id: branchId,
        },
      });

      if (!branch) {
        return res
          .status(404)
          .json({ message: `Branch with ID "${branchId}" not found` });
      }

      const existingUser = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (existingUser) {
        return res
          .status(409)
          .json({ message: `User with username "${username}" already exists` });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          branchId,
        },
      });

      const { password: hashed, ...userWithoutPassword } = newUser;

      res.status(200).json({
        message: `User "${username}" created successfully for branch "${branch.name}"`,
        newUser: userWithoutPassword,
      });
    } catch (error: any) {
      console.error("Error registering a user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
