import express, { Request, Response } from "express";
import prisma from "../prisma";
import QRCode from "qrcode";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { branchId, clientName, clientTel, clientLocation, products } =
    req.body;

  try {
    if (
      !branchId ||
      !clientName ||
      !clientTel ||
      !clientLocation ||
      !Array.isArray(products) ||
      !products.every(
        (product: any) =>
          typeof product.id === "number" && typeof product.quantity === "number"
      )
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

    const productIds = products.map((p: any) => p.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (dbProducts.length !== productIds.length) {
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
        products: {
          create: products.map((product: any) => ({
            productId: product.id,
            quantity: product.quantity,
          })),
        },
      },
      include: { products: true, branch: true },
    });

    const paymentUrl = `http://localhost:3000/order/pay/${order.id}`;
    const qrCode = await QRCode.toDataURL(paymentUrl);

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
        include: { products: { include: { product: true } } },
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
        order: {
          ...updatedOrder,
          products: order.products.map((op: any) => ({
            id: op.productId,
            name: op.product.name,
            quantity: op.quantity,
            price: op.product.price,
          })),
        },
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
