import random
import time
import tkinter as tk
from tkinter import ttk


RESTAURANTS = [
    {
        "id": "restaurant-1",
        "name": "학생회관 식당",
        "location": "학생회관 1층",
        "is_open": True,
        "description": "가성비 좋은 한식과 정식 메뉴를 판매합니다.",
    },
    {
        "id": "restaurant-2",
        "name": "공대 분식",
        "location": "공학관 B동 지하 1층",
        "is_open": True,
        "description": "떡볶이, 김밥, 라면을 빠르게 주문할 수 있습니다.",
    },
    {
        "id": "restaurant-3",
        "name": "중앙도서관 카페",
        "location": "중앙도서관 2층",
        "is_open": False,
        "description": "커피와 샌드위치, 간단한 디저트를 제공합니다.",
    },
]

MENUS = [
    {
        "id": "menu-1",
        "restaurant_id": "restaurant-1",
        "name": "김치찌개 정식",
        "price": 6500,
        "description": "따뜻한 김치찌개와 밥, 기본 반찬이 함께 제공됩니다.",
        "options": [("밥 추가", 1000), ("계란후라이 추가", 800)],
    },
    {
        "id": "menu-2",
        "restaurant_id": "restaurant-1",
        "name": "제육덮밥",
        "price": 7000,
        "description": "매콤한 제육볶음을 밥 위에 올린 든든한 메뉴입니다.",
        "options": [("고기 추가", 2000), ("매운맛", 0)],
    },
    {
        "id": "menu-3",
        "restaurant_id": "restaurant-2",
        "name": "떡볶이",
        "price": 4500,
        "description": "매콤달콤한 소스가 잘 배어 있는 캠퍼스 인기 메뉴입니다.",
        "options": [("치즈 추가", 1500), ("튀김 추가", 2000)],
    },
    {
        "id": "menu-4",
        "restaurant_id": "restaurant-2",
        "name": "참치김밥",
        "price": 4000,
        "description": "수업 사이에 빠르게 먹기 좋은 김밥입니다.",
        "options": [("단무지 추가", 300), ("라면 세트", 3000)],
    },
    {
        "id": "menu-5",
        "restaurant_id": "restaurant-3",
        "name": "아이스 아메리카노",
        "price": 2500,
        "description": "공부할 때 마시기 좋은 시원한 커피입니다.",
        "options": [("샷 추가", 500), ("디카페인 변경", 500)],
    },
]


def format_price(price):
    return f"{price:,}원"


