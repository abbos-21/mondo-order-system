import express, { Request, Response } from "express";
import prisma from "../prisma";
import QRCode from "qrcode";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { branchId, clientName, clientTel, clientLocation, productIds } =
    req.body;

  try {
    if (
      !branchId ||
      !clientName ||
      !clientTel ||
      !clientLocation ||
      !Array.isArray(productIds)
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields or invalid input" });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return res
        .status(400)
        .json({ message: "One or more products not found" });
    }

    const order = await prisma.order.create({
      data: {
        clientName,
        clientTel,
        clientLocation,
        branch: { connect: { id: branchId } },
        products: { connect: productIds.map((id: number) => ({ id })) },
      },
      include: { products: true, branch: true },
    });

    const paymentUrl = `http://localhost:3000/order/pay/${order.id}`;
    const generateQRCode = async () => {
      try {
        const qrCode = await QRCode.toDataURL(paymentUrl);
        return qrCode;
      } catch (error) {
        console.error("Error generating QRCode:", error);
      }
    };
    const qrCode = await generateQRCode();

    return res.status(201).json({ qrCode, paymentUrl, order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the order" });
  }
});

router.get(
  "/pay/:orderId",
  async (req: Request, res: Response): Promise<any> => {
    const id = Number(req.params.orderId);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: "PAID" },
      });

      return res.status(200).json({
        message: "Payment successful",
        order: updatedOrder,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing the payment" });
    }
  }
);

export default router;
