import { Request, Response, NextFunction } from "express";
import authMiddleware from "./authMiddleware";

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    next();
  });
};

export default requireAdmin;
