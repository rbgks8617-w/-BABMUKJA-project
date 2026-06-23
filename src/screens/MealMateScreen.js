import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getMealMatePosts, getMealMateTopics, getRestaurants } from "../services/restaurantService";
import { colors } from "../theme/colors";

const maxCountOptions = [2, 3, 4, 5, 6];
const timeOptions = ["12:00", "12:30", "13:00", "17:30", "18:00"];

export default function MealMateScreen() {
  const topics = getMealMateTopics();
  const restaurants = useMemo(() => getRestaurants().slice(0, 6), []);
  const [posts, setPosts] = useState(getMealMatePosts);
  const [topic, setTopic] = useState(topics[0]);
  const [maxCount, setMaxCount] = useState(3);
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id);
  const [time, setTime] = useState("12:30");
  const [notice, setNotice] = useState("");

  const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === restaurantId) ?? restaurants[0];

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
    setNotice("모집글이 올라갔어요.");
  };

  const joinPost = (postId) => {
    setPosts((currentPosts) =>
      currentPosts
        .map((post) => {
          if (post.id !== postId) {
            return post;
          }

          return {
            ...post,
            currentCount: post.currentCount + 1,
          };
        })
        .filter((post) => post.currentCount < post.maxCount)
    );
    setNotice("참여했어요. 정원이 차면 글은 자동으로 내려가요.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>혼밥이 걱정될 때</Text>
        <Text style={styles.title}>밥 같이 먹을 사람 찾기</Text>
        <Text style={styles.description}>대화 주제와 인원수를 먼저 정하고, 부담 없는 한 끼 모임을 만들어봐요.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>모집글 만들기</Text>

        <Text style={styles.fieldLabel}>대화 주제</Text>
        <View style={styles.chipWrap}>
          {topics.map((item) => (
            <Pressable
              key={item}
              style={[styles.chip, topic === item && styles.chipSelected]}
              onPress={() => setTopic(item)}
            >
              <Text style={[styles.chipText, topic === item && styles.chipTextSelected]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>몇 명까지 모을까요?</Text>
        <View style={styles.chipWrap}>
          {maxCountOptions.map((count) => (
            <Pressable
              key={count}
              style={[styles.countChip, maxCount === count && styles.chipSelected]}
              onPress={() => setMaxCount(count)}
            >
              <Text style={[styles.chipText, maxCount === count && styles.chipTextSelected]}>{count}명</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>어디서 먹을까요?</Text>
        <View style={styles.chipWrap}>
          {restaurants.map((restaurant) => (
            <Pressable
              key={restaurant.id}
              style={[styles.chip, restaurantId === restaurant.id && styles.chipSelected]}
              onPress={() => setRestaurantId(restaurant.id)}
            >
              <Text style={[styles.chipText, restaurantId === restaurant.id && styles.chipTextSelected]}>
                {restaurant.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>시간</Text>
        <View style={styles.chipWrap}>
          {timeOptions.map((item) => (
            <Pressable key={item} style={[styles.countChip, time === item && styles.chipSelected]} onPress={() => setTime(item)}>
              <Text style={[styles.chipText, time === item && styles.chipTextSelected]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.createButton} onPress={createPost}>
          <Text style={styles.createButtonText}>모집 글 올리기</Text>
        </Pressable>
      </View>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
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
    padding: 16,
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
  fieldLabel: {
    marginTop: 16,
    marginBottom: 9,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "900",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countChip: {
    minWidth: 58,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  createButton: {
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  notice: {
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#202124",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
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
});
