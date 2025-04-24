import express, { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with username "${username}" not found` });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      "my_secret_key",
      { expiresIn: "72h" }
    );

    res
      .status(200)
      .json({
        message: "Login successful",
        token,
        isAdmin: user.isAdmin,
        branchId: user.branchId,
      });
  } catch (error: any) {
    console.error("Error authenticating a user:", error);
    res.status(500).json({ message: "Login failed. Internal server error" });
  }
});

export default router;
