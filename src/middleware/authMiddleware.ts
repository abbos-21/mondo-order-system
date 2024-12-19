import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting format "Bearer <token>"

  if (!token) {
    res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
    return;
  }

  try {
    const decoded = jwt.verify(token, "my_secret_key");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

export default authMiddleware;
