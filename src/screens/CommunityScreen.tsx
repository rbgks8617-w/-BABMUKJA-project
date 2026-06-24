import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";

type CommunityTab = "음식 후기" | "자유게시판" | "나랑 밥먹자";

type CommunityComment = {
  id: string;
  body: string;
  byAuthor: boolean;
  createdAt: string;
};

type CommunityPostItem = {
  id: string;
  topic: CommunityTab;
  title: string;
  body: string;
  createdAt: string;
  isMine: boolean;
  meta?: string;
  comments: CommunityComment[];
};

const tabs: CommunityTab[] = ["음식 후기", "자유게시판", "나랑 밥먹자"];

const initialPosts: CommunityPostItem[] = [
  {
    id: "review-1",
    topic: "음식 후기",
    title: "맘스터치 싸이버거 세트 든든함",
    meta: "맛 4.6 · 가성비 4.2",
    body: "공강 짧을 때 빨리 먹기 좋고 양도 꽤 괜찮아요.",
    createdAt: "방금",
    isMine: false,
    comments: [
      { id: "review-1-comment-1", body: "감튀까지 먹으면 진짜 든든하더라.", byAuthor: false, createdAt: "방금" },
      { id: "review-1-comment-2", body: "점심 피크만 피하면 빨라요.", byAuthor: false, createdAt: "방금" },
    ],
  },
  {
    id: "review-2",
    topic: "음식 후기",
    title: "라온식당 김치찌개 괜찮음",
    meta: "맛 4.3 · 가성비 4.5",
    body: "종합교육관 쪽 수업이면 이동이 편해서 자주 갈 듯.",
    createdAt: "3분 전",
    isMine: false,
    comments: [],
  },
  {
    id: "free-1",
    topic: "자유게시판",
    title: "오늘 점심 어디가 덜 붐벼요?",
    body: "12시 반쯤 TIP 가면 대기 긴지 궁금해요.",
    createdAt: "7분 전",
    isMine: false,
    comments: [{ id: "free-1-comment-1", body: "토마토김밥은 회전 빠른 편이에요.", byAuthor: false, createdAt: "5분 전" }],
  },
  {
    id: "mate-1",
    topic: "나랑 밥먹자",
    title: "12:30 라온식당 같이 갈 사람",
    body: "수업 끝나고 바로 갈 예정이에요. 조용히 밥만 먹어도 괜찮아요.",
    createdAt: "10분 전",
    isMine: false,
    comments: [],
  },
];

function getCommentAuthorLabel(post: CommunityPostItem, comment: CommunityComment, commentIndex: number) {
  if (comment.byAuthor) {
    return "글쓴이";
  }

  const anonymousOrder = post.comments.slice(0, commentIndex + 1).filter((item) => !item.byAuthor).length;
  return `익명${anonymousOrder}`;
}