class BabmukjaPreview(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("대학교 밥먹자")
        self.geometry("430x760")
        self.minsize(390, 700)
        self.configure(bg="#fffaf2")
        self.cart = []
        self.payment_method = tk.StringVar(value="학교 포인트")
        self.root_frame = tk.Frame(self, bg="#fffaf2")
        self.root_frame.pack(fill="both", expand=True)
        self.show_splash()

    def clear(self):
        for child in self.root_frame.winfo_children():
            child.destroy()

    def page(self):
        self.clear()
        canvas = tk.Canvas(self.root_frame, bg="#fffaf2", highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.root_frame, orient="vertical", command=canvas.yview)
        content = tk.Frame(canvas, bg="#fffaf2", padx=22, pady=22)
        content.bind("<Configure>", lambda event: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=content, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        return content

    def label(self, parent, text, size=12, bold=False, color="#222222", pady=4):
        font = ("Malgun Gothic", size, "bold" if bold else "normal")
        widget = tk.Label(
            parent,
            text=text,
            font=font,
            fg=color,
            bg="#fffaf2",
            wraplength=340,
            justify="left",
            anchor="w",
        )
        widget.pack(fill="x", pady=pady)
        return widget

    def button(self, parent, text, command, bg="#d9532b", fg="white"):
        widget = tk.Button(
            parent,
            text=text,
            command=command,
            bg=bg,
            fg=fg,
            activebackground=bg,
            activeforeground=fg,
            relief="flat",
            font=("Malgun Gothic", 11, "bold"),
            padx=12,
            pady=10,
            cursor="hand2",
        )
        widget.pack(fill="x", pady=7)
        return widget

    def card(self, parent, title, body, command, action_text="보기"):
        frame = tk.Frame(parent, bg="white", padx=15, pady=13, highlightbackground="#f0dfcc", highlightthickness=1)
        frame.pack(fill="x", pady=8)
        tk.Label(frame, text=title, bg="white", fg="#222222", font=("Malgun Gothic", 17, "bold"), anchor="w").pack(fill="x")
        tk.Label(
            frame,
            text=body,
            bg="white",
            fg="#666666",
            font=("Malgun Gothic", 10),
            wraplength=300,
            justify="left",
            anchor="w",
        ).pack(fill="x", pady=8)
        tk.Button(
            frame,
            text=action_text,
            command=command,
            bg="#d9532b",
            fg="white",
            relief="flat",
            font=("Malgun Gothic", 10, "bold"),
            padx=8,
            pady=6,
        ).pack(anchor="e")

    def summary(self, parent, text):
        frame = tk.Frame(parent, bg="#222222", padx=15, pady=16)
        frame.pack(fill="x", pady=12)
        tk.Label(frame, text=text, bg="#222222", fg="white", font=("Malgun Gothic", 15, "bold"), anchor="w").pack(fill="x")

    def show_splash(self):
        page = self.page()
        page.configure(pady=180)
        self.label(page, "한국대학교", 18, True, "#d9532b")
        self.label(page, "대학교 밥먹자", 34, True)
        self.label(page, "캠퍼스 식당 주문 MVP", 14, False, "#666666")
        self.after(1500, self.show_restaurants)

    def show_restaurants(self):
        page = self.page()
        self.label(page, "한국대학교", 12, True, "#d9532b")
        self.label(page, "오늘 캠퍼스에서 뭐 먹지?", 27, True)
        self.button(page, f"장바구니 {len(self.cart)}", self.show_cart, "#222222")

        for restaurant in RESTAURANTS:
            status = "운영중" if restaurant["is_open"] else "준비중"
            body = f'{restaurant["location"]}\n{restaurant["description"]}\n{status}'
            self.card(page, restaurant["name"], body, lambda item=restaurant: self.show_restaurant_detail(item))

    def show_restaurant_detail(self, restaurant):
        page = self.page()
        self.button(page, "← 뒤로", self.show_restaurants, "white", "#222222")
        self.label(page, restaurant["name"], 27, True)
        self.label(page, restaurant["location"], 12, True, "#d9532b")
        self.label(page, restaurant["description"], 11, False, "#666666")
        self.label(page, "메뉴", 21, True)

        for menu in [item for item in MENUS if item["restaurant_id"] == restaurant["id"]]:
            body = f'{menu["description"]}\n{format_price(menu["price"])}'
            self.card(page, menu["name"], body, lambda item=menu: self.show_menu_detail(item))

    def show_menu_detail(self, menu):
        quantity = tk.IntVar(value=1)
        selected = {name: tk.BooleanVar(value=False) for name, _ in menu["options"]}

        def render():
            page = self.page()
            restaurant = next(item for item in RESTAURANTS if item["id"] == menu["restaurant_id"])
            self.button(page, "← 뒤로", lambda: self.show_restaurant_detail(restaurant), "white", "#222222")
            self.label(page, menu["name"], 27, True)
            self.label(page, format_price(menu["price"]), 18, True, "#d9532b")
            self.label(page, menu["description"], 11, False, "#666666")
            self.label(page, "옵션 선택", 18, True)

            for name, price in menu["options"]:
                tk.Checkbutton(
                    page,
                    text=f"{name} (+{format_price(price)})",
                    variable=selected[name],
                    bg="#fffaf2",
                    fg="#222222",
                    activebackground="#fffaf2",
                    font=("Malgun Gothic", 11, "bold"),
                    anchor="w",
                    command=render,
                ).pack(fill="x", pady=5)

            self.label(page, f"수량: {quantity.get()}", 18, True)
            row = tk.Frame(page, bg="#fffaf2")
            row.pack(fill="x", pady=6)
            tk.Button(row, text="-", command=lambda: change_quantity(-1), width=8, bg="#222222", fg="white").pack(side="left", padx=4)
            tk.Button(row, text="+", command=lambda: change_quantity(1), width=8, bg="#222222", fg="white").pack(side="left", padx=4)

            total = self.calculate_total(menu, selected, quantity.get())
            self.summary(page, f"총 결제 금액  {format_price(total)}")
            self.button(page, "장바구니 담기", lambda: add_to_cart(total))
            self.button(page, "바로 결제", lambda: self.show_payment([self.order_item(menu, selected, quantity.get(), total)]))

        def change_quantity(amount):
            quantity.set(max(1, quantity.get() + amount))
            render()

        def add_to_cart(total):
            self.cart.append(self.order_item(menu, selected, quantity.get(), total))
            self.show_cart()

        render()

    def calculate_total(self, menu, selected, quantity):
        option_total = sum(price for name, price in menu["options"] if selected[name].get())
        return (menu["price"] + option_total) * quantity

    def order_item(self, menu, selected, quantity, total):
        return {
            "name": menu["name"],
            "quantity": quantity,
            "options": [name for name, _ in menu["options"] if selected[name].get()],
            "total": total,
        }

    def show_cart(self):
        page = self.page()
        self.button(page, "← 뒤로", self.show_restaurants, "white", "#222222")
        self.label(page, "장바구니", 27, True)

        if not self.cart:
            self.label(page, "장바구니가 비어 있어요.", 14, False, "#666666")
            self.button(page, "식당 보러가기", self.show_restaurants)
            return

        for index, item in enumerate(list(self.cart)):
            options = ", ".join(item["options"]) if item["options"] else "없음"
            body = f'수량 {item["quantity"]}개\n옵션: {options}\n{format_price(item["total"])}'
            self.card(page, item["name"], body, lambda item_index=index: self.remove_cart_item(item_index), "삭제")

        self.summary(page, f"총 결제 금액  {format_price(sum(item['total'] for item in self.cart))}")
        self.button(page, "결제하기", lambda: self.show_payment(list(self.cart)))

    def remove_cart_item(self, index):
        self.cart.pop(index)
        self.show_cart()

    def show_payment(self, order_items):
        page = self.page()
        self.button(page, "← 뒤로", self.show_cart, "white", "#222222")
        self.label(page, "결제", 27, True)

        for item in order_items:
            self.label(page, f'{item["name"]} x {item["quantity"]} - {format_price(item["total"])}', 11, True, "#666666")

        self.label(page, "결제 수단", 18, True)
        for method in ["학교 포인트", "체크카드", "간편결제"]:
            ttk.Radiobutton(page, text=method, variable=self.payment_method, value=method).pack(anchor="w", pady=5)

        total = sum(item["total"] for item in order_items)
        self.summary(page, f"총 결제 금액  {format_price(total)}")
        self.button(page, "더미 결제 완료", lambda: self.show_order_complete(order_items, total))

    def show_order_complete(self, order_items, total):
        self.cart.clear()
        page = self.page()
        order_number = f"BMJ-{random.randint(100000, 999999)}"
        self.label(page, "✓", 54, True, "#1f8f5f")
        self.label(page, "주문이 완료됐어요", 25, True)
        self.label(page, f"주문번호 {order_number}", 12, True, "#666666")
        self.label(page, f"결제수단 {self.payment_method.get()}", 12, False, "#666666")
        self.label(page, "예상 준비 시간: 약 15분", 18, True)

        for item in order_items:
            self.label(page, f'{item["name"]} x {item["quantity"]} - {format_price(item["total"])}', 11, False, "#666666")

        self.summary(page, f"총 결제 금액  {format_price(total)}")
        self.button(page, "홈으로 돌아가기", self.show_restaurants)


if __name__ == "__main__":
    BabmukjaPreview().mainloop()
