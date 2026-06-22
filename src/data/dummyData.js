export const university = {
  id: "hankuk-university",
  name: "한국대학교",
  logoUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
};

export const restaurants = [
  {
    id: "restaurant-1",
    name: "학생회관 식당",
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80",
    location: "학생회관 1층",
    isOpen: true,
    description: "가성비 좋은 한식과 정식 메뉴를 판매합니다.",
  },
  {
    id: "restaurant-2",
    name: "공대 분식",
    imageUrl: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?auto=format&fit=crop&w=900&q=80",
    location: "공학관 B동 지하 1층",
    isOpen: true,
    description: "떡볶이, 김밥, 라면을 빠르게 주문할 수 있습니다.",
  },
  {
    id: "restaurant-3",
    name: "중앙도서관 카페",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    location: "중앙도서관 2층",
    isOpen: false,
    description: "커피와 샌드위치, 간단한 디저트를 제공합니다.",
  },
];

export const menus = [
  {
    id: "menu-1",
    restaurantId: "restaurant-1",
    name: "김치찌개 정식",
    imageUrl: "https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=900&q=80",
    price: 6500,
    description: "따뜻한 김치찌개와 밥, 기본 반찬이 함께 제공됩니다.",
    options: [
      { id: "option-1", name: "밥 추가", price: 1000 },
      { id: "option-2", name: "계란후라이 추가", price: 800 },
    ],
  },
  {
    id: "menu-2",
    restaurantId: "restaurant-1",
    name: "제육덮밥",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
    price: 7000,
    description: "매콤한 제육볶음을 밥 위에 올린 든든한 메뉴입니다.",
    options: [
      { id: "option-3", name: "고기 추가", price: 2000 },
      { id: "option-4", name: "매운맛", price: 0 },
    ],
  },
  {
    id: "menu-3",
    restaurantId: "restaurant-2",
    name: "떡볶이",
    imageUrl: "https://images.unsplash.com/photo-1604908177522-402d4c285c4f?auto=format&fit=crop&w=900&q=80",
    price: 4500,
    description: "매콤달콤한 소스가 잘 배어 있는 캠퍼스 인기 메뉴입니다.",
    options: [
      { id: "option-5", name: "치즈 추가", price: 1500 },
      { id: "option-6", name: "튀김 추가", price: 2000 },
    ],
  },
  {
    id: "menu-4",
    restaurantId: "restaurant-2",
    name: "참치김밥",
    imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
    price: 4000,
    description: "수업 사이에 빠르게 먹기 좋은 김밥입니다.",
    options: [
      { id: "option-7", name: "단무지 추가", price: 300 },
      { id: "option-8", name: "라면 세트", price: 3000 },
    ],
  },
  {
    id: "menu-5",
    restaurantId: "restaurant-3",
    name: "아이스 아메리카노",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    price: 2500,
    description: "공부할 때 마시기 좋은 시원한 커피입니다.",
    options: [
      { id: "option-9", name: "샷 추가", price: 500 },
      { id: "option-10", name: "디카페인 변경", price: 500 },
    ],
  },
];
