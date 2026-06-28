import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  RestaurantList: undefined;
  Community: undefined;
  Recommendation: undefined;
  RestaurantDetail: { restaurantId: string };
  MenuDetail: { menuId: string };
  CampusMap: { buildingId?: string } | undefined;
  MealMate: undefined;
  MealMateChat: {
    room: MealMateChatRoom;
  };
  Notifications: undefined;
  Cart: undefined;
  Payment: { orderItems?: OrderItem[] } | undefined;
  OrderComplete: { order: CompletedOrder };
};

export type AppScreenProps<RouteName extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  RouteName
>;

export type FoodCategory =
  | "전체"
  | "한식"
  | "중식"
  | "일식"
  | "양식"
  | "분식"
  | "패스트푸드"
  | "카페"
  | "가성비"
  | "혼밥"
  | "도시락"
  | string;

export type MenuOption = {
  id: string;
  name: string;
  price: number;
};

export type Restaurant = {
  id: string;
  name: string;
  category: string;
  rating: number;
  tasteScore: number;
  portionScore: number;
  valueScore: number;
  imageUrl: string;
  location: string;
  phone: string;
  openingHours: string;
  isOpen: boolean;
  reviewSummary: string;
  description: string;
};

export type Menu = {
  id: string;
  restaurantId: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  tags: string[];
  description: string;
  recommendationText: string;
  tasteScore: number;
  portionScore: number;
  valueScore: number;
  options: MenuOption[];
};

export type Building = {
  id: string;
  name: string;
  position: {
    left: string;
    top: string;
  };
  restaurants: CampusBuildingRestaurant[];
};

export type CampusBuildingRestaurant = {
  restaurantId: string;
  label: string;
  hours: string;
};

export type TodayCafeteria = {
  title: string;
  restaurantId: string;
  restaurantName: string;
  price: number;
  servingTime: string;
  menuItems: string[];
  statusText: string;
};

export type RankedRestaurant = {
  restaurantId: string;
  rank: number;
  selectedCount: number;
};

export type PopularMenu = {
  menuId: string;
  restaurantId: string;
  name: string;
};

export type CongestionLevel = "원활" | "보통" | "혼잡" | "매우 혼잡";

export type CongestionItem = {
  restaurantId: string;
  name: string;
  activeStudents: number;
  level: CongestionLevel;
  description: string;
};

export type MealMateRoom = {
  id: string;
  title: string;
  restaurantId: string;
  restaurantName: string;
  topic: string;
  time: string;
  maxPeople: number;
  currentPeople: number;
  note: string;
};

export type MealMateChatRoom = {
  id?: string;
  title: string;
  topic: string;
  time: string;
  members: number;
  maxCount: number;
};

export type MealMatePost = {
  id: string;
  restaurantId: string;
  time: string;
  topic: string;
  currentCount: number;
  maxCount: number;
  note: string;
  createdBy: string;
};

export type RecommendationOption = {
  id: string;
  label: string;
  tags: string[];
};

export type RecommendationStep = {
  id: string;
  title: string;
  subtitle: string;
  options: RecommendationOption[];
};

export type CommunityPost = {
  id: string;
  board: "review" | "free";
  title: string;
  body: string;
  author: string;
  meta: string;
};

export type OrderItem = {
  cartId?: string;
  menuId: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  selectedOptions: MenuOption[];
};

export type CartItem = OrderItem & {
  cartId: string;
};

export type CompletedOrder = {
  orderNumber: string;
  orderItems: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
  estimatedMinutes: number;
  paidAt: string;
};

export type CampusNotification = {
  id: string;
  type: "order" | "mate" | "system";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

export type SearchResult = {
  id: string;
  type: "restaurant" | "menu";
  title: string;
  subtitle: string;
  imageUrl: string;
  targetId: string;
  price?: number;
};

export type WithRestaurant<T> = T & {
  restaurant: Restaurant;
};

export type RecommendedMenu = Menu & {
  matchedTags: string[];
  recommendationReason: string;
  matchScore: number;
};

export type RecommendationResult = {
  primary: RecommendedMenu | null;
  alternatives: RecommendedMenu[];
  matchedTags: string[];
  confidence: "high" | "medium" | "low";
  reason: string;
};
