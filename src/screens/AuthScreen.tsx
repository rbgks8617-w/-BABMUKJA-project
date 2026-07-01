import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { useAuth } from "../store/AuthContext";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";

type AuthMode = "login" | "register";

export default function AuthScreen({ navigation }: AppScreenProps<"Auth">) {
  const { user, signIn, signOut, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === "register";
  const goHome = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "RestaurantList" }],
      }),
    );
  }, [navigation]);

  async function submit() {
    const normalizedEmail = email.trim();
    const normalizedNickname = nickname.trim();
    const normalizedStudentId = studentId.trim();

    if (!normalizedEmail || !password || (isRegisterMode && !normalizedNickname)) {
      setMessage("필수 정보를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      if (isRegisterMode) {
        await signUp({
          email: normalizedEmail,
          password,
          nickname: normalizedNickname,
          studentId: normalizedStudentId || undefined,
        });
      } else {
        await signIn({
          email: normalizedEmail,
          password,
        });
      }

      goHome();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인 처리에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logout() {
    setIsSubmitting(true);
    await signOut();
    setIsSubmitting(false);
  }

  if (user) {
    return (
      <View style={styles.screen}>
        <View style={styles.accountCard}>
          <Text style={styles.eyebrow}>내 계정</Text>
          <Text style={styles.title}>{user.nickname}</Text>
          <Text style={styles.description}>{user.email}</Text>
          {user.role === "ADMIN" ? <Text style={styles.adminBadge}>관리자 계정</Text> : null}
          {user.studentId ? <Text style={styles.studentId}>학번 {user.studentId}</Text> : null}
          <Pressable style={styles.primaryButton} onPress={goHome}>
            <Text style={styles.primaryButtonText}>앱으로 돌아가기</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={logout} disabled={isSubmitting}>
            <Text style={styles.secondaryButtonText}>로그아웃</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>대학교 밥먹자 계정</Text>
        <Text style={styles.title}>{isRegisterMode ? "캠퍼스 식생활 계정 만들기" : "다시 만나서 반가워요"}</Text>
        <Text style={styles.description}>후기, 밥친구, 주문, 알림을 내 계정 기준으로 이어가기 위한 첫 단계예요.</Text>
      </View>

      <View style={styles.modeRow}>
        <Pressable style={[styles.modeButton, !isRegisterMode && styles.modeButtonActive]} onPress={() => setMode("login")}>
          <Text style={[styles.modeText, !isRegisterMode && styles.modeTextActive]}>로그인</Text>
        </Pressable>
        <Pressable style={[styles.modeButton, isRegisterMode && styles.modeButtonActive]} onPress={() => setMode("register")}>
          <Text style={[styles.modeText, isRegisterMode && styles.modeTextActive]}>회원가입</Text>
        </Pressable>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>이메일</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="student@tukorea.ac.kr"
          placeholderTextColor={colors.textSoft}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>비밀번호</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="8자 이상"
          placeholderTextColor={colors.textSoft}
          style={styles.input}
        />

        {isRegisterMode ? (
          <>
            <Text style={styles.inputLabel}>닉네임</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="밥친구 닉네임"
              placeholderTextColor={colors.textSoft}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>학번</Text>
            <TextInput
              value={studentId}
              onChangeText={setStudentId}
              placeholder="선택 입력"
              placeholderTextColor={colors.textSoft}
              style={styles.input}
            />
          </>
        ) : null}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]} onPress={submit} disabled={isSubmitting}>
          <Text style={styles.primaryButtonText}>{isRegisterMode ? "회원가입하고 시작" : "로그인"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 18,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 120,
    backgroundColor: colors.background,
  },
  hero: {
    marginBottom: 14,
    padding: 17,
    borderRadius: 24,
    backgroundColor: "#eaf7fc",
    borderWidth: 1,
    borderColor: "#ccebf7",
  },
  accountCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    marginTop: 8,
    color: colors.ink,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 31,
  },
  description: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
  },
  studentId: {
    marginTop: 8,
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900",
  },
  adminBadge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff1f2",
    color: "#e11d48",
    fontSize: 12,
    fontWeight: "900",
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  modeTextActive: {
    color: "#ffffff",
  },
  formCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    marginTop: 12,
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  input: {
    marginTop: 7,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  message: {
    marginTop: 12,
    color: "#e11d48",
    fontSize: 12,
    fontWeight: "900",
  },
  primaryButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: "#edf6fc",
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.58,
  },
});
