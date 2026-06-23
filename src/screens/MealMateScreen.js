import React, { useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getMealMatePosts, getMealMateTopics, getRestaurants } from "../services/restaurantService";
import { useNotifications } from "../store/NotificationContext";
import { colors } from "../theme/colors";

const maxCountOptions = [2, 3, 4, 5, 6];
const timeOptions = ["12:00", "12:30", "13:00", "17:30", "18:00"];

function SelectorSection({ id, title, value, isOpen, options, onToggle, onSelect }) {
  return (
    <View style={styles.selectorBlock}>
      <Pressable style={styles.selectorHeader} onPress={() => onToggle(id)}>
        <View>
          <Text style={styles.fieldLabel}>{title}</Text>
          <Text style={styles.selectedValue}>{value}</Text>
        </View>
        <Text style={[styles.selectorChevron, isOpen && styles.selectorChevronOpen]}>⌄</Text>
      </Pressable>

      {isOpen ? (
        <View style={styles.optionPanel}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={[styles.optionChip, value === option.label && styles.optionChipSelected]}
              onPress={() => onSelect(option.value)}
            >
              <Text style={[styles.optionText, value === option.label && styles.optionTextSelected]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function MealMateScreen() {
  const topics = getMealMateTopics();
  const restaurants = useMemo(() => getRestaurants().slice(0, 6), []);
  const [posts, setPosts] = useState(getMealMatePosts);
  const [topic, setTopic] = useState(topics[0]);
  const [maxCount, setMaxCount] = useState(3);
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id);
  const [time, setTime] = useState("12:30");
  const [openSelector, setOpenSelector] = useState("topic");
  const [toastMessage, setToastMessage] = useState("");
  const toastMotion = useRef(new Animated.Value(0)).current;
  const { addNotification } = useNotifications();

  const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === restaurantId) ?? restaurants[0];
  const restaurantOptions = restaurants.map((restaurant) => ({
    label: restaurant.name,
    value: restaurant.id,
  }));

  const showToast = (message) => {
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

  const toggleSelector = (selectorId) => {
    setOpenSelector((currentSelector) => (currentSelector === selectorId ? "" : selectorId));
  };

  const createPost = () => {
    if (!selectedRestaurant) {
      return;
    }

    const nextPost = {
      id: `local-${Date.now()}`,
      restaurantId: selectedRestaurant.id,
      restaurant: selectedRestaurant,
      time,
      topic,
      currentCount: 1,
      maxCount,
      note: `${topic} 주제로 편하게 밥 먹을 사람`,
      createdBy: "나",
    };

    setPosts((currentPosts) => [nextPost, ...currentPosts]);
    addNotification({
      type: "mate",
      title: "밥친구 모집 시작",
      message: `${time} ${selectedRestaurant.name} 모임을 열었어요.`,
    });
    showToast("모집글이 올라갔어요.");
  };

  const joinPost = (postId) => {
    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    const nextCount = targetPost.currentCount + 1;
    const isFull = nextCount >= targetPost.maxCount;

    setPosts((currentPosts) =>
      currentPosts
        .map((post) => {
          if (post.id !== postId) {
            return post;
          }

          return {
            ...post,
            currentCount: nextCount,
          };
        })
        .filter((post) => post.currentCount < post.maxCount),
    );

    addNotification({
      type: "mate",
      title: isFull ? "밥친구 모집 마감" : "밥친구 참여 알림",
      message: isFull
        ? `${targetPost.time} ${targetPost.restaurant?.name ?? "식당"} 모임 인원이 다 찼어요.`
        : `${targetPost.time} ${targetPost.restaurant?.name ?? "식당"} 모임에 누군가 참여했어요.`,
    });

    showToast(isFull ? "모집 인원이 다 차서 글이 내려갔어요." : "참여했어요.");
  };

  const toastTranslateY = toastMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>혼밥이 걱정될 때</Text>
          <Text style={styles.title}>밥 같이 먹을 사람 찾기</Text>
          <Text style={styles.description}>대화 주제와 인원만 정하면 부담 없는 한 끼 모임을 바로 만들 수 있어요.</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>모집글 만들기</Text>
            <Text style={styles.formHint}>눌러서 고르기</Text>
          </View>

          <SelectorSection
            id="topic"
            title="대화 주제"
            value={topic}
            isOpen={openSelector === "topic"}
            options={topics.map((item) => ({ label: item, value: item }))}
            onToggle={toggleSelector}
            onSelect={setTopic}
          />
          <SelectorSection
            id="count"
            title="모집 인원"
            value={`${maxCount}명까지`}
            isOpen={openSelector === "count"}
            options={maxCountOptions.map((count) => ({ label: `${count}명까지`, value: count }))}
            onToggle={toggleSelector}
            onSelect={setMaxCount}
          />
          <SelectorSection
            id="restaurant"
            title="식당"
            value={selectedRestaurant?.name ?? "식당 선택"}
            isOpen={openSelector === "restaurant"}
            options={restaurantOptions}
            onToggle={toggleSelector}
            onSelect={setRestaurantId}
          />
          <SelectorSection
            id="time"
            title="시간"
            value={time}
            isOpen={openSelector === "time"}
            options={timeOptions.map((item) => ({ label: item, value: item }))}
            onToggle={toggleSelector}
            onSelect={setTime}
          />

          <Pressable style={styles.createButton} onPress={createPost}>
            <Text style={styles.createButtonText}>모집 글 올리기</Text>
          </Pressable>
        </View>

        <View style={styles.boardHeader}>
          <Text style={styles.sectionTitle}>현재 모집 중</Text>
          <Text style={styles.boardMeta}>{posts.length}개</Text>
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>모집 중인 밥친구가 없어요</Text>
            <Text style={styles.emptyText}>새 모집글을 올리면 바로 여기에 떠요.</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postTop}>
                <View style={styles.postTitleBlock}>
                  <Text style={styles.postRestaurant}>{post.restaurant?.name ?? "식당"}</Text>
                  <Text style={styles.postMeta}>
                    {post.time} · {post.topic}
                  </Text>
                </View>
                <View style={styles.countPill}>
                  <Text style={styles.countText}>
                    {post.currentCount}/{post.maxCount}
                  </Text>
                </View>
              </View>
              <Text style={styles.postNote}>{post.note}</Text>
              <View style={styles.postFooter}>
                <Text style={styles.creator}>{post.createdBy}</Text>
                <Pressable style={styles.joinButton} onPress={() => joinPost(post.id)}>
                  <Text style={styles.joinButtonText}>참여하기</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

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
    paddingBottom: 96,
    backgroundColor: colors.background,
  },
  hero: {
    marginBottom: 16,
    padding: 18,
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
    padding: 14,
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
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  formHint: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  selectorBlock: {
    overflow: "hidden",
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  fieldLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  selectedValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  selectorChevron: {
    width: 28,
    height: 28,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    color: colors.primaryDark,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 25,
    textAlign: "center",
  },
  selectorChevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  optionPanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  optionTextSelected: {
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
  emptyCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 6,
    color: colors.textMuted,
    fontWeight: "800",
  },
  postCard: {
    marginBottom: 12,
    padding: 15,
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
  countText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
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
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.ink,
  },
  joinButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  toast: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 22,
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
