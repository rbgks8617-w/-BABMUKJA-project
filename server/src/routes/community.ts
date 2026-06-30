import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { prisma } from "../db/prisma.js";

const createReviewSchema = z.object({
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(1000),
  tasteScore: z.number().min(0.5).max(5),
  valueScore: z.number().min(0.5).max(5),
  imageUrl: z.string().url().optional(),
});

const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(500),
  anonymousKey: z.string().trim().min(1).max(40).default("viewer"),
});

export const communityRouter = Router();

function serializeReview(review: {
  id: string;
  title: string;
  body: string;
  tasteScore: unknown;
  valueScore: unknown;
  imageUrl: string | null;
  createdAt: Date;
  comments: Array<{
    id: string;
    body: string;
    anonymousKey: string;
    createdAt: Date;
  }>;
}) {
  return {
    ...review,
    tasteScore: Number(review.tasteScore),
    valueScore: Number(review.valueScore),
    createdAt: review.createdAt.toISOString(),
    comments: review.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  };
}

communityRouter.get("/reviews", async (_request, response, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
          take: 60,
        },
      },
    });

    response.json({
      data: reviews.map(serializeReview),
    });
  } catch (error) {
    next(error);
  }
});

communityRouter.post("/reviews", async (request, response, next) => {
  try {
    const payload = createReviewSchema.parse(request.body);
    const review = await prisma.review.create({
      data: {
        id: `review-${Date.now()}`,
        title: payload.title,
        body: payload.body,
        tasteScore: payload.tasteScore,
        valueScore: payload.valueScore,
        imageUrl: payload.imageUrl,
      },
      include: {
        comments: true,
      },
    });

    response.status(201).json({
      data: serializeReview(review),
    });
  } catch (error) {
    next(error);
  }
});

communityRouter.post("/reviews/:reviewId/comments", async (request, response, next) => {
  try {
    const payload = createCommentSchema.parse(request.body);
    const existingReview = await prisma.review.findUnique({
      where: { id: request.params.reviewId },
      select: { id: true },
    });

    if (!existingReview) {
      throw new HttpError(404, "후기 글을 찾을 수 없습니다.");
    }

    const review = await prisma.review.update({
      where: { id: request.params.reviewId },
      data: {
        comments: {
          create: {
            id: `${request.params.reviewId}-comment-${Date.now()}`,
            body: payload.body,
            anonymousKey: payload.anonymousKey,
          },
        },
      },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
          take: 60,
        },
      },
    });

    response.status(201).json({
      data: serializeReview(review),
    });
  } catch (error) {
    next(error);
  }
});
