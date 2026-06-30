import { Router } from "express";
import { z } from "zod";
import { store } from "../repositories/inMemoryStore.js";
import type { Review } from "../types.js";

const createReviewSchema = z.object({
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(1000),
  tasteScore: z.number().min(0.5).max(5),
  valueScore: z.number().min(0.5).max(5),
  imageUrl: z.string().url().optional(),
});

export const communityRouter = Router();

communityRouter.get("/reviews", (_request, response) => {
  response.json({
    data: store.listReviews(),
  });
});

communityRouter.post("/reviews", (request, response, next) => {
  try {
    const payload = createReviewSchema.parse(request.body);
    const review: Review = {
      id: `review-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    response.status(201).json({
      data: store.addReview(review),
    });
  } catch (error) {
    next(error);
  }
});
