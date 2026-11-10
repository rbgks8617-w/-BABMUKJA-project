import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { runSerializable } from "../db/serializable.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { store } from "../repositories/inMemoryStore.js";

const createRoomSchema = z.object({
  restaurantId: z.string().trim().min(1),
  time: z.string().trim().min(1).max(40),
  topic: z.string().trim().min(1).max(80),
  note: z.string().trim().max(500).default(""),
  maxCount: z.number().int().min(2).max(6).default(4),
});
const createMessageSchema = z.object({ body: z.string().trim().min(1).max(500) });

// Rooms created with unverified browser keys cannot establish membership for an account.
const activeRoom = { creatorUserId: { not: null }, currentCount: { gt: 0 } };

export const mealMatesRouter = Router();
mealMatesRouter.use(requireAuth);

async function ensureRestaurant(restaurantId: string) {
  const existing = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { id: true } });
  if (existing) return existing;

  const seed = store.getRestaurant(restaurantId);
  if (!seed) return null;

  return prisma.restaurant.upsert({
    where: { id: restaurantId },
    create: seed,
    update: {},
    select: { id: true },
  });
}

function includeRoomFor(userId: string) {
  return {
    restaurant: { select: { name: true } },
    members: { where: { participantKey: userId }, select: { id: true } },
  } satisfies Prisma.MealMateRoomInclude;
}

function serializeRoom(room: Prisma.MealMateRoomGetPayload<{ include: ReturnType<typeof includeRoomFor> }>) {
  return {
    id: room.id,
    restaurantId: room.restaurantId,
    restaurantName: room.restaurant.name,
    time: room.time,
    topic: room.topic,
    note: room.note,
    currentCount: room.currentCount,
    maxCount: room.maxCount,
    createdAt: room.createdAt.toISOString(),
    joinedByMe: room.members.length > 0,
  };
}

function serializeMessage(message: {
  id: string;
  body: string;
  participantKey: string;
  anonymousNumber: number;
  createdAt: Date;
}, userId: string) {
  return {
    id: message.id,
    body: message.body,
    anonymousNumber: message.anonymousNumber,
    anonymousLabel: `익명${message.anonymousNumber}`,
    isMine: message.participantKey === userId,
    createdAt: message.createdAt.toISOString(),
  };
}

async function findActiveMembership(tx: Prisma.TransactionClient, userId: string) {
  return tx.mealMateMember.findFirst({
    where: { participantKey: userId, room: activeRoom },
    select: { roomId: true },
  });
}

async function requireRoomMember(tx: Prisma.TransactionClient, roomId: string, userId: string) {
  const member = await tx.mealMateMember.findFirst({
    where: { roomId, participantKey: userId, room: activeRoom },
    select: { id: true, anonymousNumber: true },
  });
  if (!member) throw new HttpError(403, "참여 중인 모임에서만 채팅할 수 있습니다.");
  return member;
}

mealMatesRouter.get("/", async (request, response, next) => {
  try {
    const rooms = await prisma.mealMateRoom.findMany({
      where: activeRoom,
      orderBy: { createdAt: "desc" },
      take: 60,
      include: includeRoomFor(request.user!.id),
    });

    response.json({ data: rooms.map(serializeRoom) });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.post("/", async (request, response, next) => {
  try {
    const payload = createRoomSchema.parse(request.body);
    const userId = request.user!.id;
    const restaurant = await ensureRestaurant(payload.restaurantId);
    if (!restaurant) throw new HttpError(400, "존재하지 않는 식당입니다.");

    const room = await runSerializable(async (tx) => {
      if (await findActiveMembership(tx, userId)) {
        throw new HttpError(409, "이미 참여 중인 모임이 있어요. 먼저 나가주세요.");
      }
      return tx.mealMateRoom.create({
        data: {
          ...payload,
          id: randomUUID(),
          creatorUserId: userId,
          currentCount: 1,
          members: { create: { participantKey: userId, anonymousNumber: 1 } },
        },
        include: includeRoomFor(userId),
      });
    });

    response.status(201).json({ data: serializeRoom(room) });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.post("/:roomId/join", async (request, response, next) => {
  try {
    const { roomId } = request.params;
    const userId = request.user!.id;
    const room = await runSerializable(async (tx) => {
      const target = await tx.mealMateRoom.findFirst({
        where: { id: roomId, ...activeRoom },
        include: includeRoomFor(userId),
      });
      if (!target) throw new HttpError(404, "모임을 찾을 수 없습니다.");
      if (target.members.length) return target;

      if (await findActiveMembership(tx, userId)) {
        throw new HttpError(409, "이미 참여 중인 모임이 있어요. 먼저 나가주세요.");
      }
      if (target.currentCount >= target.maxCount) {
        throw new HttpError(409, "이미 마감된 모임이에요.");
      }

      const members = await tx.mealMateMember.aggregate({ where: { roomId }, _max: { anonymousNumber: true } });
      const messages = await tx.mealMateMessage.aggregate({ where: { roomId }, _max: { anonymousNumber: true } });
      const anonymousNumber = Math.max(members._max.anonymousNumber ?? 0, messages._max.anonymousNumber ?? 0) + 1;

      return tx.mealMateRoom.update({
        where: { id: roomId },
        data: {
          currentCount: { increment: 1 },
          members: { create: { participantKey: userId, anonymousNumber } },
        },
        include: includeRoomFor(userId),
      });
    });

    response.json({ data: serializeRoom(room) });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.post("/:roomId/leave", async (request, response, next) => {
  try {
    const { roomId } = request.params;
    const userId = request.user!.id;
    const room = await runSerializable(async (tx) => {
      const member = await requireRoomMember(tx, roomId, userId);
      await tx.mealMateMember.delete({ where: { id: member.id } });
      return tx.mealMateRoom.update({
        where: { id: roomId },
        data: { currentCount: { decrement: 1 } },
        include: includeRoomFor(userId),
      });
    });

    response.json({ data: serializeRoom(room) });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.get("/:roomId/messages", async (request, response, next) => {
  try {
    const { roomId } = request.params;
    const userId = request.user!.id;
    const room = await prisma.mealMateRoom.findFirst({
      where: { id: roomId, ...activeRoom, members: { some: { participantKey: userId } } },
      select: {
        messages: {
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 120,
        },
      },
    });
    if (!room) throw new HttpError(403, "참여 중인 모임에서만 채팅할 수 있습니다.");

    response.json({ data: room.messages.reverse().map((message) => serializeMessage(message, userId)) });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.post("/:roomId/messages", async (request, response, next) => {
  try {
    const { body } = createMessageSchema.parse(request.body);
    const { roomId } = request.params;
    const userId = request.user!.id;
    const message = await runSerializable(async (tx) => {
      const member = await requireRoomMember(tx, roomId, userId);
      return tx.mealMateMessage.create({
        data: { id: randomUUID(), roomId, body, participantKey: userId, anonymousNumber: member.anonymousNumber },
      });
    });

    response.status(201).json({ data: serializeMessage(message, userId) });
  } catch (error) {
    next(error);
  }
});
