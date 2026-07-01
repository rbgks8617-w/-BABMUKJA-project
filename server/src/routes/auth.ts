import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { createSessionToken, hashSessionToken } from "../utils/tokens.js";

const emailSchema = z.string().trim().email().max(120).transform((email) => email.toLowerCase());
const passwordSchema = z.string().min(8).max(80);

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nickname: z.string().trim().min(2).max(20),
  studentId: z.string().trim().min(3).max(20).optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(80),
});

const sessionTtlMs = 1000 * 60 * 60 * 24 * 30;

export const authRouter = Router();

function serializeUser(user: { id: string; email: string; nickname: string; studentId: string | null }) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    studentId: user.studentId,
  };
}

async function createUserSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + sessionTtlMs);

  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  return {
    token,
    expiresAt: expiresAt.toISOString(),
  };
}

authRouter.post("/register", async (request, response, next) => {
  try {
    const payload = registerSchema.parse(request.body);
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new HttpError(409, "이미 가입된 이메일입니다.");
    }

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        nickname: payload.nickname,
        studentId: payload.studentId,
        passwordHash: await hashPassword(payload.password),
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        studentId: true,
      },
    });
    const session = await createUserSession(user.id);

    response.status(201).json({
      data: {
        user: serializeUser(user),
        session,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  try {
    const payload = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        email: true,
        nickname: true,
        studentId: true,
        passwordHash: true,
      },
    });

    if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
      throw new HttpError(401, "이메일 또는 비밀번호가 맞지 않습니다.");
    }

    const session = await createUserSession(user.id);

    response.json({
      data: {
        user: serializeUser(user),
        session,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, (request, response) => {
  response.json({
    data: {
      user: request.user,
    },
  });
});

authRouter.post("/logout", requireAuth, async (request, response, next) => {
  try {
    if (request.sessionId) {
      await prisma.userSession.delete({
        where: { id: request.sessionId },
      });
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
