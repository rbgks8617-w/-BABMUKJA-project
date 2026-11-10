import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { HttpError } from "../middleware/errorHandler.js";

export async function runSerializable<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(work, { isolationLevel: "Serializable" });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034") {
        throw error;
      }
    }
  }

  throw new HttpError(409, "다른 요청이 동시에 처리되고 있어요. 다시 시도해 주세요.");
}
