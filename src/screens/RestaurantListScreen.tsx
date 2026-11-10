import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomNav,
  Icon,
  IconButton,
  SectionHeading,
  ui,
  type IconName,
} from "../components/AppUI";
import CachedRemoteImage from "../components/CachedRemoteImage";
import FavoriteHeartButton from "../components/FavoriteHeartButton";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  getBuildingCards,
  getCrowdPicks,
  getMenuById,
  getMenusByCategory,
  getPopularMenus,
  getRestaurantById,
  getRestaurantCount,
  getTodayCafeteria,
  searchCampusFood,
} from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { useAuth } from "../store/AuthContext";
import { useFavorites } from "../store/FavoriteContext";
import { useNotifications } from "../store/NotificationContext";
import { colors } from "../theme/colors";
import { BRAND_FONT_FAMILY } from "../theme/typography";
import type { AppScreenProps } from "../types/app";
import { formatPrice } from "../utils/formatPrice";
import {
  lunchboxRecommendationSource,
  tukSymbolSource,
} from "../utils/staticAssets";

const categories = [
  "전체",
  "한식",
  "중식",
  "분식",
  "양식",
  "카페",
  "가성비",
  "혼밥",
];
const shortcuts: {
  title: string;
  icon: IconName;
  target: "CampusMap" | "Recommendation" | "MealMate" | "Community";
}[] = [
  {
    title: "건물별 식당",
    icon: "business-outline",
    target: "CampusMap",
  },
  {
    title: "메뉴 추천",
    icon: "restaurant-outline",
    target: "Recommendation",
  },
  {
    title: "밥친구",
    icon: "people-outline",
    target: "MealMate",
  },
  {
    title: "음식 후기",
    icon: "chatbubble-ellipses-outline",
    target: "Community",
  },
];

