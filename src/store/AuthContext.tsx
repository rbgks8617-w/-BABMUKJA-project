import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as authApi from "../services/authApi";
import type { AuthUser } from "../services/authApi";

type AuthModeInput = {
  email: string;
  password: string;
  nickname?: string;
  studentId?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (input: AuthModeInput) => Promise<void>;
  signUp: (input: Required<Pick<AuthModeInput, "email" | "password" | "nickname">> & { studentId?: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const authStorageKey = "babmukja-auth-session";
const AuthContext = createContext<AuthContextValue | null>(null);

type StoredAuth = {
  token: string;
  user: AuthUser;
};

async function saveAuthSession(session: StoredAuth) {
  await AsyncStorage.setItem(authStorageKey, JSON.stringify(session));
}

async function clearAuthSession() {
  await AsyncStorage.removeItem(authStorageKey);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const rawValue = await AsyncStorage.getItem(authStorageKey);
        const storedAuth = rawValue ? (JSON.parse(rawValue) as StoredAuth) : null;

        if (!storedAuth?.token) {
          return;
        }

        const currentUser = await authApi.fetchMe(storedAuth.token);

        if (!mounted) {
          return;
        }

        setToken(storedAuth.token);
        setUser(currentUser);
        await saveAuthSession({ token: storedAuth.token, user: currentUser });
      } catch {
        await clearAuthSession();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const applyAuthResult = useCallback(async (result: { user: AuthUser; session: { token: string } }) => {
    setUser(result.user);
    setToken(result.session.token);
    await saveAuthSession({
      user: result.user,
      token: result.session.token,
    });
  }, []);

  const signIn = useCallback(
    async (input: AuthModeInput) => {
      const result = await authApi.login({
        email: input.email,
        password: input.password,
      });
      await applyAuthResult(result);
    },
    [applyAuthResult],
  );

  const signUp = useCallback(
    async (input: Required<Pick<AuthModeInput, "email" | "password" | "nickname">> & { studentId?: string }) => {
      const result = await authApi.register({
        email: input.email,
        password: input.password,
        nickname: input.nickname,
        studentId: input.studentId,
      });
      await applyAuthResult(result);
    },
    [applyAuthResult],
  );

  const signOut = useCallback(async () => {
    const currentToken = token;
    setUser(null);
    setToken(null);
    await clearAuthSession();

    if (currentToken) {
      await authApi.logout(currentToken).catch(() => undefined);
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [isLoading, signIn, signOut, signUp, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
