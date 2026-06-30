import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../middleware/errorHandler.js";
import { store } from "../repositories/inMemoryStore.js";

const participantSchema = z.object({
  participantKey: z.string().trim().min(1).max(80).default("legacy-viewer"),
});

const createRoomSchema = participantSchema.extend({
  restaurantId: z.string().trim().min(1),
  time: z.string().trim().min(1).max(40),
  topic: z.string().trim().min(1).max(80),
  note: z.string().trim().max(500).default(""),
  maxCount: z.number().int().min(2).max(6).default(4),
});

const createMessageSchema = participantSchema.extend({
  body: z.string().trim().min(1).max(500),
});

export const mealMatesRouter = Router();

async function ensureRestaurant(restaurantId: string) {
  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true },
  });

  if (existingRestaurant) {
    return existingRestaurant;
  }

  const seedRestaurant = store.getRestaurant(restaurantId);

  if (!seedRestaurant) {
    return null;
  }

  return prisma.restaurant.create({
    data: {
      id: seedRestaurant.id,
      name: seedRestaurant.name,
      building: seedRestaurant.building,
      category: seedRestaurant.category,
      location: seedRestaurant.location,
      description: seedRestaurant.description,
      imageUrl: seedRestaurant.imageUrl,
    },
    select: { id: true },
  });
}

async function resolveMealMateAnonymousNumber(roomId: string, participantKey: string) {
  const existingMember = await prisma.mealMateMember.findUnique({
    where: {
      roomId_participantKey: {
        roomId,
        participantKey,
      },
    },
    select: { anonymousNumber: true },
  });

  if (existingMember) {
    return existingMember.anonymousNumber;
  }

  const maxMemberNumber = await prisma.mealMateMember.aggregate({
    where: { roomId },
    _max: { anonymousNumber: true },
  });

  return (maxMemberNumber._max.anonymousNumber ?? 0) + 1;
}

function serializeRoom(room: {
  id: string;
  restaurantId: string;
  time: string;
  topic: string;
  note: string;
  currentCount: number;
  maxCount: number;
  createdAt: Date;
  restaurant?: { id: string; name: string } | null;
  members?: Array<{ participantKey: string; anonymousNumber: number }>;
}) {
  return {
    id: room.id,
    restaurantId: room.restaurantId,
    restaurantName: room.restaurant?.name ?? "식당",
    time: room.time,
    topic: room.topic,
    note: room.note,
    currentCount: room.currentCount,
    maxCount: room.maxCount,
    createdAt: room.createdAt.toISOString(),
    members:
      room.members?.map((member) => ({
        participantKey: member.participantKey,
        anonymousNumber: member.anonymousNumber,
        anonymousLabel: `익명${member.anonymousNumber}`,
      })) ?? [],
  };
}

function serializeMessage(message: {
  id: string;
  body: string;
  participantKey: string;
  anonymousNumber: number;
  createdAt: Date;
}, viewerParticipantKey = "") {
  return {
    id: message.id,
    body: message.body,
    anonymousNumber: message.anonymousNumber,
    anonymousLabel: `익명${message.anonymousNumber}`,
    isMine: Boolean(viewerParticipantKey && message.participantKey === viewerParticipantKey),
    createdAt: message.createdAt.toISOString(),
  };
}

