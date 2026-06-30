import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { store } from "../repositories/inMemoryStore.js";
import type { MealMateRoom } from "../types.js";

const createRoomSchema = z.object({
  restaurantId: z.string().trim().min(1),
  time: z.string().trim().min(1).max(40),
  topic: z.string().trim().min(1).max(80),
  note: z.string().trim().max(500).default(""),
  maxCount: z.number().int().min(2).max(6).default(4),
});

export const mealMatesRouter = Router();

mealMatesRouter.get("/", (_request, response) => {
  response.json({
    data: store.listMealMateRooms(),
  });
});

mealMatesRouter.post("/", (request, response, next) => {
  try {
    const payload = createRoomSchema.parse(request.body);

    if (!store.getRestaurant(payload.restaurantId)) {
      throw new HttpError(400, "존재하지 않는 식당입니다.");
    }

    const room: MealMateRoom = {
      id: `mate-${Date.now()}`,
      ...payload,
      currentCount: 1,
      createdAt: new Date().toISOString(),
    };

    response.status(201).json({
      data: store.addMealMateRoom(room),
    });
  } catch (error) {
    next(error);
  }
});
