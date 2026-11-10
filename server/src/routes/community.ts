import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { runSerializable } from "../db/serializable.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";

const createReviewSchema = z.object({
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(1000),
  tasteScore: z.number().min(0.5).max(5),
  valueScore: z.number().min(0.5).max(5),
  imageUrl: z.string().url().optional(),
});

const createCommentSchema = z.object({ body: z.string().trim().min(1).max(500) });
const includeComments = { comments: { orderBy: { createdAt: "asc" as const }, take: 60 } };

export const communityRouter = Router();
communityRouter.use(requireAuth);

function serializeReview(review: Prisma.ReviewGetPayload<{ include: typeof includeComments }>, userId: string) {
  return {
    id: review.id,
    title: review.title,
    body: review.body,
    tasteScore: Number(review.tasteScore),
    valueScore: Number(review.valueScore),
    imageUrl: review.imageUrl,
    createdAt: review.createdAt.toISOString(),
    isMine: review.authorUserId === userId,
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

communityRouter.get("/reviews", async (request, response, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      include: includeComments,
    });

    response.json({ data: reviews.map((review) => serializeReview(review, request.user!.id)) });
  } catch (error) {
    next(error);
  }
});

communityRouter.get("/reviews/:reviewId", async (request, response, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: request.params.reviewId },
      include: includeComments,
    });

    if (!review) {
      throw new HttpError(404, "후기 글을 찾을 수 없습니다.");
    }

    response.json({ data: serializeReview(review, request.user!.id) });
  } catch (error) {
    next(error);
  }
});

communityRouter.post("/reviews", async (request, response, next) => {
  try {
    const payload = createReviewSchema.parse(request.body);
    const userId = request.user!.id;
    const review = await prisma.review.create({
      data: { id: randomUUID(), ...payload, authorUserId: userId },
      include: includeComments,
    });

    response.status(201).json({ data: serializeReview(review, userId) });
  } catch (error) {
    next(error);
  }
});

communityRouter.post("/reviews/:reviewId/comments", async (request, response, next) => {
  try {
    const { body } = createCommentSchema.parse(request.body);
    const { reviewId } = request.params;
    const userId = request.user!.id;
    const review = await runSerializable(async (tx) => {
      const existing = await tx.review.findUnique({
        where: { id: reviewId },
        select: { authorUserId: true },
      });

      if (!existing) {
        throw new HttpError(404, "후기 글을 찾을 수 없습니다.");
      }

      let anonymousNumber = 1;
      if (existing.authorUserId !== userId) {
        const priorComment = await tx.reviewComment.findFirst({
          where: { reviewId, authorUserId: userId },
          select: { anonymousNumber: true },
        });
        if (priorComment) {
          anonymousNumber = priorComment.anonymousNumber;
        } else {
          const numbers = await tx.reviewComment.aggregate({
            where: { reviewId },
            _max: { anonymousNumber: true },
          });
          anonymousNumber = Math.max(1, numbers._max.anonymousNumber ?? 0) + 1;
        }
      }

      return tx.review.update({
        where: { id: reviewId },
        data: {
          comments: {
            create: {
              id: randomUUID(),
              body,
              authorUserId: userId,
              anonymousKey: `anonymous-${anonymousNumber}`,
              anonymousNumber,
            },
          },
        },
        include: includeComments,
      });
    });

    response.status(201).json({ data: serializeReview(review, userId) });
  } catch (error) {
    next(error);
  }
});

communityRouter.delete("/reviews/:reviewId", async (request, response, next) => {
  try {
    const user = request.user!;
    const result = await prisma.review.deleteMany({
      where: {
        id: request.params.reviewId,
        ...(user.role === "ADMIN" ? {} : { authorUserId: user.id }),
      },
    });

    if (result.count === 0) {
      throw new HttpError(404, "삭제할 수 있는 후기 글을 찾을 수 없습니다.");
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

communityRouter.delete("/reviews", async (request, response, next) => {
  try {
    if (request.user!.role !== "ADMIN") {
      throw new HttpError(403, "관리자만 게시글을 일괄 삭제할 수 있습니다.");
    }

    const result = await prisma.review.deleteMany();
    response.json({ data: { deletedCount: result.count } });
  } catch (error) {
    next(error);
  }
});
