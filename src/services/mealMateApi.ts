const API_BASE_URL = "https://them-machines-threatening-collectibles.trycloudflare.com";

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

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchMealMateRooms(participantKey: string) {
  const response = await requestJson<ApiResponse<MealMateRoomDto[]>>(
    `/api/meal-mates?participantKey=${encodeURIComponent(participantKey)}`,
  );
  return response.data;
}

export async function createMealMateRoom(input: {
  restaurantId: string;
  time: string;
  topic: string;
  note: string;
  maxCount: number;
  participantKey: string;
}) {
  const response = await requestJson<ApiResponse<MealMateRoomDto>>("/api/meal-mates", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function joinMealMateRoom(roomId: string, participantKey: string) {
  const response = await requestJson<ApiResponse<MealMateRoomDto>>(`/api/meal-mates/${roomId}/join`, {
    method: "POST",
    body: JSON.stringify({ participantKey }),
  });
  return response.data;
}

export async function leaveMealMateRoom(roomId: string, participantKey: string) {
  const response = await requestJson<ApiResponse<MealMateRoomDto>>(`/api/meal-mates/${roomId}/leave`, {
    method: "POST",
    body: JSON.stringify({ participantKey }),
  });
  return response.data;
}

export async function fetchMealMateMessages(roomId: string, participantKey: string) {
  const response = await requestJson<ApiResponse<MealMateMessageDto[]>>(
    `/api/meal-mates/${roomId}/messages?participantKey=${encodeURIComponent(participantKey)}`,
  );
  return response.data;
}

export async function createMealMateMessage(roomId: string, input: { body: string; participantKey: string }) {
  const response = await requestJson<ApiResponse<MealMateMessageDto>>(`/api/meal-mates/${roomId}/messages`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}
