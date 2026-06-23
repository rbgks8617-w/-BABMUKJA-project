import {
  friendCheckins,
  mealMatePosts,
  mealMateTopics,
  menus,
  popularRestaurants,
  recommendationTree,
  restaurants,
  todayCafeteria,
  university,
} from "../data/dummyData";

const restaurantOverrides = {
  "tomato-gimbap": {
    name: "토마토김밥",
    category: "분식",
    location: "기술혁신파크(TIP) 푸드코트",
  },
  "hans-omelet": {
    name: "한스오믈렛",
    category: "양식",
    location: "기술혁신파크(TIP) 푸드코트",
  },
  "shin-bukgyeong": {
    name: "신북경",
    category: "중식",
    location: "기술혁신파크(TIP) 푸드코트",
  },
  "moms-touch": {
    name: "맘스터치",
    category: "패스트푸드",
    location: "기술혁신파크(TIP) 푸드코트",
  },
  "raon-restaurant": {
    name: "라온식당",
    category: "한식",
    location: "종합교육관 1층",
    description: "종합교육관 근처에서 찌개, 덮밥, 분식류를 먹기 좋은 식당입니다.",
  },
  "tomato-dosirak": {
    name: "토마토도시락",
    category: "도시락",
    location: "산학융합관 푸드코트",
  },
};

const extraRestaurants = [
  {
    id: "shin-bukgyeong-maratang",
    name: "신북경마라탕",
    category: "마라탕",
    rating: 4.4,
    tasteScore: 4.5,
    portionScore: 4.3,
    valueScore: 4.2,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
    location: "기술혁신파크(TIP) 푸드코트",
    phone: "031-000-0018",
    openingHours: "10:30 - 19:30",
    isOpen: true,
    reviewSummary: "매운 국물과 원하는 재료를 고르는 재미가 있는 TIP 인기 메뉴입니다.",
    description: "신북경 계열의 마라탕 매장입니다. 수업 사이 든든하게 먹기 좋아요.",
  },
  {
    id: "nadri-gimbap",
    name: "나드리김밥",
    category: "분식",
    rating: 4.2,
    tasteScore: 4.1,
    portionScore: 4.2,
    valueScore: 4.4,
    imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
    location: "산학융합관 푸드코트",
    phone: "031-000-0019",
    openingHours: "10:00 - 19:00",
    isOpen: true,
    reviewSummary: "김밥, 라면, 분식류를 빠르게 먹기 좋은 산학융합관 식당입니다.",
    description: "간단한 한 끼나 수업 전후 빠른 식사를 찾을 때 좋은 분식 매장입니다.",
  },
];

const extraMenus = [
  {
    id: "menu-maratang-1",
    restaurantId: "shin-bukgyeong-maratang",
    name: "마라탕 기본",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
    price: 8500,
    category: "중식",
    tags: ["매워", "국물", "든든", "공유"],
    description: "원하는 재료와 매운맛을 골라 먹는 마라탕 메뉴입니다.",
    recommendationText: "얼큰한 국물이 당길 때 신북경마라탕이 잘 맞아요.",
    options: [
      { id: "maratang-option-1", name: "매운맛 1단계", price: 0 },
      { id: "maratang-option-2", name: "고기 추가", price: 2000 },
    ],
  },
  {
    id: "menu-nadri-1",
    restaurantId: "nadri-gimbap",
    name: "나드리김밥",
    imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
    price: 4500,
    category: "분식",
    tags: ["빠른", "가벼운", "밥", "가성비"],
    description: "수업 사이 빠르게 먹기 좋은 기본 김밥입니다.",
    recommendationText: "가볍고 빠른 한 끼가 필요하면 나드리김밥이 좋아요.",
    options: [
      { id: "nadri-option-1", name: "단무지 추가", price: 300 },
      { id: "nadri-option-2", name: "라면 세트", price: 3000 },
    ],
  },
];

const hiddenRestaurantIds = new Set(["student-cafeteria", "suho-restaurant", "cafe-ing", "tospia", "coffee-bay"]);

const livePopularRestaurants = [
  { restaurantId: "moms-touch", rank: 1, selectedCount: 42 },
  { restaurantId: "shin-bukgyeong-maratang", rank: 2, selectedCount: 38 },
  { restaurantId: "tomato-gimbap", rank: 3, selectedCount: 31 },
];

const liveFriendCheckins = [
  { restaurantId: "moms-touch", studentCount: 18 },
  { restaurantId: "raon-restaurant", studentCount: 13 },
  { restaurantId: "tomato-dosirak", studentCount: 9 },
];

export const campusMapBuildings = [
  {
    id: "tip",
    name: "TIP",
    position: { left: "14%", top: "30%" },
    restaurants: [
      { restaurantId: "shin-bukgyeong-maratang", label: "신북경마라탕", hours: "10:30 - 19:30" },
      { restaurantId: "tomato-gimbap", label: "토마토김밥", hours: "10:00 - 19:00" },
      { restaurantId: "hans-omelet", label: "한스오믈렛", hours: "10:30 - 19:00" },
      { restaurantId: "moms-touch", label: "맘스터치", hours: "10:00 - 20:00" },
      { restaurantId: "shin-bukgyeong", label: "신북경", hours: "10:30 - 19:30" },
    ],
  },
  {
    id: "education",
    name: "종합교육관",
    position: { left: "42%", top: "20%" },
    restaurants: [
      { restaurantId: "raon-restaurant", label: "라온 식당", hours: "11:00 - 19:00" },
    ],
  },
  {
    id: "industry",
    name: "산학융합관",
    position: { left: "73%", top: "34%" },
    restaurants: [
      { restaurantId: "tomato-dosirak", label: "토마토도시락", hours: "10:00 - 19:00" },
      { restaurantId: "nadri-gimbap", label: "나드리김밥", hours: "10:00 - 19:00" },
    ],
  },
];

