const API_BASE_URL = "https://arcade-amendments-moore-quotations.trycloudflare.com";

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
  studentId?: string | null;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
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
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error?.message ?? `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function register(input: {
  email: string;
  password: string;
  nickname: string;
  studentId?: string;
}) {
  const response = await requestJson<ApiResponse<{ user: AuthUser; session: AuthSession }>>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function login(input: { email: string; password: string }) {
  const response = await requestJson<ApiResponse<{ user: AuthUser; session: AuthSession }>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function fetchMe(token: string) {
  const response = await requestJson<ApiResponse<{ user: AuthUser }>>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.user;
}

export async function logout(token: string) {
  await requestJson<void>("/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
