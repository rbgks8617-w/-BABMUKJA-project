import { Router } from "express";
import { store } from "../repositories/inMemoryStore.js";
import { HttpError } from "../middleware/errorHandler.js";

export const restaurantsRouter = Router();

restaurantsRouter.get("/", (_request, response) => {
  response.json({
    data: store.listRestaurants(),
  });
});

restaurantsRouter.get("/:restaurantId", (request, response, next) => {
  const restaurant = store.getRestaurant(request.params.restaurantId);

  if (!restaurant) {
    next(new HttpError(404, "식당을 찾을 수 없습니다."));
    return;
  }

  response.json({
    data: {
      ...restaurant,
      menus: store.listMenus({ restaurantId: restaurant.id }),
    },
  });
});