// Sample values until the campus provides a live crowd data source.
const CrowdPanel = memo(function CrowdPanel({
  onOpen,
}: {
  onOpen: (id: string) => void;
}) {
  const picks = useMemo(getCrowdPicks, []);
  return (
    <View style={s.crowd}>
      <View style={s.crowdHeading}>
        <View style={s.row}>
          <Icon name="pulse" size={16} color={colors.success} />
          <Text style={s.smallHeading}>식당 혼잡도</Text>
        </View>
        <Text style={s.sample}>예시 데이터</Text>
      </View>
      <View style={s.row}>
        {picks.map((pick, index) => {
          const color =
            pick.status === "원활"
              ? colors.success
              : pick.status === "보통"
                ? colors.warning
                : colors.danger;
          return (
            <Pressable
              key={pick.restaurantId}
              accessibilityRole="button"
              onPress={() => onOpen(pick.restaurantId)}
              style={[s.crowdItem, index > 0 && s.crowdDivider]}
            >
              <Text numberOfLines={1} style={s.crowdName}>
                {pick.restaurant.name}
              </Text>
              <View style={s.crowdStatus}>
                <View style={[s.dot, { backgroundColor: color }]} />
                <Text style={[s.crowdText, { color }]}>{pick.status}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

export default function RestaurantListScreen({
  navigation,
  route,
}: AppScreenProps<"RestaurantList">) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [activeCategory, setActiveCategory] = useState(
    route.params?.category ?? "전체",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 250);
  const { totalQuantity } = useCart();
  const { user } = useAuth();
  const { favoriteMenuIds, isFavoriteMenu, toggleFavoriteMenu } =
    useFavorites();
  const { unreadCount } = useNotifications();
  const today = getTodayCafeteria();
  const buildings = useMemo(getBuildingCards, []);
  const popular = useMemo(getPopularMenus, []);
  const favorites = activeCategory === "즐겨찾기";
  const searching = searchQuery.trim().length > 0;
  const searchPending = searchQuery !== debouncedQuery;
  const favoriteMenus = useMemo(
    () =>
      favoriteMenuIds
        .map(getMenuById)
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((menu) => ({
          ...menu,
          restaurant: getRestaurantById(menu.restaurantId),
        })),
    [favoriteMenuIds],
  );
  const menuItems = useMemo(
    () => (favorites ? favoriteMenus : getMenusByCategory(activeCategory)),
    [activeCategory, favorites, favoriteMenus],
  );
  const results = useMemo(
    () => searchCampusFood(debouncedQuery),
    [debouncedQuery],
  );
  const openRestaurant = useCallback(
    (restaurantId: string) =>
      navigation.navigate("RestaurantDetail", { restaurantId }),
    [navigation],
  );

  useEffect(() => {
    if (route.params?.category) {
      setActiveCategory(route.params.category);
      setSearchQuery("");
      scroll.current?.scrollTo({ y: 0, animated: true });
    }
  }, [route.params]);

  function showFavorites() {
    setActiveCategory("즐겨찾기");
    setSearchQuery("");
    scroll.current?.scrollTo({ y: 0, animated: true });
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.topbar}>
        <View style={s.brand}>
          <Image source={tukSymbolSource} style={s.symbol} />
          <View>
            <Text style={s.brandName}>대학교 밥먹자</Text>
            <Text style={s.school}>한국공학대학교</Text>
          </View>
        </View>
        <View style={s.row}>
          <IconButton
            name="notifications-outline"
            label="알림"
            badge={unreadCount}
            onPress={() => navigation.navigate("Notifications")}
          />
          <IconButton
            name="bag-handle-outline"
            label="장바구니"
            badge={totalQuantity}
            onPress={() => navigation.navigate("Cart")}
          />
        </View>
      </View>
      <ScrollView
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <View style={s.intro}>
          <Text accessibilityRole="header" style={s.title}>
            {favorites ? "즐겨찾기" : "캠퍼스에서 뭐 먹을까?"}
          </Text>
          {favorites && <Text style={s.meta}>저장한 메뉴를 모아볼 수 있어요</Text>}
        </View>
        {!favorites && (
          <View style={s.search}>
            <Icon name="search-outline" size={20} color={colors.textSoft} />
            <TextInput
              accessibilityLabel="메뉴 또는 식당 검색"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="메뉴 또는 식당 검색"
              placeholderTextColor={colors.textSoft}
              returnKeyType="search"
              style={s.searchInput}
            />
            {searching && (
              <IconButton
                name="close"
                label="검색 지우기"
                onPress={() => setSearchQuery("")}
              />
            )}
          </View>
        )}

        {searching ? (
          <View style={s.section}>
            <SectionHeading title={searchPending ? "검색 중" : `검색 결과 ${results.length}개`} />
            {!searchPending && results.map((result) => (
              <Pressable
                key={result.id}
                accessibilityRole="button"
                style={({ pressed }) => [s.searchResult, pressed && ui.pressed]}
                onPress={() =>
                  result.type === "menu"
                    ? navigation.navigate("MenuDetail", {
                        menuId: result.targetId,
                      })
                    : openRestaurant(result.targetId)
                }
              >
                <CachedRemoteImage
                  uri={result.imageUrl}
                  style={s.resultImage}
                />
                <View style={s.flex}>
                  <Text style={s.menuName}>{result.title}</Text>
                  <Text style={s.meta}>{result.subtitle}</Text>
                  {result.price !== undefined && (
                    <Text style={s.price}>{formatPrice(result.price)}</Text>
                  )}
                </View>
                <Icon
                  name="chevron-forward"
                  size={18}
                  color={colors.textSoft}
                />
              </Pressable>
            ))}
            {!searchPending && results.length === 0 && (
              <View style={s.empty}>
                <Icon name="search-outline" size={30} color={colors.textSoft} />
                <Text style={s.emptyText}>일치하는 메뉴나 식당이 없어요</Text>
                <Text style={s.meta}>메뉴 이름이나 식당 이름을 다시 확인해 보세요</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {!favorites && (
              <>
                <View style={s.shortcuts}>
                  {shortcuts.map((item) => (
                    <Pressable
                      key={item.title}
                      accessibilityRole="button"
                      onPress={() => navigation.navigate(item.target)}
                      style={({ pressed }) => [s.shortcut, pressed && ui.pressed]}
                    >
                      <Icon name={item.icon} color={colors.textMuted} size={20} />
                      <Text style={s.shortcutText}>{item.title}</Text>
                    </Pressable>
                  ))}
                </View>
                {!user && <View style={s.featureSection}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`학식 예시, ${today.menuItems[0]}, ${formatPrice(today.price)}, ${today.restaurantName} 보기`}
                    onPress={() => openRestaurant(today.restaurantId)}
                    style={({ pressed }) => [
                      s.today,
                      pressed && ui.pressed,
                    ]}
                  >
                    <View style={s.ticketBody}>
                      <Text style={s.featureLabel}>학식 메뉴 예시</Text>
                      <Text style={s.todayTitle}>{today.menuItems[0]}</Text>
                      <Text style={s.todaySides}>
                        {today.menuItems.slice(1).join(" · ")}
                      </Text>
                    </View>
                    <View style={s.ticketStub}>
                      <Text style={s.todayPrice}>{formatPrice(today.price)}</Text>
                      <Text style={s.todayLocation}>
                        종합교육관 · {today.restaurantName}
                      </Text>
                      <View style={s.row}>
                        <Icon
                          name="time-outline"
                          size={12}
                          color={colors.onInkMuted}
                        />
                        <Text style={s.todayTime}>{today.servingTime}</Text>
                      </View>
                      <View style={s.row}>
                        <Text style={s.ticketLink}>식당 보기</Text>
                        <Icon name="arrow-forward" size={16} color="white" />
                      </View>
                    </View>
                  </Pressable>
                </View>}
              </>
            )}

            <View style={[s.menuSection, favorites && s.favoritesSection]}>
              {!favorites && <SectionHeading title="메뉴 둘러보기" />}
              {!favorites && (
                <FlatList
                  horizontal
                  data={categories}
                  keyExtractor={(item) => item}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.filters}
                  initialNumToRender={8}
                  renderItem={({ item }) => (
                    <Pressable
                      accessibilityRole="tab"
                      aria-selected={activeCategory === item}
                      onPress={() => setActiveCategory(item)}
                      style={({ pressed }) => [
                        s.filter,
                        activeCategory === item && s.filterActive,
                        pressed && ui.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          s.filterText,
                          activeCategory === item && s.filterTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  )}
                />
              )}
              {menuItems.length ? (
                <FlatList
                  horizontal
                  data={menuItems}
                  keyExtractor={(menu) => menu.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.menuList}
                  initialNumToRender={3}
                  maxToRenderPerBatch={4}
                  windowSize={5}
                  removeClippedSubviews={Platform.OS === "android"}
                  renderItem={({ item: menu }) => (
                    <View style={s.menuCard}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          menu.name + " " + formatPrice(menu.price)
                        }
                        onPress={() =>
                          navigation.navigate("MenuDetail", { menuId: menu.id })
                        }
                        style={({ pressed }) => pressed && ui.pressed}
                      >
                        <CachedRemoteImage
                          uri={menu.imageUrl}
                          style={s.menuImage}
                        />
                        <Text style={s.menuRestaurant} numberOfLines={1}>
                          {menu.restaurant?.name}
                        </Text>
                        <Text style={s.menuName} numberOfLines={1}>
                          {menu.name}
                        </Text>
                        <Text style={[s.price, s.cardPrice]}>{formatPrice(menu.price)}</Text>
                      </Pressable>
                      <FavoriteHeartButton
                        isFavorite={isFavoriteMenu(menu.id)}
                        onPress={() => toggleFavoriteMenu(menu.id)}
                        style={s.heart}
                        size={24}
                      />
                    </View>
                  )}
                />
              ) : (
                <View style={[s.empty, s.emptyMenuList]}>
                  <Icon
                    name={favorites ? "heart-outline" : "restaurant-outline"}
                    size={28}
                    color={colors.textSoft}
                  />
                  <Text style={s.emptyText}>
                    {favorites ? "아직 저장한 메뉴가 없어요" : "등록된 메뉴가 없어요"}
                  </Text>
                  {favorites && (
                    <>
                      <Text style={s.meta}>마음에 드는 메뉴의 하트를 눌러 저장하세요</Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setActiveCategory("전체")}
                        style={({ pressed }) => [s.emptyAction, pressed && ui.pressed]}
                      >
                        <Text style={s.emptyActionText}>메뉴 둘러보기</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              )}
            </View>
            {!favorites && (
              <>
                {!user && <View style={s.section}>
                  <CrowdPanel onOpen={openRestaurant} />
                </View>}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate("Recommendation")}
                  style={({ pressed }) => [s.recommendation, pressed && ui.pressed]}
                >
                  <View style={s.recommendationCopy}>
                    <Text style={s.recommendationTitle}>
                      입맛에 맞는 메뉴 찾기
                    </Text>
                    <View style={s.row}>
                      <Text style={s.recommendationLink}>
                        메뉴 추천 받기
                      </Text>
                      <Icon
                        name="arrow-forward"
                        size={14}
                        color={colors.primary}
                      />
                    </View>
                  </View>
                  <Image
                    source={lunchboxRecommendationSource}
                    resizeMode="contain"
                    style={s.lunchbox}
                  />
                </Pressable>
                <View style={s.section}>
                  <SectionHeading
                    title="건물별 식당"
                    action="전체 보기"
                    onPress={() => navigation.navigate("CampusMap")}
                  />
                  <Text style={s.sectionSubtitle}>
                    건물 {buildings.length}곳 · 식당 {getRestaurantCount()}곳
                  </Text>
                  <FlatList
                    horizontal
                    data={buildings}
                    keyExtractor={(item) => item.id}
                    initialNumToRender={3}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.buildings}
                    renderItem={({ item, index }) => (
                      <Pressable
                        accessibilityRole="button"
                        style={s.building}
                        onPress={() =>
                          navigation.navigate("CampusMap", {
                            buildingId: item.id,
                          })
                        }
                      >
                        <CachedRemoteImage
                          uri={item.imageUrl ?? ""}
                          style={s.buildingImage}
                        />
                        <View style={s.buildingNumber}>
                          <Text style={s.buildingNumberText}>0{index + 1}</Text>
                        </View>
                        <Text style={s.buildingName}>{item.name}</Text>
                        <Text style={s.meta}>
                          {item.restaurants.length}개 식당 · {item.walkText}
                        </Text>
                        <Text numberOfLines={1} style={s.buildingRestaurants}>
                          {item.menuPreview}
                        </Text>
                      </Pressable>
                    )}
                  />
                </View>
                {!user && <>
                <View style={s.divider} />
                <View style={s.section}>
                  <SectionHeading title="인기 메뉴 예시" />
                  {popular.map((item) => (
                    <Pressable
                      accessibilityRole="button"
                      key={item.menu.id}
                      style={s.rankRow}
                      onPress={() =>
                        navigation.navigate("MenuDetail", {
                          menuId: item.menu.id,
                        })
                      }
                    >
                      <Text style={s.rank}>
                        {item.rank.toString().padStart(2, "0")}
                      </Text>
                      <CachedRemoteImage
                        uri={item.menu.imageUrl}
                        style={s.rankImage}
                      />
                      <View style={s.flex}>
                        <Text style={s.menuName}>{item.menu.name}</Text>
                        <Text style={s.meta}>{item.restaurant.name}</Text>
                      </View>
                      <Text style={s.rankPrice}>
                        {formatPrice(item.menu.price)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                </>}
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [s.mateBanner, pressed && ui.pressed]}
                  onPress={() => navigation.navigate("MealMate")}
                >
                  <View style={s.mateIcon}>
                    <Icon name="people-outline" color={colors.textMuted} size={22} />
                  </View>
                  <View style={s.flex}>
                    <Text style={s.menuName}>밥친구 찾기</Text>
                    <Text style={s.meta}>함께 밥 먹을 모임을 찾아보세요</Text>
                  </View>
                  <Icon name="arrow-forward" color={colors.primary} />
                </Pressable>
                <Text style={s.footer}>
                  대학교 밥먹자 · 한국공학대학교
                </Text>
              </>
            )}
          </>
        )}
      </ScrollView>
      <BottomNav
        active={favorites ? "favorites" : "home"}
        navigation={navigation}
        onFavorites={showFavorites}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1, minWidth: 0 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  symbol: { width: 32, height: 36, resizeMode: "contain" },
  brandName: {
    fontSize: 20,
    fontFamily: BRAND_FONT_FAMILY,
    color: colors.text,
    lineHeight: 24,
  },
  school: { fontSize: 11, color: colors.textMuted },
  content: { paddingBottom: 24 },
  intro: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 36,
    color: colors.text,
  },
  search: {
    marginHorizontal: 24,
    paddingLeft: 16,
    paddingRight: 4,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    color: colors.text,
    fontSize: 15,
  },
  shortcuts: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  shortcut: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutText: { fontSize: 12, fontWeight: "500", color: colors.text, textAlign: "center" },
  featureSection: { marginHorizontal: 24, marginTop: 4 },
  featureLabel: { fontSize: 12, fontWeight: "600", color: colors.onInkMuted },
  today: {
    flexDirection: "row",
    backgroundColor: colors.ink,
    borderRadius: 16,
    padding: 16,
    minHeight: 148,
  },
  ticketBody: { flex: 3, minWidth: 0, paddingRight: 12, justifyContent: "center", gap: 8 },
  ticketStub: {
    flex: 2,
    minWidth: 0,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.onInkMuted,
    paddingLeft: 12,
    justifyContent: "center",
    gap: 4,
  },
  todayLocation: { color: colors.onInkMuted, fontSize: 12, lineHeight: 18 },
  todayTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
    color: colors.surface,
  },
  todaySides: {
    fontSize: 13,
    color: colors.onInkMuted,
    lineHeight: 20,
  },
  todayPrice: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  todayTime: { flexShrink: 1, fontSize: 12, color: colors.onInkMuted, fontVariant: ["tabular-nums"] },
  ticketLink: { fontSize: 13, fontWeight: "600", color: colors.surface },
  section: { paddingHorizontal: 24, paddingTop: 28 },
  crowd: {
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: 24,
  },
  crowdHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  smallHeading: { color: colors.text, fontSize: 13, fontWeight: "700" },
  sample: { fontSize: 12, color: colors.textSoft },
  crowdItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 8,
    minHeight: 45,
  },
  crowdDivider: { borderLeftWidth: 1, borderColor: colors.border },
  crowdName: { fontSize: 12, color: colors.textMuted },
  crowdStatus: { flexDirection: "row", gap: 5, alignItems: "center" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  crowdText: { fontSize: 12, fontWeight: "700" },
  menuSection: { paddingTop: 24, paddingLeft: 24 },
  favoritesSection: { paddingTop: 8 },
  filters: { gap: 8, paddingBottom: 16, paddingRight: 24 },
  filter: {
    paddingHorizontal: 16,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  filterActive: { backgroundColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: "white" },
  menuList: { gap: 14, paddingRight: 24, paddingBottom: 6 },
  menuCard: { width: 156 },
  menuImage: { width: "100%", height: 128, borderRadius: 12 },
  heart: { position: "absolute", top: 4, right: 4 },
  menuRestaurant: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  menuName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 22,
  },
  cardPrice: { marginTop: 4 },
  price: { fontSize: 16, fontWeight: "600", color: colors.text, fontVariant: ["tabular-nums"] },
  empty: { alignItems: "center", gap: 8, paddingVertical: 48 },
  emptyMenuList: { marginRight: 24 },
  emptyText: { fontSize: 16, fontWeight: "600", color: colors.text, textAlign: "center" },
  emptyAction: { minHeight: 48, paddingHorizontal: 16, justifyContent: "center", marginTop: 8, backgroundColor: colors.surfaceWarm, borderRadius: 10 },
  emptyActionText: { color: colors.primary, fontWeight: "600" },
  recommendation: {
    marginTop: 28,
    marginHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 118,
    backgroundColor: colors.surfaceWarm,
    borderRadius: 16,
    overflow: "hidden",
  },
  recommendationCopy: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 16,
    paddingVertical: 16,
    zIndex: 1,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  recommendationLink: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  lunchbox: { width: 112, height: 112 },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 16,
  },
  buildings: { gap: 14, paddingBottom: 5 },
  building: { width: 216 },
  buildingImage: { width: "100%", height: 120, borderRadius: 12 },
  buildingNumber: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "white",
    borderRadius: 5,
  },
  buildingNumberText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
  },
  buildingName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 13,
  },
  meta: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginTop: 4 },
  buildingRestaurants: { fontSize: 12, color: colors.textSoft, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginTop: 28, marginHorizontal: 24 },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  rank: { fontSize: 15, color: colors.primary, fontWeight: "800" },
  rankImage: { width: 55, height: 55, borderRadius: 10 },
  rankPrice: { fontSize: 13, fontWeight: "700", color: colors.text },
  mateBanner: {
    margin: 24,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
  },
  mateIcon: { width: 40, alignItems: "center" },
  footer: {
    textAlign: "center",
    color: colors.textSoft,
    fontSize: 12,
    marginBottom: 16,
  },
  searchResult: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  resultImage: { width: 68, height: 68, borderRadius: 10 },
});
