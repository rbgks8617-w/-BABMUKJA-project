import {
  campusMapBuildings,
  mealMatePosts,
  menus,
  popularRestaurants,
  recommendationTree,
  restaurants,
  todayCafeteria,
} from "../data/campusData";
import type {
  Building,
  CongestionLevel,
  MealMatePost,
  Menu,
  RecommendedMenu,
  RecommendationResult,
  Restaurant,
  SearchResult,
} from "../types/app";

export { campusMapBuildings };

const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
const menuById = new Map(menus.map((menu) => [menu.id, menu]));

type RestaurantAttached<T> = T & { restaurant: Restaurant };
type ScoredMenu = {
  menu: Menu;
  score: number;
  matchedTags: string[];
  reason: string;
};

type CrowdPick = (typeof quickPickConfigs)[number] & {
  restaurant: Restaurant;
  status: CongestionLevel;
};

type PopularMenuPick = (typeof popularMenuConfigs)[number] & {
  menu: Menu;
  restaurant: Restaurant;
};

const quickPickConfigs = [
  {
    restaurantId: "tomato-gimbap",
    recentUsers: 11,
    reason: "김밥, 라면처럼 회전이 빠른 메뉴가 많아요.",
  },
  {
    restaurantId: "tomato-dosirak",
    recentUsers: 16,
    reason: "포장해서 바로 이동하기 좋아요.",
  },
  {
    restaurantId: "raon-restaurant",
    recentUsers: 28,
    reason: "종합교육관 수업 전후 동선이 짧아요.",
  },
];

const popularMenuConfigs = [
  { menuId: "menu-cyburger", rank: 1 },
  { menuId: "menu-maratang", rank: 2 },
  { menuId: "menu-tomato-gimbap", rank: 3 },
];

export function getRestaurants(): Restaurant[] {
  return restaurants;
}

export function getRestaurantById(restaurantId: string): Restaurant | undefined {
  return restaurantById.get(restaurantId);
}

export function getRestaurantNameById(restaurantId: string): string {
  return getRestaurantById(restaurantId)?.name ?? "알 수 없는 식당";
}

export function getTodayCafeteria() {
  return todayCafeteria;
}

export function getPopularRestaurants() {
  return attachRestaurants(popularRestaurants);
}

export function getCrowdPicks() {
  return quickPickConfigs
    .map((item) => ({
      ...item,
      restaurant: getRestaurantById(item.restaurantId),
      status: getCrowdStatus(item.recentUsers),
    }))
    .filter((item): item is CrowdPick => Boolean(item.restaurant));
}

