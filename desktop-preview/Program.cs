using System.Drawing;
using System.Windows.Forms;

namespace UniversityBabmukja;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new BabmukjaForm());
    }
}

public sealed class BabmukjaForm : Form
{
    private readonly List<Restaurant> _restaurants = SeedData.Restaurants;
    private readonly List<MenuItem> _menus = SeedData.Menus;
    private readonly List<OrderItem> _cart = [];
    private readonly Panel _root = new() { Dock = DockStyle.Fill, AutoScroll = true };

    public BabmukjaForm()
    {
        Text = "대학교 밥먹자";
        MinimumSize = new Size(390, 720);
        Size = new Size(430, 760);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(255, 250, 242);
        Controls.Add(_root);
        ShowSplash();
    }

    private void Render(Control content)
    {
        _root.Controls.Clear();
        _root.Controls.Add(content);
    }

    private FlowLayoutPanel Page()
    {
        return new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            AutoSize = true,
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
            Padding = new Padding(22),
            BackColor = Color.FromArgb(255, 250, 242),
        };
    }

    private void ShowSplash()
    {
        var page = Page();
        page.Height = 700;
        page.Controls.Add(Label("한국대학교", 18, true, Color.FromArgb(217, 83, 43)));
        page.Controls.Add(Label("대학교 밥먹자", 34, true, Color.FromArgb(34, 34, 34)));
        page.Controls.Add(Label("캠퍼스 식당 주문 MVP", 14, false, Color.DimGray));
        Render(page);

        var timer = new System.Windows.Forms.Timer { Interval = 1500 };
        timer.Tick += (_, _) =>
        {
            timer.Stop();
            ShowRestaurants();
        };
        timer.Start();
    }

    private void ShowRestaurants()
    {
        var page = Page();
        page.Controls.Add(Header("오늘 캠퍼스에서 뭐 먹지?", $"장바구니 {_cart.Count}", ShowCart));

        foreach (var restaurant in _restaurants)
        {
            page.Controls.Add(Card(
                restaurant.Name,
                $"{restaurant.Location}\n{restaurant.Description}\n{(restaurant.IsOpen ? "운영중" : "준비중")}",
                () => ShowRestaurantDetail(restaurant)));
        }

        Render(page);
    }

    private void ShowRestaurantDetail(Restaurant restaurant)
    {
        var page = Page();
        page.Controls.Add(BackButton(ShowRestaurants));
        page.Controls.Add(Label(restaurant.Name, 28, true, Color.FromArgb(34, 34, 34)));
        page.Controls.Add(Label(restaurant.Location, 13, true, Color.FromArgb(217, 83, 43)));
        page.Controls.Add(Label(restaurant.Description, 12, false, Color.DimGray));
        page.Controls.Add(Label("메뉴", 22, true, Color.FromArgb(34, 34, 34)));

        foreach (var menu in _menus.Where(menu => menu.RestaurantId == restaurant.Id))
        {
            page.Controls.Add(Card(
                menu.Name,
                $"{menu.Description}\n{FormatPrice(menu.Price)}",
                () => ShowMenuDetail(menu)));
        }

        Render(page);
    }

    private void ShowMenuDetail(MenuItem menu)
    {
        var quantity = 1;
        var selectedOptions = new List<MenuOption>();
        var page = Page();

        void Refresh()
        {
            page.Controls.Clear();
            page.Controls.Add(BackButton(() => ShowRestaurantDetail(_restaurants.First(item => item.Id == menu.RestaurantId))));
            page.Controls.Add(Label(menu.Name, 28, true, Color.FromArgb(34, 34, 34)));
            page.Controls.Add(Label(FormatPrice(menu.Price), 18, true, Color.FromArgb(217, 83, 43)));
            page.Controls.Add(Label(menu.Description, 12, false, Color.DimGray));
            page.Controls.Add(Label("옵션 선택", 18, true, Color.FromArgb(34, 34, 34)));

            foreach (var option in menu.Options)
            {
                var selected = selectedOptions.Any(item => item.Id == option.Id);
                page.Controls.Add(ActionButton(
                    $"{(selected ? "✓ " : "")}{option.Name} (+{FormatPrice(option.Price)})",
                    () =>
                    {
                        if (selected)
                        {
                            selectedOptions.RemoveAll(item => item.Id == option.Id);
                        }
                        else
                        {
                            selectedOptions.Add(option);
                        }

                        Refresh();
                    },
                    selected ? Color.FromArgb(255, 240, 232) : Color.White,
                    Color.FromArgb(217, 83, 43)));
            }

            page.Controls.Add(Label($"수량: {quantity}", 18, true, Color.FromArgb(34, 34, 34)));
            var quantityRow = new FlowLayoutPanel { AutoSize = true, Width = 340 };
            quantityRow.Controls.Add(ActionButton("-", () => { quantity = Math.Max(1, quantity - 1); Refresh(); }, Color.FromArgb(34, 34, 34), Color.White, 70));
            quantityRow.Controls.Add(ActionButton("+", () => { quantity += 1; Refresh(); }, Color.FromArgb(34, 34, 34), Color.White, 70));
            page.Controls.Add(quantityRow);

            var total = CalculateTotal(menu, selectedOptions, quantity);
            page.Controls.Add(Summary($"총 결제 금액  {FormatPrice(total)}"));
            page.Controls.Add(ActionButton("장바구니 담기", () =>
            {
                _cart.Add(new OrderItem(menu.Name, quantity, selectedOptions.ToList(), total));
                ShowCart();
            }, Color.White, Color.FromArgb(217, 83, 43)));
            page.Controls.Add(ActionButton("바로 결제", () => ShowPayment([new OrderItem(menu.Name, quantity, selectedOptions.ToList(), total)]), Color.FromArgb(217, 83, 43), Color.White));
        }

        Refresh();
        Render(page);
    }

    private void ShowCart()
    {
        var page = Page();
        page.Controls.Add(BackButton(ShowRestaurants));
        page.Controls.Add(Label("장바구니", 28, true, Color.FromArgb(34, 34, 34)));

        if (_cart.Count == 0)
        {
            page.Controls.Add(Label("장바구니가 비어 있어요.", 14, false, Color.DimGray));
            Render(page);
            return;
        }

        foreach (var item in _cart.ToList())
        {
            page.Controls.Add(Card(
                item.Name,
                $"수량 {item.Quantity}개\n옵션: {OptionText(item.Options)}\n{FormatPrice(item.TotalPrice)}",
                () =>
                {
                    _cart.Remove(item);
                    ShowCart();
                },
                "삭제"));
        }

        page.Controls.Add(Summary($"총 결제 금액  {FormatPrice(_cart.Sum(item => item.TotalPrice))}"));
        page.Controls.Add(ActionButton("결제하기", () => ShowPayment(_cart.ToList()), Color.FromArgb(217, 83, 43), Color.White));
        Render(page);
    }

    private void ShowPayment(List<OrderItem> orderItems)
    {
        var paymentMethod = "학교 포인트";
        var methods = new[] { "학교 포인트", "체크카드", "간편결제" };
        var page = Page();

        void Refresh()
        {
            page.Controls.Clear();
            page.Controls.Add(BackButton(ShowCart));
            page.Controls.Add(Label("결제", 28, true, Color.FromArgb(34, 34, 34)));

            foreach (var item in orderItems)
            {
                page.Controls.Add(Label($"{item.Name} x {item.Quantity} - {FormatPrice(item.TotalPrice)}", 12, true, Color.DimGray));
            }

            page.Controls.Add(Label("결제 수단", 18, true, Color.FromArgb(34, 34, 34)));
            foreach (var method in methods)
            {
                page.Controls.Add(ActionButton(
                    paymentMethod == method ? $"✓ {method}" : method,
                    () => { paymentMethod = method; Refresh(); },
                    paymentMethod == method ? Color.FromArgb(255, 240, 232) : Color.White,
                    Color.FromArgb(34, 34, 34)));
            }

            var total = orderItems.Sum(item => item.TotalPrice);
            page.Controls.Add(Summary($"총 결제 금액  {FormatPrice(total)}"));
            page.Controls.Add(ActionButton("더미 결제 완료", () =>
            {
                _cart.Clear();
                ShowOrderComplete(orderItems, total);
            }, Color.FromArgb(217, 83, 43), Color.White));
        }

        Refresh();
        Render(page);
    }

    private void ShowOrderComplete(List<OrderItem> orderItems, int total)
    {
        var page = Page();
        var orderNumber = $"BMJ-{DateTime.Now:HHmmss}";
        page.Controls.Add(Label("✓", 54, true, Color.FromArgb(31, 143, 95)));
        page.Controls.Add(Label("주문이 완료됐어요", 26, true, Color.FromArgb(34, 34, 34)));
        page.Controls.Add(Label($"주문번호 {orderNumber}", 13, true, Color.DimGray));
        page.Controls.Add(Label("예상 준비 시간: 약 15분", 18, true, Color.FromArgb(34, 34, 34)));

        foreach (var item in orderItems)
        {
            page.Controls.Add(Label($"{item.Name} x {item.Quantity} - {FormatPrice(item.TotalPrice)}", 12, false, Color.DimGray));
        }

        page.Controls.Add(Summary($"총 결제 금액  {FormatPrice(total)}"));
        page.Controls.Add(ActionButton("홈으로 돌아가기", ShowRestaurants, Color.FromArgb(217, 83, 43), Color.White));
        Render(page);
    }

    private Control Header(string title, string actionText, Action action)
    {
        var panel = new FlowLayoutPanel { AutoSize = true, Width = 350, FlowDirection = FlowDirection.TopDown };
        panel.Controls.Add(Label("한국대학교", 12, true, Color.FromArgb(217, 83, 43)));
        panel.Controls.Add(Label(title, 27, true, Color.FromArgb(34, 34, 34)));
        panel.Controls.Add(ActionButton(actionText, action, Color.FromArgb(34, 34, 34), Color.White));
        return panel;
    }

    private Control Card(string title, string body, Action action, string actionText = "보기")
    {
        var panel = new Panel
        {
            Width = 350,
            Height = 150,
            Margin = new Padding(0, 8, 0, 8),
            BackColor = Color.White,
        };

        var titleLabel = Label(title, 18, true, Color.FromArgb(34, 34, 34));
        titleLabel.Location = new Point(14, 12);
        var bodyLabel = Label(body, 10, false, Color.DimGray);
        bodyLabel.Location = new Point(14, 44);
        bodyLabel.Width = 210;
        var button = ActionButton(actionText, action, Color.FromArgb(217, 83, 43), Color.White, 86);
        button.Location = new Point(246, 94);

        panel.Controls.Add(titleLabel);
        panel.Controls.Add(bodyLabel);
        panel.Controls.Add(button);
        return panel;
    }

    private static Label Label(string text, int size, bool bold, Color color)
    {
        return new Label
        {
            AutoSize = true,
            MaximumSize = new Size(340, 0),
            Margin = new Padding(0, 4, 0, 4),
            Text = text,
            ForeColor = color,
            Font = new Font("Malgun Gothic", size, bold ? FontStyle.Bold : FontStyle.Regular),
        };
    }

    private static Button ActionButton(string text, Action action, Color background, Color foreground, int width = 340)
    {
        var button = new Button
        {
            Width = width,
            Height = 42,
            Margin = new Padding(0, 6, 0, 6),
            Text = text,
            BackColor = background,
            ForeColor = foreground,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Malgun Gothic", 10, FontStyle.Bold),
        };
        button.FlatAppearance.BorderColor = Color.FromArgb(240, 223, 204);
        button.Click += (_, _) => action();
        return button;
    }

    private static Button BackButton(Action action)
    {
        return ActionButton("← 뒤로", action, Color.White, Color.FromArgb(34, 34, 34), 100);
    }

    private static Control Summary(string text)
    {
        return new Label
        {
            Width = 340,
            Height = 56,
            Margin = new Padding(0, 12, 0, 8),
            Padding = new Padding(14, 14, 14, 14),
            Text = text,
            BackColor = Color.FromArgb(34, 34, 34),
            ForeColor = Color.White,
            Font = new Font("Malgun Gothic", 14, FontStyle.Bold),
        };
    }

    private static int CalculateTotal(MenuItem menu, List<MenuOption> options, int quantity)
    {
        return (menu.Price + options.Sum(option => option.Price)) * quantity;
    }

    private static string OptionText(List<MenuOption> options)
    {
        return options.Count == 0 ? "없음" : string.Join(", ", options.Select(option => option.Name));
    }

    private static string FormatPrice(int price)
    {
        return $"{price:N0}원";
    }
}

