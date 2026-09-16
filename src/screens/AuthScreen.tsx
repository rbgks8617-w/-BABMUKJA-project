import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, BottomNav } from "../components/AppUI";
import {
  tukSymbolSource,
  lunchboxRecommendationSource,
} from "../utils/staticAssets";
import { BRAND_FONT_FAMILY } from "../theme/typography";
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
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();

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

    if (
      !normalizedEmail ||
      !password ||
      (isRegisterMode && !normalizedNickname)
    ) {
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
      setMessage(
        error instanceof Error && !/fetch|network/i.test(error.message)
          ? error.message
          : "서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.",
      );
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
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Icon name="person-outline" color={colors.primary} size={30} />
          </View>
          <Text style={styles.eyebrow}>내 계정</Text>
          <Text style={styles.title}>{user.nickname}</Text>
          <Text style={styles.description}>{user.email}</Text>
          {user.role === "ADMIN" ? (
            <Text style={styles.adminBadge}>관리자 계정</Text>
          ) : null}
          {user.studentId ? (
            <Text style={styles.studentId}>학번 {user.studentId}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={goHome}
          >
            <Text style={styles.primaryButtonText}>앱으로 돌아가기</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={logout}
            accessibilityRole="button"
            disabled={isSubmitting}
          >
            <Text style={styles.secondaryButtonText}>로그아웃</Text>
          </Pressable>
        </View>
        <BottomNav active="account" navigation={navigation} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.container,
          { paddingTop: Math.max(insets.top, 24) },
        ]}
      >
        <View style={styles.brandRow}>
          <Image source={tukSymbolSource} style={styles.brandImage} />
          <Text style={styles.brandText}>대학교 밥먹자</Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.heroPicture}>
            <Image
              source={lunchboxRecommendationSource}
              resizeMode="contain"
              style={styles.heroLunchbox}
            />
          </View>
          <Text style={styles.eyebrow}>한국공학대학교의 맛있는 일상</Text>
          <Text style={styles.title}>
            {isRegisterMode ? "우리, 밥친구 할까요?" : "잘 먹고, 잘 지내요."}
          </Text>
          <Text style={styles.description}>
            {isRegisterMode
              ? "새로운 캠퍼스 생활을 함께 시작해요."
              : "오늘의 한 끼부터 함께할 밥친구까지."}
          </Text>
        </View>

        <View style={styles.modeRow}>
          <Pressable
            style={[
              styles.modeButton,
              !isRegisterMode && styles.modeButtonActive,
            ]}
            onPress={() => setMode("login")}
            accessibilityRole="tab"
            accessibilityState={{ selected: !isRegisterMode }}
          >
            <Text
              style={[
                styles.modeText,
                !isRegisterMode && styles.modeTextActive,
              ]}
            >
              로그인
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeButton,
              isRegisterMode && styles.modeButtonActive,
            ]}
            onPress={() => setMode("register")}
            accessibilityRole="tab"
            accessibilityState={{ selected: isRegisterMode }}
          >
            <Text
              style={[styles.modeText, isRegisterMode && styles.modeTextActive]}
            >
              회원가입
            </Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>이메일</Text>
          <TextInput
            accessibilityLabel="이메일"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="student@tukorea.ac.kr"
            placeholderTextColor={colors.textSoft}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>비밀번호</Text>
          <View style={styles.passwordRow}>
            <TextInput
              accessibilityLabel="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="8자 이상"
              placeholderTextColor={colors.textSoft}
              style={[styles.input, { flex: 1, borderWidth: 0, marginTop: 0 }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
              }
              onPress={() => setShowPassword((value) => !value)}
              style={styles.eye}
            >
              <Icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          {isRegisterMode ? (
            <>
              <Text style={styles.inputLabel}>닉네임</Text>
              <TextInput
                value={nickname}
                accessibilityLabel="닉네임"
                onChangeText={setNickname}
                placeholder="밥친구 닉네임"
                placeholderTextColor={colors.textSoft}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>학번</Text>
              <TextInput
                value={studentId}
                accessibilityLabel="학번 (선택)"
                onChangeText={setStudentId}
                placeholder="선택 입력"
                placeholderTextColor={colors.textSoft}
                style={styles.input}
              />
            </>
          ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable
            style={[
              styles.primaryButton,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={submit}
            accessibilityRole="button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isRegisterMode ? "회원가입하고 시작" : "로그인"}
              </Text>
            )}
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={goHome}
          style={styles.browse}
        >
          <Text style={styles.browseText}>먼저 둘러보기</Text>
          <Icon name="arrow-forward" size={15} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.footer}>한 끼로 가까워지는 우리 캠퍼스</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 28,
    backgroundColor: colors.background,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandImage: { width: 30, height: 34, resizeMode: "contain" },
  brandText: {
    fontFamily: BRAND_FONT_FAMILY,
    fontSize: 20,
    color: colors.text,
  },
  hero: { paddingTop: 12, paddingBottom: 30 },
  heroPicture: {
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroLunchbox: { width: 200, height: 200 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "600" },
  title: {
    marginTop: 10,
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 38,
  },
  description: {
    marginTop: 9,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 21,
  },
  modeRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  modeButtonActive: { borderColor: colors.primary },
  modeText: { color: colors.textSoft, fontSize: 14, fontWeight: "600" },
  modeTextActive: { color: colors.primary },
  formCard: { padding: 0 },
  inputLabel: {
    marginTop: 14,
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    marginTop: 8,
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
  },
  passwordRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F7F8FA",
  },
  eye: {
    width: 44,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  message: { marginTop: 14, color: "#C44646", fontSize: 12, lineHeight: 20 },
  primaryButton: {
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  primaryButtonText: { color: "white", fontSize: 15, fontWeight: "700" },
  buttonDisabled: { opacity: 0.58 },
  browse: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    minHeight: 52,
    marginTop: 12,
  },
  browseText: { color: colors.textMuted, fontSize: 13 },
  footer: {
    textAlign: "center",
    fontSize: 10,
    color: colors.textSoft,
    marginTop: 24,
  },
  accountCard: { flex: 1, padding: 28, paddingTop: 80 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  studentId: { marginTop: 12, color: colors.textMuted, fontSize: 13 },
  adminBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  secondaryButton: { alignItems: "center", padding: 16, marginTop: 12 },
  secondaryButtonText: { color: colors.textMuted, fontSize: 14 },
});
