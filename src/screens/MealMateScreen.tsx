import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { getParticipantKey } from "../services/clientIdentity";
import {
  createMealMateRoom,
  fetchMealMateRooms,
  joinMealMateRoom,
  leaveMealMateRoom,
  type MealMateRoomDto,
} from "../services/mealMateApi";
import { getRestaurants } from "../services/restaurantService";
import { useNotifications } from "../store/NotificationContext";
import { colors } from "../theme/colors";
import type { AppScreenProps, Restaurant } from "../types/app";

const anonymousNames = ["익명 01", "익명 02", "익명 03", "익명 04", "익명 05"];
const maxLocalMealMatePosts = 60;

type MealMateLocalPost = {
  id: string;
  restaurant: Restaurant;
  time: string;
  topic: string;
  currentCount: number;
  maxCount: number;
  note: string;
  createdBy: string;
  joinedByMe: boolean;
};

function buildInitialPosts(restaurants: Restaurant[]): MealMateLocalPost[] {
  const first = restaurants[0];
  const second = restaurants[1] ?? restaurants[0];

  if (!first || !second) {
    return [];
  }

  return [
    {
      id: "mate-1",
      restaurant: first,
      time: "12:30",
      topic: "공강 때 뭐 하고 지내는지",
      currentCount: 2,
      maxCount: 4,
      note: "처음 보는 사람이어도 편하게 밥 먹고 흩어지는 모임이에요.",
      createdBy: "익명 01",
      joinedByMe: false,
    },
    {
      id: "mate-2",
      restaurant: second,
      time: "18:10",
      topic: "시험기간 버티는 법",
      currentCount: 1,
      maxCount: 3,
      note: "저녁 먹으면서 과제랑 시험 얘기 가볍게 해요.",
      createdBy: "익명 02",
      joinedByMe: false,
    },
  ];
}

function mapRoomToPost(room: MealMateRoomDto, restaurants: Restaurant[]): MealMateLocalPost {
  const restaurant = restaurants.find((item) => item.id === room.restaurantId) ?? {
    id: room.restaurantId,
    name: room.restaurantName,
    category: "",
    rating: 0,
    tasteScore: 0,
    portionScore: 0,
    valueScore: 0,
    imageUrl: "",
    location: "",
    phone: "",
    openingHours: "",
    isOpen: true,
    reviewSummary: "",
    description: "",
  };

  return {
    id: room.id,
    restaurant,
    time: room.time,
    topic: room.topic,
    currentCount: room.currentCount,
    maxCount: room.maxCount,
    note: room.note,
    createdBy: "익명1",
    joinedByMe: room.joinedByMe,
  };
}

