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
  "student-cafeteria": {
    name: "학생식당",
    category: "학식",
    location: "기술혁신파크(TIP) B1층",
    openingHours: "08:00 - 19:00",
    description: "TIP 지하에 있는 대표 학식 공간입니다. 빠르게 한 끼 해결하기 좋아요.",
  },
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
  "suho-restaurant": {
    name: "수호식당",
    category: "한식",
    location: "종합교육관 1층",
  },
  "raon-restaurant": {
    name: "라온식당",
    category: "한식",
    location: "종합교육관 1층",
    description: "종합교육관 근처에서 찌개, 덮밥, 분식류를 먹기 좋은 식당입니다.",
  },
  "cafe-ing": {
    name: "cafe ing",
    category: "카페",
    location: "기술혁신파크(TIP) 1층",
  },
  tospia: {
    name: "토스피아(Tospia)",
    category: "토스트/카페",
    location: "기술혁신파크(TIP) 1층",
  },
  "coffee-bay": {
    name: "커피베이",
    category: "카페",
    location: "산학융합본부 1층",
  },
  "tomato-dosirak": {
    name: "토마토도시락",
    category: "도시락",
    location: "산학융합본부 푸드코트",
  },
};

const hiddenRestaurantIds = new Set();

export const campusMapBuildings = [
  {
    id: "tip",
    name: "기술혁신파크(TIP)",
    position: { left: "14%", top: "30%" },
    restaurants: [
      { restaurantId: "student-cafeteria", label: "학생식당", hours: "08:00 - 19:00" },
      { restaurantId: "tomato-gimbap", label: "토마토김밥", hours: "10:00 - 19:00" },
      { restaurantId: "moms-touch", label: "맘스터치", hours: "10:00 - 20:00" },
    ],
  },
  {
    id: "education",
    name: "종합교육관",
    position: { left: "42%", top: "20%" },
    restaurants: [
      { restaurantId: "suho-restaurant", label: "수호식당", hours: "11:30 - 14:00" },
      { restaurantId: "raon-restaurant", label: "라온식당", hours: "11:00 - 19:00" },
      { restaurantId: "cafe-ing", label: "cafe ing", hours: "09:00 - 20:00" },
    ],
  },
  {
    id: "industry",
    name: "산학융합본부",
    position: { left: "73%", top: "34%" },
    restaurants: [
      { restaurantId: "coffee-bay", label: "커피베이", hours: "09:00 - 20:00" },
      { restaurantId: "tomato-dosirak", label: "토마토도시락", hours: "10:00 - 19:00" },
      { restaurantId: "shin-bukgyeong", label: "신북경", hours: "10:30 - 19:30" },
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
  return menus.filter((menu) => !hiddenRestaurantIds.has(menu.restaurantId));
}

export function getUniversity() {
  return university;
}

export function getRestaurants() {
  return restaurants.filter((restaurant) => !hiddenRestaurantIds.has(restaurant.id)).map(normalizeRestaurant);
}

export function getTodayCafeteria() {
  return todayCafeteria;
}

export function getPopularRestaurants() {
  return popularRestaurants.map((item) => ({
    ...item,
    restaurant: getRestaurantById(item.restaurantId),
  }));
}

export function getFriendCheckins() {
  return friendCheckins.map((item) => ({
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
    }));
}

export function getRecommendationTree() {
  return recommendationTree;
}

export function getRestaurantById(restaurantId) {
  const restaurant = restaurants.find((item) => item.id === restaurantId);

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

  return menus.filter((menu) => menu.restaurantId === restaurantId);
}

export function getMenuById(menuId) {
  const menu = menus.find((item) => item.id === menuId);

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
