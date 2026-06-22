const menus = [
  {
    name: "김치찌개",
    category: "korean",
    description: "칼칼하고 든든한 한식 대표 메뉴",
  },
  {
    name: "비빔밥",
    category: "korean",
    description: "채소와 고추장을 한 그릇에 비벼 먹는 균형 잡힌 메뉴",
  },
  {
    name: "짜장면",
    category: "chinese",
    description: "달큰한 춘장 소스가 생각날 때 좋은 선택",
  },
  {
    name: "짬뽕",
    category: "chinese",
    description: "얼큰한 국물과 해산물이 잘 어울리는 메뉴",
  },
  {
    name: "초밥",
    category: "japanese",
    description: "가볍지만 기분 좋은 한 끼가 필요할 때",
  },
  {
    name: "돈카츠",
    category: "japanese",
    description: "바삭한 튀김과 소스 조합이 좋은 든든한 메뉴",
  },
  {
    name: "파스타",
    category: "western",
    description: "크림, 토마토, 오일 소스로 다양하게 즐기는 메뉴",
  },
  {
    name: "수제버거",
    category: "western",
    description: "고기와 채소를 한 번에 즐기는 만족감 높은 메뉴",
  },
  {
    name: "떡볶이",
    category: "snack",
    description: "매콤달콤한 소스가 당기는 날의 분식",
  },
  {
    name: "김밥",
    category: "snack",
    description: "간단하고 빠르게 먹기 좋은 메뉴",
  },
];

const categoryLabels = {
  all: "전체",
  korean: "한식",
  chinese: "중식",
  japanese: "일식",
  western: "양식",
  snack: "분식",
};

const menuGrid = document.querySelector("#menu-grid");
const menuCount = document.querySelector("#menu-count");
const todayMenu = document.querySelector("#today-menu");
const searchInput = document.querySelector("#menu-search");
const recommendButton = document.querySelector("#recommend-button");
const tabs = document.querySelectorAll(".tab");

let selectedCategory = "all";

function getFilteredMenus() {
  const keyword = searchInput.value.trim().toLowerCase();

  return menus.filter((menu) => {
    const matchesCategory = selectedCategory === "all" || menu.category === selectedCategory;
    const matchesKeyword =
      menu.name.toLowerCase().includes(keyword) ||
      menu.description.toLowerCase().includes(keyword) ||
      categoryLabels[menu.category].toLowerCase().includes(keyword);

    return matchesCategory && matchesKeyword;
  });
}

function selectMenu(menuName) {
  todayMenu.textContent = menuName;
}

function renderMenus() {
  const filteredMenus = getFilteredMenus();
  menuCount.textContent = `${filteredMenus.length}개 메뉴`;
  menuGrid.innerHTML = "";

  if (filteredMenus.length === 0) {
    menuGrid.innerHTML = '<p class="empty-state">조건에 맞는 메뉴가 없어요.</p>';
    return;
  }

  filteredMenus.forEach((menu) => {
    const card = document.createElement("article");
    card.className = "menu-card";
    card.innerHTML = `
      <h3>${menu.name}</h3>
      <p>${menu.description}</p>
      <button type="button">오늘 이거 먹기</button>
    `;

    card.querySelector("button").addEventListener("click", () => selectMenu(menu.name));
    menuGrid.append(card);
  });
}

function recommendRandomMenu() {
  const filteredMenus = getFilteredMenus();

  if (filteredMenus.length === 0) {
    todayMenu.textContent = "추천할 메뉴가 없어요";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredMenus.length);
  selectMenu(filteredMenus[randomIndex].name);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedCategory = tab.dataset.category;
    tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    renderMenus();
  });
});

searchInput.addEventListener("input", renderMenus);
recommendButton.addEventListener("click", recommendRandomMenu);

renderMenus();
