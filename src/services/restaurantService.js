import {
  friendCheckins,
  menus,
  popularRestaurants,
  recommendationTree,
  restaurants,
  todayCafeteria,
  university,
} from "../data/dummyData";

export function getUniversity() {
  return university;
}

export function getRestaurants() {
  return restaurants;
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

export function getRecommendationTree() {
  return recommendationTree;
}

export function getRestaurantById(restaurantId) {
  return restaurants.find((restaurant) => restaurant.id === restaurantId);
}

export function getRestaurantNameById(restaurantId) {
  return getRestaurantById(restaurantId)?.name ?? "알 수 없는 식당";
}

export function getMenusByRestaurantId(restaurantId) {
  return menus.filter((menu) => menu.restaurantId === restaurantId);
}

export function getMenuById(menuId) {
  return menus.find((menu) => menu.id === menuId);
}

export function getRecommendedMenuByTags(selectedTags) {
  return getRecommendedMenuResult(selectedTags).primary;
}

export function getRecommendedMenuResult(selectedTags) {
  const scoredMenus = getScoredMenus(selectedTags);
  const fallbackMenus = menus.map((menu) => ({
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

  return menus
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
