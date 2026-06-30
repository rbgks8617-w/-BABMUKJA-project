import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { store } from "../repositories/inMemoryStore.js";
import type { Order } from "../types.js";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        menuId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(20),
        selectedOptionIds: z.array(z.string()).optional(),
      }),
    )
    .min(1),
});

export const ordersRouter = Router();

ordersRouter.get("/", (_request, response) => {
  response.json({
    data: store.listOrders(),
  });
});

ordersRouter.post("/", (request, response, next) => {
  try {
    const payload = createOrderSchema.parse(request.body);
    const totalPrice = payload.items.reduce((sum, item) => {
      const menu = store.getMenu(item.menuId);

      if (!menu) {
        throw new HttpError(400, `존재하지 않는 메뉴입니다: ${item.menuId}`);
      }

      return sum + menu.price * item.quantity;
    }, 0);

    const order: Order = {
      id: `order-${Date.now()}`,
      items: payload.items,
      totalPrice,
      status: "created",
      createdAt: new Date().toISOString(),
    };

    response.status(201).json({
      data: store.addOrder(order),
    });
  } catch (error) {
    next(error);
  }
});
