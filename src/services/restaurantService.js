import { menus, recommendationTree, restaurants, university } from "../data/dummyData";

export function getUniversity() {
  return university;
}

export function getRestaurants() {
  return restaurants;
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
  if (selectedTags.length === 0) {
    return pickRandom(menus);
  }

  const scoredMenus = menus
    .map((menu) => ({
      menu,
      score: selectedTags.filter((tag) => menu.tags.includes(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scoredMenus.length === 0) {
    return pickRandom(menus);
  }

  const bestScore = scoredMenus[0].score;
  const bestMatches = scoredMenus.filter((item) => item.score === bestScore).map((item) => item.menu);
  return pickRandom(bestMatches);
}

function pickRandom(items) {
  if (items.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}
