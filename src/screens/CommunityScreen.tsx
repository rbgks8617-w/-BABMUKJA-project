import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, PanResponder, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import CachedRemoteImage from "../components/CachedRemoteImage";
import {
  createCommunityComment,
  createCommunityReview,
  fetchCommunityReviews,
  type CommunityReviewDto,
} from "../services/communityApi";
import { useNotifications } from "../store/NotificationContext";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";

type CommunityTab = "음식 후기" | "나랑 밥먹자";

type CommunityComment = {
  id: string;
  body: string;
  byAuthor: boolean;
  authorKey: string;
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
  imageUrl?: string;
  comments: CommunityComment[];
};

const tabs: CommunityTab[] = ["음식 후기", "나랑 밥먹자"];
const ratingStep = 0.5;
const minRating = 0.5;
const maxRating = 5;
const maxLocalPosts = 80;
const maxLocalComments = 60;
const authoredReviewStorageKey = "babmukja-authored-review-ids";

function formatRating(score: number) {
  return score.toFixed(1);
}

function clampRating(score: number) {
  return Math.min(maxRating, Math.max(minRating, Number(score.toFixed(1))));
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

function mapReviewToPost(review: CommunityReviewDto): CommunityPostItem {
  return {
    id: review.id,
    topic: "음식 후기",
    title: review.title,
    body: review.body,
    meta: `맛 ${formatRating(review.tasteScore)} · 가성비 ${formatRating(review.valueScore)}`,
    createdAt: formatServerTime(review.createdAt),
    isMine: false,
    imageUrl: review.imageUrl ?? undefined,
    comments: review.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      byAuthor: false,
      authorKey: comment.anonymousKey,
      createdAt: formatServerTime(comment.createdAt),
    })),
  };
}

function readAuthoredReviewIds() {
  if (typeof globalThis.localStorage === "undefined") {
    return new Set<string>();
  }

  try {
    const rawValue = globalThis.localStorage.getItem(authoredReviewStorageKey);
    const ids = rawValue ? (JSON.parse(rawValue) as string[]) : [];
    return new Set(ids.filter((id) => typeof id === "string"));
  } catch {
    return new Set<string>();
  }
}

function writeAuthoredReviewIds(ids: Set<string>) {
  if (typeof globalThis.localStorage === "undefined") {
    return;
  }

  globalThis.localStorage.setItem(authoredReviewStorageKey, JSON.stringify(Array.from(ids).slice(-120)));
}

