import type { RequestHandler } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "./errorHandler.js";
import { hashSessionToken } from "../utils/tokens.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  nickname: string;
  studentId: string | null;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
    sessionId?: string;
  }
}

export const requireAuth: RequestHandler = async (request, _response, next) => {
  try {
    const authorization = request.header("authorization") ?? "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "로그인이 필요합니다.");
    }

    const session = await prisma.userSession.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nickname: true,
            studentId: true,
          },
        },
      },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new HttpError(401, "로그인이 만료되었습니다.");
    }

    request.user = session.user;
    request.sessionId = session.id;
    next();
  } catch (error) {
    next(error);
  }
};
