const API_BASE_URL = "https://them-machines-threatening-collectibles.trycloudflare.com";

export type CommunityReviewDto = {
  id: string;
  title: string;
  body: string;
  tasteScore: number;
  valueScore: number;
  imageUrl?: string | null;
  createdAt: string;
  comments: Array<{
    id: string;
    body: string;
    anonymousKey: string;
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

  return response.json() as Promise<T>;
}

export async function fetchCommunityReviews() {
  const response = await requestJson<ApiResponse<CommunityReviewDto[]>>("/api/community/reviews");
  return response.data;
}

export async function createCommunityReview(input: {
  title: string;
  body: string;
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

export async function createCommunityComment(reviewId: string, input: { body: string; anonymousKey: string }) {
  const response = await requestJson<ApiResponse<CommunityReviewDto>>(`/api/community/reviews/${reviewId}/comments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}
