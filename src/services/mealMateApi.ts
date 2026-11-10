import { API_BASE_URL } from "./apiBaseUrl";

export type MealMateRoomDto = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  time: string;
  topic: string;
  note: string;
  currentCount: number;
  maxCount: number;
  createdAt: string;
  joinedByMe: boolean;
};

export type MealMateMessageDto = {
  id: string;
  body: string;
  anonymousNumber: number;
  anonymousLabel: string;
  isMine: boolean;
  createdAt: string;
};

type ApiResponse<T> = {
  data: T;
};

async function requestJson<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchMealMateRooms(token: string) {
  const response = await requestJson<ApiResponse<MealMateRoomDto[]>>("/api/meal-mates", token);
  return response.data;
}

export async function createMealMateRoom(input: {
  restaurantId: string;
  time: string;
  topic: string;
  note: string;
  maxCount: number;
}, token: string) {
  const response = await requestJson<ApiResponse<MealMateRoomDto>>("/api/meal-mates", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function joinMealMateRoom(roomId: string, token: string) {
  const response = await requestJson<ApiResponse<MealMateRoomDto>>(`/api/meal-mates/${roomId}/join`, token, {
    method: "POST",
  });
  return response.data;
}

export async function leaveMealMateRoom(roomId: string, token: string) {
  const response = await requestJson<ApiResponse<MealMateRoomDto>>(`/api/meal-mates/${roomId}/leave`, token, {
    method: "POST",
  });
  return response.data;
}

export async function fetchMealMateMessages(roomId: string, token: string) {
  const response = await requestJson<ApiResponse<MealMateMessageDto[]>>(`/api/meal-mates/${roomId}/messages`, token);
  return response.data;
}

export async function createMealMateMessage(roomId: string, body: string, token: string) {
  const response = await requestJson<ApiResponse<MealMateMessageDto>>(`/api/meal-mates/${roomId}/messages`, token, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return response.data;
}
