export type CommunityTab = "음식 후기" | "나랑 밥먹자";

type CommunityComment = {
  id: string;
  body: string;
  byAuthor: boolean;
  authorKey: string;
  authorLabel?: string;
  createdAt: string;
};

export type CommunityPostItem = {
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

export const previewCommunityPosts: CommunityPostItem[] = [
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
