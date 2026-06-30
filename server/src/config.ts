import dotenv from "dotenv";

dotenv.config();

function parseCorsOrigins(value: string | undefined) {
  if (!value) {
    return [
      "http://127.0.0.1:19006",
      "http://localhost:19006",
      "https://raw.githack.com",
      "https://rawcdn.githack.com",
    ];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
};
