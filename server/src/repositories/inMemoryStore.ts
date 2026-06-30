import { mealMateRooms, menus, restaurants, reviews } from "../data/seed.js";
import type { MealMateRoom, Menu, Order, Restaurant, Review } from "../types.js";

const maxReviews = 100;
const maxMealMateRooms = 100;
const maxOrders = 200;

const state = {
  restaurants: [...restaurants],
  menus: [...menus],
  reviews: [...reviews],
  mealMateRooms: [...mealMateRooms],
  orders: [] as Order[],
};

export const store = {
  listRestaurants(): Restaurant[] {
    return state.restaurants;
  },

  getRestaurant(id: string): Restaurant | undefined {
    return state.restaurants.find((restaurant) => restaurant.id === id);
  },

  listMenus(filters?: { restaurantId?: string; category?: string; query?: string }): Menu[] {
    const query = filters?.query?.trim().toLowerCase();

    return state.menus.filter((menu) => {
      if (filters?.restaurantId && menu.restaurantId !== filters.restaurantId) {
        return false;
      }

      if (filters?.category && filters.category !== "전체" && menu.category !== filters.category) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [menu.name, menu.category, menu.description, menu.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  },

  getMenu(id: string): Menu | undefined {
    return state.menus.find((menu) => menu.id === id);
  },

  listReviews(): Review[] {
    return state.reviews;
  },

  addReview(review: Review): Review {
    state.reviews = [review, ...state.reviews].slice(0, maxReviews);
    return review;
  },

  listMealMateRooms(): MealMateRoom[] {
    return state.mealMateRooms;
  },

  addMealMateRoom(room: MealMateRoom): MealMateRoom {
    state.mealMateRooms = [room, ...state.mealMateRooms].slice(0, maxMealMateRooms);
    return room;
  },

  addOrder(order: Order): Order {
    state.orders = [order, ...state.orders].slice(0, maxOrders);
    return order;
  },

  listOrders(): Order[] {
    return state.orders;
  },
};
