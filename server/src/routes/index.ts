import { Router } from "express";
import { communityRouter } from "./community.js";
import { healthRouter } from "./health.js";
import { mealMatesRouter } from "./mealMates.js";
import { menusRouter } from "./menus.js";
import { ordersRouter } from "./orders.js";
import { restaurantsRouter } from "./restaurants.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/restaurants", restaurantsRouter);
apiRouter.use("/menus", menusRouter);
apiRouter.use("/community", communityRouter);
apiRouter.use("/meal-mates", mealMatesRouter);
apiRouter.use("/orders", ordersRouter);
