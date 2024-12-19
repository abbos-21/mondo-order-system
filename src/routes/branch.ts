import express, { Request, Response } from "express";
import prisma from "../prisma";
import requireAdmin from "../middleware/requireAdmin";

const router = express.Router();

router.post(
  "/",
  requireAdmin,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { name, location } = req.body;

      const existingBranch = await prisma.branch.findUnique({
        where: {
          name,
        },
      });

      if (existingBranch) {
        return res
          .status(409)
          .json({ message: `Branch with name "${name}" already exists` });
      }

      const newBranch = await prisma.branch.create({
        data: {
          name,
          location,
        },
      });

      res
        .status(200)
        .json({ message: `Branch "${name}" created successfully`, newBranch });
    } catch (error: any) {
      console.error("Error creating a branch:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