mealMatesRouter.get("/", async (request, response, next) => {
  try {
    const participantKey =
      typeof request.query.participantKey === "string" ? request.query.participantKey.trim() : "";
    const rooms = await prisma.mealMateRoom.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        restaurant: { select: { id: true, name: true } },
        members: {
          where: participantKey ? { participantKey } : undefined,
          select: { participantKey: true, anonymousNumber: true },
        },
      },
    });

    response.json({
      data: rooms.map((room) => ({
        ...serializeRoom(room),
        joinedByMe: room.members.length > 0,
      })),
    });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.post("/", async (request, response, next) => {
  try {
    const payload = createRoomSchema.parse(request.body);
    const restaurant = await ensureRestaurant(payload.restaurantId);

    if (!restaurant) {
      throw new HttpError(400, "존재하지 않는 식당입니다.");
    }

    const joinedRoom = await prisma.mealMateMember.findFirst({
      where: { participantKey: payload.participantKey },
      select: { roomId: true },
    });

    if (joinedRoom) {
      throw new HttpError(409, "이미 참여 중인 모임이 있어요. 먼저 나가주세요.");
    }

    const room = await prisma.mealMateRoom.create({
      data: {
        id: `mate-${Date.now()}`,
        restaurantId: payload.restaurantId,
        time: payload.time,
        topic: payload.topic,
        note: payload.note,
        maxCount: payload.maxCount,
        creatorKey: payload.participantKey,
        currentCount: 1,
        members: {
          create: {
            participantKey: payload.participantKey,
            anonymousNumber: 1,
          },
        },
        messages: {
          create: {
            id: `mate-message-${Date.now()}`,
            body: `${payload.time}에 만나는 걸로 생각하고 있어요.`,
            participantKey: payload.participantKey,
            anonymousNumber: 1,
          },
        },
      },
      include: {
        restaurant: { select: { id: true, name: true } },
        members: {
          where: { participantKey: payload.participantKey },
          select: { participantKey: true, anonymousNumber: true },
        },
      },
    });

    response.status(201).json({
      data: {
        ...serializeRoom(room),
        joinedByMe: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.post("/:roomId/join", async (request, response, next) => {
  try {
    const payload = participantSchema.parse(request.body);
    const room = await prisma.mealMateRoom.findUnique({
      where: { id: request.params.roomId },
      select: { id: true, currentCount: true, maxCount: true },
    });

    if (!room) {
      throw new HttpError(404, "모임을 찾을 수 없습니다.");
    }

    const joinedRoom = await prisma.mealMateMember.findFirst({
      where: { participantKey: payload.participantKey },
      select: { roomId: true },
    });

    if (joinedRoom && joinedRoom.roomId !== room.id) {
      throw new HttpError(409, "이미 참여 중인 모임이 있어요. 먼저 나가주세요.");
    }

    const existingNumber = await resolveMealMateAnonymousNumber(room.id, payload.participantKey);
    const alreadyJoined = Boolean(joinedRoom);

    if (!alreadyJoined && room.currentCount >= room.maxCount) {
      throw new HttpError(409, "이미 마감된 모임이에요.");
    }

    const updatedRoom = await prisma.$transaction(async (tx) => {
      if (!alreadyJoined) {
        await tx.mealMateMember.create({
          data: {
            roomId: room.id,
            participantKey: payload.participantKey,
            anonymousNumber: existingNumber,
          },
        });
        await tx.mealMateRoom.update({
          where: { id: room.id },
          data: { currentCount: { increment: 1 } },
        });
      }

      return tx.mealMateRoom.findUniqueOrThrow({
        where: { id: room.id },
        include: {
          restaurant: { select: { id: true, name: true } },
          members: {
            where: { participantKey: payload.participantKey },
            select: { participantKey: true, anonymousNumber: true },
          },
        },
      });
    });

    response.json({
      data: {
        ...serializeRoom(updatedRoom),
        joinedByMe: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.post("/:roomId/leave", async (request, response, next) => {
  try {
    const payload = participantSchema.parse(request.body);
    const member = await prisma.mealMateMember.findUnique({
      where: {
        roomId_participantKey: {
          roomId: request.params.roomId,
          participantKey: payload.participantKey,
        },
      },
      select: { id: true },
    });

    if (!member) {
      throw new HttpError(404, "참여 중인 모임이 아닙니다.");
    }

    const updatedRoom = await prisma.$transaction(async (tx) => {
      await tx.mealMateMember.delete({ where: { id: member.id } });
      await tx.mealMateRoom.update({
        where: { id: request.params.roomId },
        data: { currentCount: { decrement: 1 } },
      });

      return tx.mealMateRoom.findUniqueOrThrow({
        where: { id: request.params.roomId },
        include: {
          restaurant: { select: { id: true, name: true } },
          members: {
            where: { participantKey: payload.participantKey },
            select: { participantKey: true, anonymousNumber: true },
          },
        },
      });
    });

    response.json({
      data: {
        ...serializeRoom(updatedRoom),
        joinedByMe: false,
      },
    });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.get("/:roomId/messages", async (request, response, next) => {
  try {
    const participantKey =
      typeof request.query.participantKey === "string" ? request.query.participantKey.trim() : "";
    const messages = await prisma.mealMateMessage.findMany({
      where: { roomId: request.params.roomId },
      orderBy: { createdAt: "asc" },
      take: 120,
    });

    response.json({
      data: messages.map((message) => serializeMessage(message, participantKey)),
    });
  } catch (error) {
    next(error);
  }
});

mealMatesRouter.post("/:roomId/messages", async (request, response, next) => {
  try {
    const payload = createMessageSchema.parse(request.body);
    const room = await prisma.mealMateRoom.findUnique({
      where: { id: request.params.roomId },
      select: { id: true },
    });

    if (!room) {
      throw new HttpError(404, "모임을 찾을 수 없습니다.");
    }

    const anonymousNumber = await resolveMealMateAnonymousNumber(room.id, payload.participantKey);

    await prisma.mealMateMember.upsert({
      where: {
        roomId_participantKey: {
          roomId: room.id,
          participantKey: payload.participantKey,
        },
      },
      update: {},
      create: {
        roomId: room.id,
        participantKey: payload.participantKey,
        anonymousNumber,
      },
    });

    const message = await prisma.mealMateMessage.create({
      data: {
        id: `mate-message-${Date.now()}`,
        roomId: room.id,
        body: payload.body,
        participantKey: payload.participantKey,
        anonymousNumber,
      },
    });

    response.status(201).json({
      data: serializeMessage(message),
    });
  } catch (error) {
    next(error);
  }
});