function normalizeRestaurant(restaurant) {
  const override = restaurantOverrides[restaurant.id] ?? {};

  return {
    ...restaurant,
    ...override,
  };
}

function getVisibleMenus() {
  return [...menus, ...extraMenus].filter((menu) => !hiddenRestaurantIds.has(menu.restaurantId));
}

export function getUniversity() {
  return university;
}

export function getRestaurants() {
  return [...restaurants, ...extraRestaurants].filter((restaurant) => !hiddenRestaurantIds.has(restaurant.id)).map(normalizeRestaurant);
}

export function getTodayCafeteria() {
  return todayCafeteria;
}

export function getPopularRestaurants() {
  return livePopularRestaurants.map((item) => ({
    ...item,
    restaurant: getRestaurantById(item.restaurantId),
  }));
}

export function getFriendCheckins() {
  return liveFriendCheckins.map((item) => ({
    ...item,
    restaurant: getRestaurantById(item.restaurantId),
  }));
}

export function getMealMateTopics() {
  return mealMateTopics;
}

export function getMealMatePosts() {
  return mealMatePosts
    .filter((post) => post.currentCount < post.maxCount)
    .map((post) => ({
      ...post,
      restaurant: getRestaurantById(post.restaurantId),
    }))
    .filter((post) => post.restaurant);
}

export function getRecommendationTree() {
  return recommendationTree;
}

export function getRestaurantById(restaurantId) {
  const restaurant = [...restaurants, ...extraRestaurants].find((item) => item.id === restaurantId);

  if (!restaurant || hiddenRestaurantIds.has(restaurant.id)) {
    return undefined;
  }

  return normalizeRestaurant(restaurant);
}

export function getRestaurantNameById(restaurantId) {
  return getRestaurantById(restaurantId)?.name ?? "알 수 없는 식당";
}

export function getMenusByRestaurantId(restaurantId) {
  if (hiddenRestaurantIds.has(restaurantId)) {
    return [];
  }

  return getVisibleMenus().filter((menu) => menu.restaurantId === restaurantId);
}

export function getMenuById(menuId) {
  const menu = getVisibleMenus().find((item) => item.id === menuId);

  if (!menu || hiddenRestaurantIds.has(menu.restaurantId)) {
    return undefined;
  }

  return menu;
}

export function getRecommendedMenuByTags(selectedTags) {
  return getRecommendedMenuResult(selectedTags).primary;
}

export function getRecommendedMenuResult(selectedTags) {
  const scoredMenus = getScoredMenus(selectedTags);
  const fallbackMenus = getVisibleMenus().map((menu) => ({
    menu,
    score: 0,
    matchedTags: [],
    reason: "오늘은 새로운 메뉴를 가볍게 시도해봐도 좋아요.",
  }));
  const candidates = scoredMenus.length > 0 ? scoredMenus : fallbackMenus;
  const primary = pickWeighted(candidates);
  const alternatives = candidates
    .filter((item) => item.menu.id !== primary?.menu.id)
    .slice(0, 3)
    .map((item) => ({
      ...item.menu,
      matchedTags: item.matchedTags,
      recommendationReason: item.reason,
      matchScore: item.score,
    }));

  if (!primary) {
    return {
      primary: null,
      alternatives: [],
      matchedTags: [],
      confidence: "low",
      reason: "추천할 수 있는 메뉴가 아직 없어요.",
    };
  }

  return {
    primary: {
      ...primary.menu,
      matchedTags: primary.matchedTags,
      recommendationReason: primary.reason,
      matchScore: primary.score,
    },
    alternatives,
    matchedTags: primary.matchedTags,
    confidence: primary.score >= 3 ? "high" : primary.score >= 2 ? "medium" : "low",
    reason: primary.reason,
  };
}

function getScoredMenus(selectedTags) {
  const normalizedTags = [...new Set(selectedTags)];

  if (normalizedTags.length === 0) {
    return [];
  }

  return getVisibleMenus()
    .map((menu) => ({
      menu,
      matchedTags: normalizedTags.filter((tag) => getMenuRecommendationTags(menu).includes(tag)),
    }))
    .map((item) => ({
      ...item,
      score: item.matchedTags.length,
      reason: buildRecommendationReason(item.menu, item.matchedTags),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.menu.price - b.menu.price);
}

function getMenuRecommendationTags(menu) {
  const priceTags = [];
  if (menu.price <= 5500) {
    priceTags.push("저렴");
  }
  if (menu.price <= 7500) {
    priceTags.push("보통");
  }
  if (menu.price >= 7000) {
    priceTags.push("든든");
  }

  return [...menu.tags, ...priceTags];
}

function buildRecommendationReason(menu, matchedTags) {
  if (matchedTags.length === 0) {
    return menu.recommendationText;
  }

  const tags = matchedTags.slice(0, 3).join(", ");
  return `${tags} 조건에 잘 맞아서 추천해요. ${menu.recommendationText}`;
}

function pickWeighted(scoredItems) {
  if (scoredItems.length === 0) {
    return null;
  }

  const topScore = scoredItems[0].score;
  const topGroup = scoredItems.filter((item) => item.score === topScore);
  return pickRandom(topGroup);
}

function pickRandom(items) {
  if (items.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}
