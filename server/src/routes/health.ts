import { Router } from "express";
import { config } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    ok: true,
    service: "babmukja-api",
    env: config.env,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
