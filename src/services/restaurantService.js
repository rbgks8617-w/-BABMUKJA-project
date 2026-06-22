import { menus, restaurants, university } from "../data/dummyData";

export function getUniversity() {
  return university;
}

export function getRestaurants() {
  return restaurants;
}

export function getRestaurantById(restaurantId) {
  return restaurants.find((restaurant) => restaurant.id === restaurantId);
}

export function getMenusByRestaurantId(restaurantId) {
  return menus.filter((menu) => menu.restaurantId === restaurantId);
}

export function getMenuById(menuId) {
  return menus.find((menu) => menu.id === menuId);
}
