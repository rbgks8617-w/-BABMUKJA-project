import { API_BASE_URL } from "./apiBaseUrl";

export type CommunityReviewDto = {
  id: string;
  title: string;
  body: string;
  tasteScore: number;
  valueScore: number;
  imageUrl?: string | null;
  createdAt: string;
  isMine: boolean;
  comments: Array<{
    id: string;
    body: string;
    anonymousKey: string;
    anonymousNumber?: number;
    anonymousLabel?: string;
    createdAt: string;
  }>;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchCommunityReviews(token: string) {
  const response = await requestJson<ApiResponse<CommunityReviewDto[]>>("/api/community/reviews", token);
  return response.data;
}

export async function fetchCommunityReview(reviewId: string, token: string) {
  const response = await requestJson<ApiResponse<CommunityReviewDto>>(`/api/community/reviews/${reviewId}`, token);
  return response.data;
}

export async function createCommunityReview(input: {
  title: string;
  body: string;
  tasteScore: number;
  valueScore: number;
  imageUrl?: string;
}, token: string) {
  const response = await requestJson<ApiResponse<CommunityReviewDto>>("/api/community/reviews", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function createCommunityComment(reviewId: string, body: string, token: string) {
  const response = await requestJson<ApiResponse<CommunityReviewDto>>(`/api/community/reviews/${reviewId}/comments`, token, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return response.data;
}

export async function deleteCommunityReview(reviewId: string, token: string) {
  await requestJson<void>(`/api/community/reviews/${reviewId}`, token, { method: "DELETE" });
}

export async function deleteAllCommunityReviews(token: string) {
  const response = await requestJson<ApiResponse<{ deletedCount: number }>>("/api/community/reviews", token, {
    method: "DELETE",
  });
  return response.data;
}
