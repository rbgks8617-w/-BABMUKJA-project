import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { prisma } from "../db/prisma.js";

const createReviewSchema = z.object({
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(1000),
  participantKey: z.string().trim().min(1).max(80).default("legacy-viewer"),
  tasteScore: z.number().min(0.5).max(5),
  valueScore: z.number().min(0.5).max(5),
  imageUrl: z.string().url().optional(),
});

const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(500),
  participantKey: z.string().trim().min(1).max(80).default("legacy-viewer"),
});

const deleteReviewSchema = z.object({
  participantKey: z.string().trim().min(1).max(80),
});

export const communityRouter = Router();

async function resolveReviewAnonymousNumber(reviewId: string, participantKey: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { authorKey: true },
  });

  if (review?.authorKey && review.authorKey === participantKey) {
    return 1;
  }

  const existingComment = await prisma.reviewComment.findFirst({
    where: { reviewId, participantKey },
    orderBy: { createdAt: "asc" },
    select: { anonymousNumber: true },
  });

  if (existingComment) {
    return existingComment.anonymousNumber;
  }

  const maxCommentNumber = await prisma.reviewComment.aggregate({
    where: { reviewId },
    _max: { anonymousNumber: true },
  });

  return Math.max(review?.authorKey ? 1 : 0, maxCommentNumber._max.anonymousNumber ?? 0) + 1;
}

function serializeReview(review: {
  id: string;
  title: string;
  body: string;
  authorKey: string | null;
  tasteScore: unknown;
  valueScore: unknown;
  imageUrl: string | null;
  createdAt: Date;
  comments: Array<{
    id: string;
    body: string;
    anonymousKey: string;
    participantKey: string;
    anonymousNumber: number;
    createdAt: Date;
  }>;
}) {
  return {
    ...review,
    tasteScore: Number(review.tasteScore),
    valueScore: Number(review.valueScore),
    createdAt: review.createdAt.toISOString(),
    comments: review.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      anonymousKey: comment.anonymousKey,
      anonymousNumber: comment.anonymousNumber,
      anonymousLabel: `익명${comment.anonymousNumber}`,
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
        authorKey: payload.participantKey,
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

    const anonymousNumber = await resolveReviewAnonymousNumber(request.params.reviewId, payload.participantKey);

    const review = await prisma.review.update({
      where: { id: request.params.reviewId },
      data: {
        comments: {
          create: {
            id: `${request.params.reviewId}-comment-${Date.now()}`,
            body: payload.body,
            anonymousKey: `anonymous-${anonymousNumber}`,
            participantKey: payload.participantKey,
            anonymousNumber,
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

communityRouter.delete("/reviews/:reviewId", async (request, response, next) => {
  try {
    const payload = deleteReviewSchema.parse(request.body);
    const review = await prisma.review.findUnique({
      where: { id: request.params.reviewId },
      select: { id: true, authorKey: true },
    });

    if (!review) {
      throw new HttpError(404, "후기 글을 찾을 수 없습니다.");
    }

    if (review.authorKey && review.authorKey !== payload.participantKey) {
      throw new HttpError(403, "내가 쓴 글만 삭제할 수 있습니다.");
    }

    await prisma.review.delete({
      where: { id: request.params.reviewId },
    });

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
