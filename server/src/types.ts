export type Restaurant = {
  id: string;
  name: string;
  building: string;
  category: string;
  location: string;
  description: string;
  imageUrl: string;
};

export type Menu = {
  id: string;
  restaurantId: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  tags: string[];
};

export type Review = {
  id: string;
  title: string;
  body: string;
  tasteScore: number;
  valueScore: number;
  imageUrl?: string;
  createdAt: string;
  comments: Comment[];
};

export type Comment = {
  id: string;
  body: string;
  anonymousKey: string;
  createdAt: string;
};

export type MealMateRoom = {
  id: string;
  restaurantId: string;
  time: string;
  topic: string;
  note: string;
  currentCount: number;
  maxCount: number;
  createdAt: string;
};

export type Order = {
  id: string;
  items: Array<{
    menuId: string;
    quantity: number;
    selectedOptionIds?: string[];
  }>;
  status: "created" | "paid" | "ready" | "completed";
  totalPrice: number;
  createdAt: string;
};