export function getPopularMenus(): PopularMenuPick[] {
  return popularMenuConfigs
    .map((item) => {
      const menu = getMenuById(item.menuId);
      return {
        ...item,
        menu,
        restaurant: menu ? getRestaurantById(menu.restaurantId) : undefined,
      };
    })
    .filter((item): item is PopularMenuPick => Boolean(item.menu && item.restaurant));
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

export function getMenuById(menuId: string): Menu | undefined {
  return menuById.get(menuId);
}

export function getMenusByRestaurantId(restaurantId: string): Menu[] {
  return menus.filter((menu) => menu.restaurantId === restaurantId);
}

export function getMenusByCategory(category: string) {
  return menus
    .filter((menu) => matchesCategory(menu, category))
    .slice(0, 8)
    .map((menu) => ({
      ...menu,
      restaurant: getRestaurantById(menu.restaurantId),
    }));
}

export function searchCampusFood(query: string): SearchResult[] {
  const keyword = normalizeKeyword(query);

  if (!keyword) {
    return [];
  }

  const restaurantResults = restaurants
    .filter((restaurant) => {
      return [restaurant.name, restaurant.category, restaurant.location, restaurant.description]
        .filter(Boolean)
        .some((value) => normalizeKeyword(value).includes(keyword));
    })
    .map((restaurant) => ({
      id: `restaurant-${restaurant.id}`,
      type: "restaurant" as const,
      title: restaurant.name,
      subtitle: `${restaurant.category} · ${restaurant.location}`,
      imageUrl: restaurant.imageUrl,
      targetId: restaurant.id,
    }));

  const menuResults = menus
    .filter((menu) => {
      const restaurant = getRestaurantById(menu.restaurantId);
      return [menu.name, menu.category, menu.description, restaurant?.name, ...(menu.tags ?? [])]
        .filter(Boolean)
        .some((value) => normalizeKeyword(value).includes(keyword));
    })
    .map((menu) => {
      const restaurant = getRestaurantById(menu.restaurantId);
      return {
        id: `menu-${menu.id}`,
        type: "menu" as const,
        title: menu.name,
        subtitle: `${restaurant?.name ?? "학교 식당"} · ${menu.category}`,
        imageUrl: menu.imageUrl,
        price: menu.price,
        targetId: menu.id,
      };
    });

  return [...restaurantResults, ...menuResults].slice(0, 8);
}

export function getRestaurantCount(): number {
  return campusMapBuildings.reduce((count, building) => count + building.restaurants.length, 0);
}

export function getBuildingCards() {
  return campusMapBuildings.map((building, index) => {
    const buildingRestaurants = building.restaurants.map((item) => ({
      ...item,
      restaurant: getRestaurantById(item.restaurantId),
    }));
    const firstRestaurant = buildingRestaurants.find((item) => item.restaurant)?.restaurant;

    return {
      ...building,
      index: index + 1,
      displayName: building.name,
      imageUrl: firstRestaurant?.imageUrl,
      menuPreview: buildingRestaurants.map((item) => item.label).slice(0, 3).join(", "),
      walkText: index === 0 ? "도보 5분" : index === 1 ? "도보 3분" : "도보 7분",
      crowdText: index === 1 ? "원활 · 최근 8명" : index === 2 ? "보통 · 최근 16명" : "혼잡 · 최근 28명",
      restaurants: buildingRestaurants,
    };
  });
}

export function getRecommendedMenuByTags(selectedTags: string[]): RecommendedMenu | null {
  return getRecommendedMenuResult(selectedTags).primary;
}

export function getRecommendedMenuResult(selectedTags: string[]): RecommendationResult {
  const scoredMenus = getScoredMenus(selectedTags);
  const fallbackMenus = menus.map((menu) => ({
    menu,
    score: 0,
    matchedTags: [],
    reason: "오늘은 새로운 메뉴를 가볍게 시도해도 좋아요.",
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

function attachRestaurants<T extends { restaurantId: string }>(items: T[]): RestaurantAttached<T>[] {
  return items
    .map((item) => ({
      ...item,
      restaurant: getRestaurantById(item.restaurantId),
    }))
    .filter((item): item is RestaurantAttached<T> => Boolean(item.restaurant));
}

export function getCrowdStatus(recentUsers: number): CongestionLevel {
  if (recentUsers >= 34) {
    return "매우 혼잡";
  }

  if (recentUsers >= 26) {
    return "혼잡";
  }

  if (recentUsers >= 15) {
    return "보통";
  }

  return "원활";
}

function matchesCategory(menu: Menu, category: string) {
  if (category === "전체") {
    return true;
  }

  if (category === "카페") {
    return menu.category.includes("카페") || menu.tags.includes("음료") || menu.tags.includes("디저트");
  }

  if (category === "가성비") {
    return menu.price <= 6500 || menu.tags.includes("가성비");
  }

  if (category === "혼밥") {
    return menu.tags.includes("혼밥") || menu.tags.includes("빠른") || menu.price <= 8000;
  }

  return menu.category === category;
}

function normalizeKeyword(value: unknown) {
  return String(value ?? "").replace(/\s+/g, "").toLowerCase();
}

function getScoredMenus(selectedTags: string[]): ScoredMenu[] {
  const normalizedTags = [...new Set(selectedTags)];

  if (normalizedTags.length === 0) {
    return menus.map((menu) => ({
      menu,
      score: 1,
      matchedTags: [],
      reason: menu.recommendationText,
    }));
  }

  return menus
    .map((menu) => {
      const matchedTags = normalizedTags.filter((tag) => getMenuRecommendationTags(menu).includes(tag));
      return {
        menu,
        score: matchedTags.length,
        matchedTags,
        reason: buildRecommendationReason(menu, matchedTags),
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.menu.price - b.menu.price);
}

function getMenuRecommendationTags(menu: Menu): string[] {
  const priceTags: string[] = [];

  if (menu.price <= 5500) {
    priceTags.push("저렴", "가성비");
  }
  if (menu.price <= 7500) {
    priceTags.push("보통");
  }
  if (menu.price >= 7000) {
    priceTags.push("든든");
  }

  return [...menu.tags, ...priceTags];
}

function buildRecommendationReason(menu: Menu, matchedTags: string[]): string {
  if (matchedTags.length === 0) {
    return menu.recommendationText;
  }

  return `${matchedTags.join(", ")} 조건에 잘 맞아서 추천해요. ${menu.recommendationText}`;
}

function pickWeighted(scoredItems: ScoredMenu[]): ScoredMenu | undefined {
  if (scoredItems.length <= 1) {
    return scoredItems[0];
  }

  const topScore = scoredItems[0].score;
  const topItems = scoredItems.filter((item) => item.score === topScore);
  return pickRandom(topItems);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