function PostCard({
  post,
  commentDraft,
  onChangeComment,
  onSubmitComment,
}: {
  post: CommunityPostItem;
  commentDraft: string;
  onChangeComment: (value: string) => void;
  onSubmitComment: () => void;
}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postTop}>
        <View style={styles.postTopicPill}>
          <Text style={styles.postTopicText}>{post.topic}</Text>
        </View>
        <Text style={styles.postTime}>{post.createdAt}</Text>
      </View>
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postMeta}>
        익명{post.meta ? ` · ${post.meta}` : ""} · 댓글 {post.comments.length}
      </Text>
      <Text style={styles.postBody}>{post.body}</Text>

      <View style={styles.commentBlock}>
        <Text style={styles.commentTitle}>댓글</Text>
        {post.comments.length > 0 ? (
          post.comments.map((comment, index) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, comment.byAuthor && styles.commentAuthorOwner]}>
                  {getCommentAuthorLabel(post, comment, index)}
                </Text>
                <Text style={styles.commentTime}>{comment.createdAt}</Text>
              </View>
              <Text style={styles.commentBody}>{comment.body}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.commentEmpty}>아직 댓글이 없어요.</Text>
        )}

        <View style={styles.commentComposer}>
          <TextInput
            value={commentDraft}
            onChangeText={onChangeComment}
            placeholder="익명으로 댓글 달기"
            placeholderTextColor={colors.textSoft}
            style={styles.commentInput}
          />
          <Pressable style={styles.commentButton} onPress={onSubmitComment}>
            <Text style={styles.commentButtonText}>등록</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function CommunityScreen({ navigation }: AppScreenProps<"Community">) {
  const [activeTab, setActiveTab] = useState<CommunityTab>("음식 후기");
  const [posts, setPosts] = useState<CommunityPostItem[]>(initialPosts);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [writerOpen, setWriterOpen] = useState(false);
  const [writeTopic, setWriteTopic] = useState<CommunityTab>("음식 후기");
  const [writeTitle, setWriteTitle] = useState("");
  const [writeBody, setWriteBody] = useState("");

  const visiblePosts = useMemo(
    () => posts.filter((post) => post.topic === activeTab),
    [activeTab, posts],
  );

  function openWriter() {
    setWriteTopic(activeTab);
    setWriterOpen(true);
  }

  function closeWriter() {
    setWriterOpen(false);
    setWriteTitle("");
    setWriteBody("");
  }

  function createPost() {
    const title = writeTitle.trim();
    const body = writeBody.trim();

    if (!title || !body) {
      return;
    }

    const nextPost: CommunityPostItem = {
      id: `local-post-${Date.now()}`,
      topic: writeTopic,
      title,
      body,
      createdAt: "방금",
      isMine: true,
      comments: [],
    };

    setPosts((currentPosts) => [nextPost, ...currentPosts]);
    setActiveTab(writeTopic);
    closeWriter();
  }

  function updateCommentDraft(postId: string, value: string) {
    setCommentDrafts((currentDrafts) => ({
      ...currentDrafts,
      [postId]: value,
    }));
  }

  function addComment(postId: string) {
    const body = commentDrafts[postId]?.trim();

    if (!body) {
      return;
    }

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `${postId}-comment-${Date.now()}`,
              body,
              byAuthor: post.isMine,
              createdAt: "방금",
            },
          ],
        };
      }),
    );
    updateCommentDraft(postId, "");
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>캠퍼스 커뮤니티</Text>
          <Text style={styles.title}>학교 밥 얘기는 여기서 끝내요</Text>
          <Text style={styles.description}>모든 글과 댓글은 익명으로 표시돼요. 글쓴이가 댓글을 달면 글쓴이로만 보여요.</Text>
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
            <Text style={styles.panelTitle}>나랑 밥먹자 모임</Text>
            <Text style={styles.panelDescription}>모집글은 커뮤니티에 남기고, 실제 모임 생성과 채팅은 전용 화면에서 이어갈 수 있어요.</Text>
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("MealMate")}>
              <Text style={styles.primaryButtonText}>모임 만들러 가기</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeTab}</Text>
          <Text style={styles.sectionCount}>{visiblePosts.length}개</Text>
        </View>

        {visiblePosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            commentDraft={commentDrafts[post.id] ?? ""}
            onChangeComment={(value) => updateCommentDraft(post.id, value)}
            onSubmitComment={() => addComment(post.id)}
          />
        ))}
      </ScrollView>

      {writerOpen ? (
        <View style={styles.writerSheet}>
          <View style={styles.writerHandle} />
          <View style={styles.writerHeader}>
            <View>
              <Text style={styles.writerEyebrow}>익명 글쓰기</Text>
              <Text style={styles.writerTitle}>주제, 제목, 내용을 적어주세요</Text>
            </View>
            <Pressable hitSlop={8} onPress={closeWriter}>
              <Text style={styles.writerClose}>×</Text>
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>글쓰기 주제</Text>
          <View style={styles.topicRow}>
            {tabs.map((topic) => (
              <Pressable
                key={topic}
                style={[styles.topicChip, writeTopic === topic && styles.topicChipActive]}
                onPress={() => setWriteTopic(topic)}
              >
                <Text style={[styles.topicChipText, writeTopic === topic && styles.topicChipTextActive]}>{topic}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>제목</Text>
          <TextInput
            value={writeTitle}
            onChangeText={setWriteTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor={colors.textSoft}
            style={styles.writerInput}
          />

          <Text style={styles.inputLabel}>내용</Text>
          <TextInput
            value={writeBody}
            onChangeText={setWriteBody}
            placeholder="내용을 입력하세요"
            placeholderTextColor={colors.textSoft}
            multiline
            style={[styles.writerInput, styles.writerTextArea]}
          />

          <Pressable
            style={[styles.submitButton, (!writeTitle.trim() || !writeBody.trim()) && styles.submitButtonDisabled]}
            onPress={createPost}
          >
            <Text style={styles.submitButtonText}>익명으로 글 올리기</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.writeDock} onPress={openWriter}>
          <View>
            <Text style={styles.writeDockEyebrow}>커뮤니티 글쓰기</Text>
            <Text style={styles.writeDockTitle}>익명으로 새 글 올리기</Text>
          </View>
          <Text style={styles.writeDockAction}>글쓰기</Text>
        </Pressable>
      )}
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
    paddingBottom: 138,
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
  matePanel: {
    marginBottom: 12,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  panelDescription: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  sectionCount: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#edf6fc",
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  postTopicPill: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#edf6fc",
  },
  postTopicText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  postTime: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
  },
  postTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23,
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
  commentBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2f0f7",
  },
  commentTitle: {
    marginBottom: 8,
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  commentItem: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#f7fbfe",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  commentAuthor: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  commentAuthorOwner: {
    color: colors.orange,
  },
  commentTime: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: "800",
  },
  commentBody: {
    marginTop: 5,
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  commentEmpty: {
    marginBottom: 8,
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  commentComposer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7edf7",
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  commentButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  commentButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  writeDock: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderWidth: 1,
    borderColor: "#cdeaf7",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  writeDockEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  writeDockTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  writeDockAction: {
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.primary,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  writerSheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 20,
    padding: 16,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cdeaf7",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
    elevation: 10,
  },
  writerHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    marginBottom: 12,
    borderRadius: 999,
    backgroundColor: "#dcecf5",
  },
  writerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  writerEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  writerTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  writerClose: {
    width: 30,
    height: 30,
    overflow: "hidden",
    borderRadius: 15,
    backgroundColor: "#edf6fc",
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29,
    textAlign: "center",
  },
  inputLabel: {
    marginTop: 8,
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  topicRow: {
    flexDirection: "row",
    gap: 8,
  },
  topicChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f7fbfe",
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  topicChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  topicChipTextActive: {
    color: "#ffffff",
  },
  writerInput: {
    minHeight: 45,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#f7fbfe",
    borderWidth: 1,
    borderColor: "#d7edf7",
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  writerTextArea: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  submitButton: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: "#b9d3e7",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
});
