import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

const tabs = ["음식 후기", "자유게시판", "나랑 밥먹자"];

const reviewPosts = [
  { id: "review-1", title: "맘스터치 싸이버거 세트 든든함", meta: "익명 · 맛 4.6 · 가성비 4.2", body: "공강 짧을 때 빨리 먹기 좋고 양도 꽤 괜찮아요." },
  { id: "review-2", title: "라온식당 김치찌개 괜찮음", meta: "익명 · 맛 4.3 · 가성비 4.5", body: "종합교육관 쪽 수업이면 이동이 편해서 자주 갈 듯." },
];

const freePosts = [
  { id: "free-1", title: "오늘 점심 어디가 덜 붐벼요?", meta: "익명 · 댓글 8", body: "12시 반쯤 TIP 가면 대기 긴지 궁금해요." },
  { id: "free-2", title: "시험기간 카페 자리 공유해요", meta: "익명 · 댓글 5", body: "cafe ing는 지금 자리가 조금 남아 있어요." },
];

function PostCard({ post }) {
  return (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postMeta}>{post.meta}</Text>
      <Text style={styles.postBody}>{post.body}</Text>
    </View>
  );
}

export default function CommunityScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("음식 후기");
  const posts = activeTab === "음식 후기" ? reviewPosts : freePosts;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>캠퍼스 커뮤니티</Text>
        <Text style={styles.title}>학교 밥 얘기는 여기서 끝내요</Text>
        <Text style={styles.description}>음식 후기, 자유게시판, 나랑 밥먹자 모임을 한 곳에서 확인해요.</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "나랑 밥먹자" ? (
        <View style={styles.matePanel}>
          <Text style={styles.panelTitle}>혼밥이 걱정될 때</Text>
          <Text style={styles.panelDescription}>익명으로 대화 주제와 시간을 적고 같이 밥 먹을 사람을 찾아요.</Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("MealMate")}>
            <Text style={styles.primaryButtonText}>나랑 밥먹자 열기</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.writeCard}>
            <Text style={styles.writeTitle}>{activeTab} 글쓰기</Text>
            <Text style={styles.writeText}>MVP에서는 더미 글 목록으로 먼저 커뮤니티 흐름을 확인해요.</Text>
          </View>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 48,
    backgroundColor: colors.background,
  },
  hero: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#eaf7fc",
    borderWidth: 1,
    borderColor: "#ccebf7",
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    marginTop: 8,
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
  },
  description: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  writeCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  writeTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  writeText: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  postCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  postTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  postMeta: {
    marginTop: 6,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  postBody: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  matePanel: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
  },
  panelDescription: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
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
});