export default function MealMateScreen({ navigation }: AppScreenProps<"MealMate">) {
  const restaurants = useMemo(() => getRestaurants().slice(0, 8), []);
  const participantKey = useMemo(() => getParticipantKey(), []);
  const [posts, setPosts] = useState(() => buildInitialPosts(restaurants));
  const [serverError, setServerError] = useState("");
  const [topic, setTopic] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [maxCount, setMaxCount] = useState(3);
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id);
  const [toastMessage, setToastMessage] = useState("");
  const toastMotion = useRef(new Animated.Value(0)).current;
  const { addNotification } = useNotifications();

  const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === restaurantId) ?? restaurants[0];

  const loadRooms = useCallback(async () => {
    try {
      const rooms = await fetchMealMateRooms(participantKey);
      setPosts(rooms.map((room) => mapRoomToPost(room, restaurants)));
      setServerError("");
    } catch {
      setServerError("서버 연결을 확인하고 있어요");
    }
  }, [participantKey, restaurants]);

  useEffect(() => {
    loadRooms();
    const timerId = setInterval(loadRooms, 5000);
    return () => clearInterval(timerId);
  }, [loadRooms]);

  const showToast = (message: string) => {
    setToastMessage(message);
    toastMotion.stopAnimation();
    toastMotion.setValue(0);
    Animated.sequence([
      Animated.timing(toastMotion, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastMotion, {
        toValue: 0,
        duration: 360,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const createPost = async () => {
    if (!selectedRestaurant) {
      return;
    }

    if (posts.some((post) => post.joinedByMe)) {
      showToast("이미 참여 중인 모임이 있어요. 먼저 나가주세요");
      return;
    }

    const normalizedTopic = topic.trim() || "편하게 밥 먹기";
    const normalizedTime = time.trim() || "시간 협의";
    const normalizedNote = note.trim() || "부담 없이 와서 밥만 먹고 가도 좋아요.";
    try {
      const savedRoom = await createMealMateRoom({
        restaurantId: selectedRestaurant.id,
        time: normalizedTime,
        topic: normalizedTopic,
        note: normalizedNote,
        maxCount,
        participantKey,
      });
      const nextPost = mapRoomToPost(savedRoom, restaurants);

      setPosts((currentPosts) => [nextPost, ...currentPosts].slice(0, maxLocalMealMatePosts));
      setTopic("");
      setTime("");
      setNote("");
      addNotification({
        type: "mate",
        title: "나랑 밥먹자 모집 시작",
        message: `${normalizedTime} ${selectedRestaurant.name} 모임이 만들어졌어요.`,
      });
      showToast("나랑 밥먹자 모집글을 올렸어요");
    } catch {
      showToast("모집글 저장에 실패했어요");
      setServerError("서버 연결을 확인하고 있어요");
    }
  };

  const openChat = (post: MealMateLocalPost) => {
    navigation.navigate("MealMateChat", {
      room: {
        id: post.id,
        title: post.restaurant?.name ?? "나랑 밥먹자",
        topic: post.topic,
        time: post.time,
        members: post.currentCount,
        maxCount: post.maxCount,
      },
    });
  };

  const leavePost = async (postId: string) => {
    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost?.joinedByMe) {
      return;
    }

    try {
      const savedRoom = await leaveMealMateRoom(postId, participantKey);
      const nextPost = mapRoomToPost(savedRoom, restaurants);

      setPosts((currentPosts) => currentPosts.map((post) => (post.id === postId ? nextPost : post)));
      showToast("모임에서 나갔어요");
      setServerError("");
    } catch {
      showToast("나가기에 실패했어요");
      setServerError("서버 연결을 확인하고 있어요");
    }
  };

  const joinPost = async (postId: string) => {
    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    if (targetPost.joinedByMe) {
      openChat(targetPost);
      return;
    }

    if (posts.some((post) => post.joinedByMe)) {
      showToast("이미 참여 중인 모임이 있어요. 먼저 나가주세요");
      return;
    }

    if (targetPost.currentCount >= targetPost.maxCount) {
      showToast("이미 마감된 모임이에요");
      return;
    }

    try {
      const savedRoom = await joinMealMateRoom(postId, participantKey);
      const updatedPost = mapRoomToPost(savedRoom, restaurants);
      const isFull = updatedPost.currentCount >= updatedPost.maxCount;

      setPosts((currentPosts) => currentPosts.map((post) => (post.id === postId ? updatedPost : post)));

      addNotification({
        type: "mate",
        title: isFull ? "나랑 밥먹자 모집 마감" : "나랑 밥먹자 참여 알림",
        message: isFull
          ? `${targetPost.time} ${targetPost.restaurant?.name ?? "식당"} 모임 인원이 다 찼어요.`
          : `${targetPost.time} ${targetPost.restaurant?.name ?? "식당"} 모임에 익명 학생이 참여했어요.`,
      });

      showToast(isFull ? "모집 인원이 다 찼어요" : "참여했어요. 채팅방이 열렸어요");
      setServerError("");
      openChat(updatedPost);
    } catch {
      showToast("참여에 실패했어요");
      setServerError("서버 연결을 확인하고 있어요");
    }
  };

  const toastTranslateY = toastMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const renderRestaurantChip = useCallback(
    ({ item: restaurant }: { item: Restaurant }) => {
      const isSelected = restaurant.id === restaurantId;

      return (
        <Pressable
          style={[styles.restaurantChip, isSelected && styles.restaurantChipSelected]}
          onPress={() => setRestaurantId(restaurant.id)}
        >
          <Text style={[styles.restaurantChipText, isSelected && styles.restaurantChipTextSelected]}>
            {restaurant.name}
          </Text>
        </Pressable>
      );
    },
    [restaurantId],
  );

  const renderPost = useCallback(
    ({ item: post, index }: { item: MealMateLocalPost; index: number }) => {
      const isFull = post.currentCount >= post.maxCount;
      const buttonLabel = isFull ? "마감" : "참여하기";

      return (
        <View style={styles.postCard}>
          <View style={styles.postTop}>
            <View style={styles.postTitleBlock}>
              <Text style={styles.postRestaurant}>{post.restaurant?.name ?? "식당"}</Text>
              <Text style={styles.postMeta}>
                {post.time} · {post.topic}
              </Text>
            </View>
            <View style={[styles.countPill, isFull && styles.countPillFull]}>
              <Text style={[styles.countText, isFull && styles.countTextFull]}>
                {post.currentCount}/{post.maxCount}
              </Text>
            </View>
          </View>
          <Text style={styles.postNote}>{post.note}</Text>
          <View style={styles.postFooter}>
            <Text style={styles.creator}>{post.createdBy ?? anonymousNames[index % anonymousNames.length]}</Text>
            {post.joinedByMe ? (
              <View style={styles.joinedActions}>
                <Pressable style={styles.chatButton} onPress={() => openChat(post)}>
                  <Text style={styles.joinButtonText}>채팅방</Text>
                </Pressable>
                <Pressable style={styles.leaveButton} onPress={() => leavePost(post.id)}>
                  <Text style={styles.leaveButtonText}>나가기</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.joinButton, isFull && styles.joinButtonDisabled]}
                onPress={() => joinPost(post.id)}
              >
                <Text style={[styles.joinButtonText, isFull && styles.joinButtonTextDisabled]}>{buttonLabel}</Text>
              </Pressable>
            )}
          </View>
        </View>
      );
    },
    [posts],
  );

  const listHeader = (
    <>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>나랑 밥먹자</Text>
        <Text style={styles.title}>익명으로 편하게 밥 약속 잡기</Text>
        <Text style={styles.description}>실명 없이 대화 주제와 시간을 직접 적고, 모임이 생기면 채팅방에서 장소를 맞춰요.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>모집글 만들기</Text>
        <TextInput
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
          placeholder="대화 주제 직접 입력"
          placeholderTextColor={colors.textSoft}
        />
        <TextInput
          style={styles.input}
          value={time}
          onChangeText={setTime}
          placeholder="시간 직접 입력 예: 오늘 12:30"
          placeholderTextColor={colors.textSoft}
        />
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={note}
          onChangeText={setNote}
          placeholder="모임 설명을 적어주세요"
          placeholderTextColor={colors.textSoft}
          multiline
        />

        <View style={styles.countRow}>
          <Text style={styles.fieldLabel}>모집 인원</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepButton} onPress={() => setMaxCount((count) => Math.max(2, count - 1))}>
              <Text style={styles.stepText}>-</Text>
            </Pressable>
            <Text style={styles.countValue}>{maxCount}명</Text>
            <Pressable style={styles.stepButton} onPress={() => setMaxCount((count) => Math.min(6, count + 1))}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.fieldLabel}>식당 선택</Text>
        <FlatList
          horizontal
          data={restaurants}
          keyExtractor={(restaurant) => restaurant.id}
          renderItem={renderRestaurantChip}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.restaurantChips}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={3}
          removeClippedSubviews
        />

        <Pressable style={styles.createButton} onPress={createPost}>
          <Text style={styles.createButtonText}>익명으로 모집 올리기</Text>
        </Pressable>
      </View>

      <View style={styles.boardHeader}>
        <Text style={styles.sectionTitle}>현재 모집 중</Text>
        <Text style={styles.boardMeta}>{posts.length}개</Text>
      </View>
      {serverError ? (
        <View style={styles.serverNotice}>
          <Text style={styles.serverNoticeText}>{serverError}</Text>
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={renderPost}
        ListHeaderComponent={listHeader}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
      />

      {toastMessage ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              opacity: toastMotion,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 118,
    backgroundColor: colors.background,
  },
  hero: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#eaf7fc",
    borderWidth: 1,
    borderColor: "#ccebf7",
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
  formCard: {
    marginBottom: 14,
    padding: 15,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  input: {
    marginTop: 10,
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
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  fieldLabel: {
    marginTop: 12,
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.ink,
  },
  stepText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 21,
  },
  countValue: {
    minWidth: 34,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  restaurantChips: {
    gap: 8,
    paddingTop: 10,
    paddingBottom: 2,
  },
  restaurantChip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  restaurantChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  restaurantChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  restaurantChipTextSelected: {
    color: "#ffffff",
  },
  createButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  boardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  boardMeta: {
    color: colors.textSoft,
    fontWeight: "900",
  },
  serverNotice: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  serverNoticeText: {
    color: "#c2410c",
    fontSize: 12,
    fontWeight: "900",
  },
  postCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  postTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  postTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  postRestaurant: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  postMeta: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#eaf7fc",
  },
  countPillFull: {
    backgroundColor: "#fff1ed",
  },
  countText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  countTextFull: {
    color: "#e34224",
  },
  postNote: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 14,
  },
  creator: {
    flex: 1,
    minWidth: 0,
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  joinButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.ink,
  },
  joinButtonDisabled: {
    backgroundColor: "#eef3f6",
  },
  joinedActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexShrink: 0,
  },
  chatButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.ink,
  },
  leaveButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#fff0ec",
    borderWidth: 1,
    borderColor: "#ffd5c9",
  },
  joinButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  joinButtonTextDisabled: {
    color: colors.textSoft,
  },
  leaveButtonText: {
    color: "#e34b2f",
    fontSize: 13,
    fontWeight: "900",
  },
  toast: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: "#202124",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  toastText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
});
