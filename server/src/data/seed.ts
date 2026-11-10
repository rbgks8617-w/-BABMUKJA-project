import { campusRestaurants } from "./campusRestaurants.js";
import type { MealMateRoom, Menu, Restaurant, Review } from "../types.js";

export const restaurants: Restaurant[] = campusRestaurants.map(
  ({ id, name, building, category, location, description, imageUrl }) => ({
    id, name, building, category, location, description, imageUrl,
  }),
);

export const menus: Menu[] = [
  {
    id: "maratang",
    restaurantId: "shin-bukgyeong-maratang",
    name: "마라탕",
    category: "중식",
    price: 7000,
    description: "공강 시간에 빠르게 먹기 좋은 매콤한 마라탕",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
    tags: ["매운맛", "혼밥", "인기"],
  },
  {
    id: "tuna-gimbap",
    restaurantId: "tomato-gimbap",
    name: "참치김밥",
    category: "분식",
    price: 4500,
    description: "간단하게 먹기 좋은 기본 인기 메뉴",
    imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
    tags: ["가성비", "간편식"],
  },
  {
    id: "kimchi-stew",
    restaurantId: "raon-restaurant",
    name: "돼지고기김치찌개",
    category: "한식",
    price: 4500,
    description: "오늘 학식 대표 메뉴로 어울리는 한식",
    imageUrl: "https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=900&q=80",
    tags: ["학식", "든든함"],
  },
];

export const reviews: Review[] = [
  {
    id: "review-1",
    title: "맘스터치 싸이버거 세트 든든함",
    body: "공강 짧을 때 빨리 먹기 좋고 양도 괜찮아요.",
    tasteScore: 4.5,
    valueScore: 4,
    createdAt: new Date().toISOString(),
    comments: [],
  },
];

export const mealMateRooms: MealMateRoom[] = [
  {
    id: "mate-1",
    restaurantId: "raon-restaurant",
    time: "12:30",
    topic: "공강 때 뭐 하는지",
    note: "처음 보는 사람이어도 편하게 밥 먹고 흩어지는 모임이에요.",
    currentCount: 2,
    maxCount: 4,
    createdAt: new Date().toISOString(),
  },
];