const initialPosts: CommunityPostItem[] = [
  {
    id: "review-1",
    topic: "음식 후기",
    title: "맘스터치 싸이버거 세트 든든함",
    meta: "맛 4.5 · 가성비 4.0",
    body: "공강 짧을 때 빨리 먹기 좋고 양도 꽤 괜찮아요.",
    createdAt: "방금",
    isMine: false,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    comments: [
      { id: "review-1-comment-1", body: "감튀까지 먹으면 진짜 든든하더라.", byAuthor: false, authorKey: "student-a", createdAt: "방금" },
      { id: "review-1-comment-2", body: "점심 피크만 피하면 빨라요.", byAuthor: false, authorKey: "student-b", createdAt: "방금" },
    ],
  },
  {
    id: "review-2",
    topic: "음식 후기",
    title: "라온식당 김치찌개 괜찮음",
    meta: "맛 4.5 · 가성비 4.5",
    body: "종합교육관 쪽 수업이면 이동이 편해서 자주 갈 듯.",
    createdAt: "3분 전",
    isMine: false,
    imageUrl: "https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=700&q=80",
    comments: [],
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

const matePosts = initialPosts.filter((post) => post.topic === "나랑 밥먹자");

function getCommentAuthorLabel(post: CommunityPostItem, comment: CommunityComment, commentIndex: number) {
  if (comment.byAuthor) {
    return "글쓴이";
  }

  const anonymousKeys = post.comments.slice(0, commentIndex + 1).reduce<string[]>((keys, item) => {
    if (!item.byAuthor && !keys.includes(item.authorKey)) {
      keys.push(item.authorKey);
    }
    return keys;
  }, []);

  return `익명${anonymousKeys.indexOf(comment.authorKey) + 1}`;
}

function PostCard({
  post,
  commentDraft,
  isExpanded,
  onChangeComment,
  onSubmitComment,
  onToggle,
}: {
  post: CommunityPostItem;
  commentDraft: string;
  isExpanded: boolean;
  onChangeComment: (value: string) => void;
  onSubmitComment: () => void;
  onToggle: () => void;
}) {
  return (
    <View style={styles.postCard}>
      <Pressable style={styles.postSummary} onPress={onToggle}>
        <View style={styles.postSummaryCopy}>
          <View style={styles.postTopicPill}>
            <Text style={styles.postTopicText}>{post.topic}</Text>
          </View>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postMeta}>{post.meta ? `${post.meta} · ` : ""}댓글 {post.comments.length}</Text>
        </View>
        <View style={styles.postSideMeta}>
          <Text style={styles.postTime}>{post.createdAt}</Text>
          {post.imageUrl ? <CachedRemoteImage uri={post.imageUrl} style={styles.postThumbnail} /> : null}
          <Text style={styles.expandHint}>{isExpanded ? "닫기" : "보기"}</Text>
        </View>
      </Pressable>

      {isExpanded ? (
        <View style={styles.postDetail}>
          <Text style={styles.postBody}>{post.body}</Text>
          {post.imageUrl ? <CachedRemoteImage uri={post.imageUrl} style={styles.postDetailImage} /> : null}

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
                placeholder="댓글 달기"
                placeholderTextColor={colors.textSoft}
                style={styles.commentInput}
              />
              <Pressable style={styles.commentButton} onPress={onSubmitComment}>
                <Text style={styles.commentButtonText}>등록</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function CommunityScreen({ navigation, route }: AppScreenProps<"Community">) {
  const { height: viewportHeight } = useWindowDimensions();
  const maxWriterHeight = Math.max(360, viewportHeight - 28);
  const minWriterHeight = Math.min(maxWriterHeight, Math.max(320, viewportHeight * 0.52));
  const defaultWriterHeight = Math.min(maxWriterHeight, Math.max(minWriterHeight, viewportHeight * 0.7));

  const [activeTab, setActiveTab] = useState<CommunityTab>("음식 후기");
  const [posts, setPosts] = useState<CommunityPostItem[]>(initialPosts);
  const [serverError, setServerError] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [writerOpen, setWriterOpen] = useState(false);
  const [writeTitle, setWriteTitle] = useState("");
  const [writeBody, setWriteBody] = useState("");
  const [writeImageUrl, setWriteImageUrl] = useState("");
  const [writeTasteScore, setWriteTasteScore] = useState(4.5);
  const [writeValueScore, setWriteValueScore] = useState(4.5);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [writerHeight, setWriterHeight] = useState(defaultWriterHeight);
  const dragStartHeight = useRef(defaultWriterHeight);
  const writerHeightRef = useRef(defaultWriterHeight);
  const { addNotification } = useNotifications();
  const authoredReviewIdsRef = useRef<Set<string>>(readAuthoredReviewIds());
  const knownCommentIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedServerReviewsRef = useRef(false);

  const visiblePosts = useMemo(
    () => posts.filter((post) => post.topic === activeTab),
    [activeTab, posts],
  );

  const writerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          dragStartHeight.current = writerHeightRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextHeight = clampNumber(dragStartHeight.current - gestureState.dy, minWriterHeight, maxWriterHeight);
          writerHeightRef.current = nextHeight;
          setWriterHeight(nextHeight);
        },
        onPanResponderRelease: (_, gestureState) => {
          const nextHeight = clampNumber(dragStartHeight.current - gestureState.dy, minWriterHeight, maxWriterHeight);
          writerHeightRef.current = nextHeight;
          setWriterHeight(nextHeight);
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [maxWriterHeight, minWriterHeight],
  );

  useEffect(() => {
    setWriterHeight((currentHeight) => {
      const nextHeight = clampNumber(currentHeight, minWriterHeight, maxWriterHeight);
      writerHeightRef.current = nextHeight;
      return nextHeight;
    });
  }, [maxWriterHeight, minWriterHeight]);

  const loadReviews = useCallback(async () => {
    try {
      const reviews = await fetchCommunityReviews();
      const nextKnownCommentIds = new Set<string>();

      if (hasLoadedServerReviewsRef.current) {
        reviews.forEach((review) => {
          if (!authoredReviewIdsRef.current.has(review.id)) {
            return;
          }

          review.comments.forEach((comment) => {
            nextKnownCommentIds.add(comment.id);

            if (knownCommentIdsRef.current.has(comment.id)) {
              return;
            }

            addNotification({
              type: "system",
              title: "내 글에 댓글이 달렸어요",
              message: `${review.title} · ${comment.body}`,
              target: {
                screen: "Community",
                params: {
                  tab: "음식 후기",
                  postId: review.id,
                },
              },
            });
          });
        });
      } else {
        reviews.forEach((review) => {
          review.comments.forEach((comment) => nextKnownCommentIds.add(comment.id));
        });
        hasLoadedServerReviewsRef.current = true;
      }

      knownCommentIdsRef.current = nextKnownCommentIds;
      setPosts([...reviews.map(mapReviewToPost), ...matePosts]);
      setServerError("");
    } catch {
      setServerError("서버 연결을 확인하고 있어요");
    }
  }, [addNotification]);

  useEffect(() => {
    loadReviews();
    const timerId = setInterval(loadReviews, 5000);
    return () => clearInterval(timerId);
  }, [loadReviews]);

  useEffect(() => {
    if (route.params?.tab) {
      setActiveTab(route.params.tab);
    }

    if (route.params?.postId) {
      setSelectedPostId(route.params.postId);
    }
  }, [route.params?.postId, route.params?.tab]);

  function openWriter() {
    writerHeightRef.current = defaultWriterHeight;
    setWriterHeight(defaultWriterHeight);
    setWriterOpen(true);
  }

  function closeWriter() {
    setWriterOpen(false);
    setWriteTitle("");
    setWriteBody("");
    setWriteImageUrl("");
    setWriteTasteScore(4.5);
    setWriteValueScore(4.5);
  }

  async function createPost() {
    const title = writeTitle.trim();
    const body = writeBody.trim();
    const imageUrl = writeImageUrl.trim();

    if (!title || !body) {
      return;
    }

    const optimisticPost: CommunityPostItem = {
      id: `pending-post-${Date.now()}`,
      topic: "음식 후기",
      title,
      body,
      meta: `맛 ${formatRating(writeTasteScore)} · 가성비 ${formatRating(writeValueScore)}`,
      createdAt: "방금",
      isMine: true,
      imageUrl: imageUrl || undefined,
      comments: [],
    };

    setPosts((currentPosts) => [optimisticPost, ...currentPosts].slice(0, maxLocalPosts));
    setActiveTab("음식 후기");
    setSelectedPostId(optimisticPost.id);
    closeWriter();

    try {
      const savedReview = await createCommunityReview({
        title,
        body,
        tasteScore: writeTasteScore,
        valueScore: writeValueScore,
        imageUrl: imageUrl || undefined,
      });
      const savedPost = mapReviewToPost(savedReview);
      authoredReviewIdsRef.current.add(savedPost.id);
      writeAuthoredReviewIds(authoredReviewIdsRef.current);
      setPosts((currentPosts) =>
        [savedPost, ...currentPosts.filter((post) => post.id !== optimisticPost.id)].slice(0, maxLocalPosts),
      );
      setSelectedPostId(savedPost.id);
      setServerError("");
    } catch {
      setServerError("글 저장에 실패했어요. 서버를 확인해주세요.");
    }
  }

  function updateCommentDraft(postId: string, value: string) {
    setCommentDrafts((currentDrafts) => ({
      ...currentDrafts,
      [postId]: value,
    }));
  }

  function selectTab(tab: CommunityTab) {
    setActiveTab(tab);
    setSelectedPostId(null);
    if (tab === "나랑 밥먹자") {
      setWriterOpen(false);
    }
  }

  async function addComment(postId: string) {
    const body = commentDrafts[postId]?.trim();

    if (!body) {
      return;
    }

    const optimisticComment: CommunityComment = {
      id: `${postId}-comment-${Date.now()}`,
      body,
      byAuthor: false,
      authorKey: "viewer",
      createdAt: "방금",
    };

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          comments: [...post.comments, optimisticComment].slice(-maxLocalComments),
        };
      }),
    );
    updateCommentDraft(postId, "");

    try {
      const savedReview = await createCommunityComment(postId, {
        body,
        anonymousKey: "viewer",
      });
      const savedPost = mapReviewToPost(savedReview);
      savedReview.comments.forEach((comment) => knownCommentIdsRef.current.add(comment.id));
      setPosts((currentPosts) => currentPosts.map((post) => (post.id === postId ? savedPost : post)));
      setServerError("");
    } catch {
      setServerError("댓글 저장에 실패했어요. 서버를 확인해주세요.");
    }
  }

  function changeTasteScore(delta: number) {
    setWriteTasteScore((currentScore) => clampRating(currentScore + delta));
  }

  function changeValueScore(delta: number) {
    setWriteValueScore((currentScore) => clampRating(currentScore + delta));
  }

  const renderPost = useCallback(
    ({ item: post }: { item: CommunityPostItem }) => (
      <PostCard
        post={post}
        commentDraft={commentDrafts[post.id] ?? ""}
        isExpanded={selectedPostId === post.id}
        onChangeComment={(value) => updateCommentDraft(post.id, value)}
        onSubmitComment={() => addComment(post.id)}
        onToggle={() => setSelectedPostId((currentId) => (currentId === post.id ? null : post.id))}
      />
    ),
    [commentDrafts, selectedPostId],
  );

  const listHeader = (
    <>
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => selectTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "나랑 밥먹자" ? (
        <View style={styles.matePanel}>
          <View style={styles.matePanelTop}>
            <View style={styles.mateSymbol}>
              <Text style={styles.mateSymbolText}>밥</Text>
            </View>
            <View style={styles.matePanelCopy}>
              <Text style={styles.mateEyebrow}>캠퍼스 식사 매칭</Text>
              <Text style={styles.panelTitle}>오늘 같이 먹을 사람 찾기</Text>
              <Text style={styles.panelDescription}>시간, 식당, 대화 주제를 정해서 부담 없는 한 끼 모임을 열 수 있어요.</Text>
            </View>
          </View>
          <View style={styles.mateFeatureRow}>
            <Text style={styles.mateFeature}>실명 없음</Text>
            <Text style={styles.mateFeature}>채팅방 연결</Text>
            <Text style={styles.mateFeature}>인원 마감</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("MealMate")}>
            <Text style={styles.primaryButtonText}>나랑 밥먹자 열기</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{activeTab}</Text>
          {activeTab === "음식 후기" ? <Text style={styles.liveCaption}>실시간 댓글 갱신 중</Text> : null}
        </View>
        <Text style={styles.sectionCount}>{visiblePosts.length}개</Text>
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
        data={visiblePosts}
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

      {writerOpen ? (
        <View style={[styles.writerSheet, { height: writerHeight }]}>
          <View style={styles.writerDragArea} {...writerPanResponder.panHandlers}>
            <View style={styles.writerHandle} />
          </View>
          <View style={styles.writerHeader}>
            <View>
              <Text style={styles.writerEyebrow}>커뮤니티 글쓰기</Text>
              <Text style={styles.writerTitle}>주제, 제목, 내용을 적어주세요</Text>
            </View>
            <Pressable hitSlop={8} onPress={closeWriter}>
              <Text style={styles.writerClose}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.writerScroll}
            contentContainerStyle={styles.writerScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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

            <View style={styles.ratingPanel}>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingTitle}>후기 점수</Text>
                <Text style={styles.ratingGuide}>0.5점 단위 · 5점 만점</Text>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>맛</Text>
                <View style={styles.ratingStepper}>
                  <Pressable
                    style={[styles.ratingButton, writeTasteScore <= minRating && styles.ratingButtonDisabled]}
                    onPress={() => changeTasteScore(-ratingStep)}
                  >
                    <Text style={styles.ratingButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.ratingValue}>{formatRating(writeTasteScore)}</Text>
                  <Pressable
                    style={[styles.ratingButton, writeTasteScore >= maxRating && styles.ratingButtonDisabled]}
                    onPress={() => changeTasteScore(ratingStep)}
                  >
                    <Text style={styles.ratingButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>가성비</Text>
                <View style={styles.ratingStepper}>
                  <Pressable
                    style={[styles.ratingButton, writeValueScore <= minRating && styles.ratingButtonDisabled]}
                    onPress={() => changeValueScore(-ratingStep)}
                  >
                    <Text style={styles.ratingButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.ratingValue}>{formatRating(writeValueScore)}</Text>
                  <Pressable
                    style={[styles.ratingButton, writeValueScore >= maxRating && styles.ratingButtonDisabled]}
                    onPress={() => changeValueScore(ratingStep)}
                  >
                    <Text style={styles.ratingButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>사진 첨부</Text>
            <TextInput
              value={writeImageUrl}
              onChangeText={setWriteImageUrl}
              placeholder="이미지 URL 붙여넣기"
              placeholderTextColor={colors.textSoft}
              style={styles.writerInput}
            />
            <View style={styles.imageAttachRow}>
              <Pressable
                style={styles.sampleImageButton}
                onPress={() =>
                  setWriteImageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80")
                }
              >
                <Text style={styles.sampleImageButtonText}>샘플 사진 첨부</Text>
              </Pressable>
              {writeImageUrl.trim() ? (
                <CachedRemoteImage uri={writeImageUrl.trim()} style={styles.writerThumbnail} />
              ) : null}
            </View>

            <Pressable
              style={[styles.submitButton, (!writeTitle.trim() || !writeBody.trim()) && styles.submitButtonDisabled]}
              onPress={createPost}
            >
              <Text style={styles.submitButtonText}>글 올리기</Text>
            </Pressable>
          </ScrollView>
        </View>
      ) : activeTab === "음식 후기" ? (
        <Pressable style={styles.writeDock} onPress={openWriter}>
          <View>
            <Text style={styles.writeDockEyebrow}>커뮤니티 글쓰기</Text>
            <Text style={styles.writeDockTitle}>새 글 올리기</Text>
          </View>
          <Text style={styles.writeDockAction}>글쓰기</Text>
        </Pressable>
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
    paddingBottom: 152,
    backgroundColor: colors.background,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    paddingVertical: 10,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  matePanelTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  mateSymbol: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "#edf6fc",
    borderWidth: 1,
    borderColor: "#d5edf8",
  },
  mateSymbolText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  matePanelCopy: {
    flex: 1,
    minWidth: 0,
  },
  mateEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  panelTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 27,
  },
  panelDescription: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 20,
  },
  mateFeatureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },
  mateFeature: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f4fbfe",
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
  },
  primaryButton: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
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
  liveCaption: {
    marginTop: 3,
    color: colors.primary,
    fontSize: 11,
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
    color: "#b45309",
    fontSize: 12,
    fontWeight: "900",
  },
  postCard: {
    marginBottom: 12,
    padding: 13,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  postSummary: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 74,
  },
  postSummaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  postSideMeta: {
    alignItems: "flex-end",
    minWidth: 54,
  },
  postTopicPill: {
    alignSelf: "flex-start",
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
  postThumbnail: {
    width: 48,
    height: 40,
    marginTop: 7,
    borderRadius: 12,
    backgroundColor: "#edf6fc",
  },
  expandHint: {
    overflow: "hidden",
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#edf6fc",
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900",
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
  postDetail: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2f0f7",
  },
  postBody: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  postDetailImage: {
    width: "100%",
    height: 150,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#edf6fc",
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
    left: 14,
    right: 14,
    bottom: 14,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 13,
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
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  writerDragArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 10,
  },
  writerHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
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
  writerScroll: {
    flex: 1,
  },
  writerScrollContent: {
    paddingBottom: 4,
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
  ratingPanel: {
    marginTop: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#f7fbfe",
    borderWidth: 1,
    borderColor: "#d7edf7",
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  ratingTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  ratingGuide: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 42,
  },
  ratingLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  ratingStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  ratingButtonDisabled: {
    backgroundColor: "#bdd7ea",
  },
  ratingButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },
  ratingValue: {
    width: 38,
    textAlign: "center",
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  imageAttachRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 9,
  },
  sampleImageButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    borderRadius: 16,
    backgroundColor: "#edf6fc",
    borderWidth: 1,
    borderColor: "#d7edf7",
  },
  sampleImageButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  writerThumbnail: {
    width: 52,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#edf6fc",
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
