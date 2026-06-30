import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    error: {
      message: "요청한 API를 찾을 수 없습니다.",
    },
  });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        message: "입력값을 확인해주세요.",
        issues: error.issues,
      },
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
      },
    });
    return;
  }

  response.status(500).json({
    error: {
      message: "서버 오류가 발생했습니다.",
    },
  });
};