public record Restaurant(string Id, string Name, string Location, bool IsOpen, string Description);

public record MenuOption(string Id, string Name, int Price);

public record MenuItem(string Id, string RestaurantId, string Name, int Price, string Description, List<MenuOption> Options);

public record OrderItem(string Name, int Quantity, List<MenuOption> Options, int TotalPrice);

public static class SeedData
{
    public static readonly List<Restaurant> Restaurants =
    [
        new("restaurant-1", "학생회관 식당", "학생회관 1층", true, "가성비 좋은 한식과 정식 메뉴"),
        new("restaurant-2", "공대 분식", "공학관 B동 지하 1층", true, "떡볶이, 김밥, 라면 주문"),
        new("restaurant-3", "중앙도서관 카페", "중앙도서관 2층", false, "커피와 샌드위치, 디저트"),
    ];

    public static readonly List<MenuItem> Menus =
    [
        new("menu-1", "restaurant-1", "김치찌개 정식", 6500, "밥과 반찬이 함께 제공되는 든든한 메뉴", [
            new("option-1", "밥 추가", 1000),
            new("option-2", "계란후라이 추가", 800),
        ]),
        new("menu-2", "restaurant-1", "제육덮밥", 7000, "매콤한 제육볶음을 올린 덮밥", [
            new("option-3", "고기 추가", 2000),
            new("option-4", "매운맛", 0),
        ]),
        new("menu-3", "restaurant-2", "떡볶이", 4500, "매콤달콤한 캠퍼스 인기 메뉴", [
            new("option-5", "치즈 추가", 1500),
            new("option-6", "튀김 추가", 2000),
        ]),
        new("menu-4", "restaurant-2", "참치김밥", 4000, "수업 사이 빠르게 먹기 좋은 김밥", [
            new("option-7", "단무지 추가", 300),
            new("option-8", "라면 세트", 3000),
        ]),
        new("menu-5", "restaurant-3", "아이스 아메리카노", 2500, "공부할 때 마시기 좋은 커피", [
            new("option-9", "샷 추가", 500),
            new("option-10", "디카페인 변경", 500),
        ]),
    ];
}
