import { Router } from "express";
import { store } from "../repositories/inMemoryStore.js";
import { HttpError } from "../middleware/errorHandler.js";

export const menusRouter = Router();

menusRouter.get("/", (request, response) => {
  response.json({
    data: store.listMenus({
      category: typeof request.query.category === "string" ? request.query.category : undefined,
      query: typeof request.query.q === "string" ? request.query.q : undefined,
      restaurantId: typeof request.query.restaurantId === "string" ? request.query.restaurantId : undefined,
    }),
  });
});

menusRouter.get("/:menuId", (request, response, next) => {
  const menu = store.getMenu(request.params.menuId);

  if (!menu) {
    next(new HttpError(404, "메뉴를 찾을 수 없습니다."));
    return;
  }

  response.json({
    data: {
      ...menu,
      restaurant: store.getRestaurant(menu.restaurantId),
    },
  });
});
