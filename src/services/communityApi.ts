const API_BASE_URL = "https://arcade-amendments-moore-quotations.trycloudflare.com";

export type CommunityReviewDto = {
  id: string;
  title: string;
  body: string;
  tasteScore: number;
  valueScore: number;
  imageUrl?: string | null;
  createdAt: string;
  authorKey?: string | null;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchCommunityReviews() {
  const response = await requestJson<ApiResponse<CommunityReviewDto[]>>("/api/community/reviews");
  return response.data;
}

export async function createCommunityReview(input: {
  title: string;
  body: string;
  participantKey: string;
  tasteScore: number;
  valueScore: number;
  imageUrl?: string;
}) {
  const response = await requestJson<ApiResponse<CommunityReviewDto>>("/api/community/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function createCommunityComment(reviewId: string, input: { body: string; participantKey: string }) {
  const response = await requestJson<ApiResponse<CommunityReviewDto>>(`/api/community/reviews/${reviewId}/comments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function deleteCommunityReview(reviewId: string, participantKey: string) {
  await requestJson<void>(`/api/community/reviews/${reviewId}`, {
    method: "DELETE",
    body: JSON.stringify({ participantKey }),
  });
}
