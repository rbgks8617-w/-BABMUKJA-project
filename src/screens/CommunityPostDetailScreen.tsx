import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import CachedRemoteImage from "../components/CachedRemoteImage";
import {
  createCommunityComment,
  deleteCommunityReview,
  fetchCommunityReviews,
  type CommunityReviewDto,
} from "../services/communityApi";
import { getParticipantKey } from "../services/clientIdentity";
import { useAuth } from "../store/AuthContext";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";

type DetailComment = {
  id: string;
  body: string;
  authorKey: string;
  authorLabel?: string;
  createdAt: string;
};

type DetailPost = {
  id: string;
  title: string;
  body: string;
  meta: string;
  createdAt: string;
  isMine: boolean;
  imageUrl?: string;
  comments: DetailComment[];
};

function formatRating(score: number) {
  return score.toFixed(1);
}

function formatServerTime(value: string) {
  const createdAt = new Date(value);

  if (Number.isNaN(createdAt.getTime())) {
    return "방금";
  }

  const minutes = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000));

  if (minutes < 1) {
    return "방금";
  }

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  if (minutes < 1440) {
    return `${Math.floor(minutes / 60)}시간 전`;
  }

  return `${Math.floor(minutes / 1440)}일 전`;
}

function mapReviewToDetail(review: CommunityReviewDto, participantKey: string): DetailPost {
  return {
    id: review.id,
    title: review.title,
    body: review.body,
    meta: `맛 ${formatRating(review.tasteScore)} · 가성비 ${formatRating(review.valueScore)}`,
    createdAt: formatServerTime(review.createdAt),
    isMine: Boolean(participantKey && review.authorKey === participantKey),
    imageUrl: review.imageUrl ?? undefined,
    comments: review.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      authorKey: comment.anonymousKey,
      authorLabel: comment.anonymousLabel,
      createdAt: formatServerTime(comment.createdAt),
    })),
  };
}

function getCommentAuthorLabel(post: DetailPost, comment: DetailComment, commentIndex: number) {
  if (comment.authorLabel) {
    return comment.authorLabel;
  }

  const anonymousKeys = post.comments.slice(0, commentIndex + 1).reduce<string[]>((keys, item) => {
    if (!keys.includes(item.authorKey)) {
      keys.push(item.authorKey);
    }
    return keys;
  }, []);

  return `익명${anonymousKeys.indexOf(comment.authorKey) + 1}`;
}

export default function CommunityPostDetailScreen({ navigation, route }: AppScreenProps<"CommunityPostDetail">) {
  const participantKey = useMemo(() => getParticipantKey(), []);
  const { token, user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [post, setPost] = useState<DetailPost | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [serverError, setServerError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      const reviews = await fetchCommunityReviews();
      const review = reviews.find((item) => item.id === route.params.postId);

      if (!review) {
        setPost(null);
        setServerError("게시글을 찾을 수 없어요");
        return;
      }

      setPost(mapReviewToDetail(review, participantKey));
      setServerError("");
    } catch {
      setServerError("서버 연결을 확인하고 있어요");
    }
  }, [participantKey, route.params.postId]);

  useEffect(() => {
    loadPost();
    const timerId = setInterval(loadPost, 5000);
    return () => clearInterval(timerId);
  }, [loadPost]);

  async function submitComment() {
    const body = commentDraft.trim();

    if (!body || !post) {
      return;
    }

    const optimisticComment: DetailComment = {
      id: `${post.id}-comment-${Date.now()}`,
      body,
      authorKey: participantKey,
      authorLabel: "익명?",
      createdAt: "방금",
    };

    setPost((currentPost) =>
      currentPost
        ? {
            ...currentPost,
            comments: [...currentPost.comments, optimisticComment],
          }
        : currentPost,
    );
    setCommentDraft("");

    try {
      const savedReview = await createCommunityComment(post.id, {
        body,
        participantKey,
      });
      setPost(mapReviewToDetail(savedReview, participantKey));
      setServerError("");
    } catch {
      setServerError("댓글 저장에 실패했어요");
      loadPost();
    }
  }

  async function deletePost() {
    if (!post || (!post.isMine && !isAdmin)) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCommunityReview(post.id, {
        participantKey,
        token: isAdmin ? token ?? undefined : undefined,
      });
      navigation.goBack();
    } catch {
      setServerError("게시글 삭제에 실패했어요");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!post) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyText}>{serverError || "게시글을 불러오고 있어요"}</Text>
      </View>
    );
  }

  const canManage = post.isMine || isAdmin;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.topicPill}>
              <Text style={styles.topicText}>음식 후기</Text>
            </View>
            <Text style={styles.timeText}>{post.createdAt}</Text>
          </View>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.meta}>{post.meta} · 댓글 {post.comments.length}</Text>
          <Text style={styles.body}>{post.body}</Text>
          {post.imageUrl ? (
            <View style={styles.imageFrame}>
              <CachedRemoteImage uri={post.imageUrl} style={styles.detailImage} contentFit="contain" />
            </View>
          ) : null}
          {canManage ? (
            <Pressable style={[styles.deleteButton, isDeleting && styles.buttonDisabled]} onPress={deletePost} disabled={isDeleting}>
              <Text style={styles.deleteButtonText}>{post.isMine ? "게시글 삭제" : "관리자 삭제"}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.commentCard}>
          <Text style={styles.commentTitle}>댓글</Text>
          {post.comments.length > 0 ? (
            post.comments.map((comment, index) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{getCommentAuthorLabel(post, comment, index)}</Text>
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
              onChangeText={setCommentDraft}
              placeholder="댓글 달기"
              placeholderTextColor={colors.textSoft}
              style={styles.commentInput}
            />
            <Pressable style={styles.commentButton} onPress={submitComment}>
              <Text style={styles.commentButtonText}>등록</Text>
            </Pressable>
          </View>
        </View>

        {serverError ? (
          <View style={styles.serverNotice}>
            <Text style={styles.serverNoticeText}>{serverError}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "900",
  },
  container: {
    padding: 18,
    paddingBottom: 120,
  },
  postCard: {
    padding: 15,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  topicPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#edf6fc",
  },
  topicText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  timeText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "900",
  },
  title: {
    marginTop: 13,
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
  },
  meta: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  body: {
    marginTop: 14,
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 23,
  },
  imageFrame: {
    overflow: "hidden",
    width: "100%",
    height: 260,
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: "#f1f7fb",
    borderWidth: 1,
    borderColor: "#e2f0f7",
  },
  detailImage: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    alignSelf: "flex-end",
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  deleteButtonText: {
    color: "#e11d48",
    fontSize: 12,
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  commentCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentTitle: {
    marginBottom: 9,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  commentItem: {
    marginBottom: 9,
    padding: 11,
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
  commentTime: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
  },
  commentBody: {
    marginTop: 6,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  commentEmpty: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "900",
  },
  commentComposer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  commentButton: {
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
  serverNotice: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  serverNoticeText: {
    color: "#b45309",
    fontSize: 12,
    fontWeight: "900",
  },
});
