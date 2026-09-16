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
  color: string;
  background: string;
  target: "CampusMap" | "Recommendation" | "MealMate" | "Community";
}[] = [
  {
    title: "학교 식당",
    icon: "restaurant-outline",
    color: "#2864D9",
    background: "#EDF3FF",
    target: "CampusMap",
  },
  {
    title: "메뉴 추천",
    icon: "sparkles-outline",
    color: "#BD7911",
    background: "#FFF6D9",
    target: "Recommendation",
  },
  {
    title: "나랑 밥먹자",
    icon: "people-outline",
    color: "#229379",
    background: "#EAF7F0",
    target: "MealMate",
  },
  {
    title: "음식 후기",
    icon: "chatbubble-ellipses-outline",
    color: "#D26A68",
    background: "#FFF0EC",
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
          <Text style={s.smallHeading}>지금 식당은</Text>
        </View>
        <Text style={s.sample}>혼잡도 예시</Text>
      </View>
      <View style={s.row}>
        {picks.map((pick, index) => {
          const color =
            pick.status === "원활"
              ? "#229379"
              : pick.status === "보통"
                ? "#B78226"
                : "#DB625C";
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
  const { favoriteMenuIds, isFavoriteMenu, toggleFavoriteMenu } =
    useFavorites();
  const { unreadCount } = useNotifications();
  const today = getTodayCafeteria();
  const buildings = useMemo(getBuildingCards, []);
  const popular = useMemo(getPopularMenus, []);
  const favorites = activeCategory === "즐겨찾기";
  const searching = searchQuery.trim().length > 0;
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
          {!favorites && (
            <Text style={s.greeting}>공강 사이, 든든한 한 끼</Text>
          )}
          <Text style={s.title}>
            {favorites ? (
              "즐겨찾기"
            ) : (
              <>
                오늘, 뭐 먹을까?<Text style={s.titleDot}>.</Text>
              </>
            )}
          </Text>
        </View>
        <View style={s.search}>
          <Icon name="search-outline" size={20} color={colors.textSoft} />
          <TextInput
            accessibilityLabel="메뉴 또는 식당 검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="먹고 싶은 메뉴, 찾고 싶은 식당"
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

        {searching ? (
          <View style={s.section}>
            <SectionHeading title={"검색 결과 " + results.length} />
            {results.map((result) => (
              <Pressable
                key={result.id}
                accessibilityRole="button"
                style={s.searchResult}
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
            {results.length === 0 && (
              <View style={s.empty}>
                <Icon name="search-outline" size={30} color={colors.textSoft} />
                <Text style={s.meta}>
                  {searchQuery !== debouncedQuery
                    ? "검색 중이에요"
                    : "검색 결과가 없어요"}
                </Text>
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
                      style={s.shortcut}
                    >
                      <View
                        style={[
                          s.shortcutIcon,
                          { backgroundColor: item.background },
                        ]}
                      >
                        <Icon name={item.icon} color={item.color} size={27} />
                      </View>
                      <Text style={s.shortcutText}>{item.title}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={s.featureSection}>
                  <View style={s.featureHeading}>
                    <View style={s.row}>
                      <Text style={s.featureLabel}>TODAY'S TABLE</Text>
                      <View style={s.blueDot} />
                    </View>
                    <Text style={s.featureDate}>오늘의 학식</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="오늘 학식 라온식당 보기"
                    onPress={() => openRestaurant(today.restaurantId)}
                    style={({ pressed }) => [
                      s.today,
                      pressed && { opacity: 0.86 },
                    ]}
                  >
                    <View style={s.todayCopy}>
                      <Text style={s.todayLocation}>
                        종합교육관 · {today.restaurantName}
                      </Text>
                      <Text style={s.todayTitle}>{today.menuItems[0]}</Text>
                      <Text style={s.todaySides}>
                        {today.menuItems.slice(1).join(" · ")}
                      </Text>
                      <Text style={s.todayPrice}>
                        {formatPrice(today.price)}
                      </Text>
                      <View style={s.row}>
                        <Icon
                          name="time-outline"
                          size={12}
                          color={colors.textMuted}
                        />
                        <Text style={s.todayTime}>{today.servingTime}</Text>
                      </View>
                    </View>
                    <View style={s.todayPhoto}>
                      <CachedRemoteImage
                        uri={
                          getRestaurantById(today.restaurantId)?.imageUrl ?? ""
                        }
                        style={s.todayImage}
                      />
                      <Text style={s.photoCaption}>메뉴 이미지 예시</Text>
                      <View style={s.photoArrow}>
                        <Icon name="arrow-forward" size={18} color="white" />
                      </View>
                    </View>
                  </Pressable>
                </View>
              </>
            )}

            <View style={s.menuSection}>
              {!favorites && <SectionHeading title="취향대로 골라봐요" />}
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
                      accessibilityState={{ selected: activeCategory === item }}
                      onPress={() => setActiveCategory(item)}
                      style={[
                        s.filter,
                        activeCategory === item && s.filterActive,
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
                        <View style={s.priceRow}>
                          <Text style={s.price}>{formatPrice(menu.price)}</Text>
                          <View style={s.rating}>
                            <Icon name="star" size={11} color="#E1A234" />
                            <Text style={s.ratingText}>
                              {menu.tasteScore.toFixed(1)}
                            </Text>
                          </View>
                        </View>
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
                <View style={s.empty}>
                  <Icon
                    name="heart-outline"
                    size={36}
                    color={colors.borderStrong}
                  />
                  <Text style={s.emptyText}>
                    {favorites ? "비었어요" : "등록된 메뉴가 없어요"}
                  </Text>
                </View>
              )}
            </View>
            {!favorites && (
              <>
                <View style={s.section}>
                  <CrowdPanel onOpen={openRestaurant} />
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate("Recommendation")}
                  style={s.recommendation}
                >
                  <View style={s.recommendationCopy}>
                    <Text style={s.recommendationTag}>오늘의 메뉴 찾기</Text>
                    <Text style={s.recommendationTitle}>
                      고민은 짧게, 한 끼는 맛있게
                    </Text>
                    <View style={s.row}>
                      <Text style={s.recommendationLink}>
                        나에게 맞는 메뉴 추천
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
                    title="우리 학교 맛집"
                    action="지도 보기"
                    onPress={() => navigation.navigate("CampusMap")}
                  />
                  <Text style={s.sectionSubtitle}>
                    건물 3곳, 식당 {getRestaurantCount()}곳을 한눈에
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
                <View style={s.divider} />
                <View style={s.section}>
                  <SectionHeading title="실패 없는 인기 메뉴" />
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
                <Pressable
                  accessibilityRole="button"
                  style={s.mateBanner}
                  onPress={() => navigation.navigate("MealMate")}
                >
                  <View style={s.mateIcon}>
                    <Icon name="people-outline" color="#229379" size={26} />
                  </View>
                  <View style={s.flex}>
                    <Text style={s.menuName}>같이 먹으면 더 맛있으니까</Text>
                    <Text style={s.meta}>오늘의 밥친구 만나기</Text>
                  </View>
                  <Icon name="arrow-forward" color="#229379" />
                </Pressable>
                <Text style={s.footer}>
                  우리의 맛있는 캠퍼스 생활, 대학교 밥먹자
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
    paddingHorizontal: 18,
    height: 76,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  symbol: { width: 35, height: 39, resizeMode: "contain" },
  brandName: {
    fontSize: 20,
    fontFamily: BRAND_FONT_FAMILY,
    color: colors.text,
    lineHeight: 25,
  },
  school: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  content: { paddingBottom: 12 },
  intro: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 19 },
  greeting: { fontSize: 13, color: colors.textMuted, marginBottom: 7 },
  title: {
    fontSize: 29,
    fontWeight: "700",
    lineHeight: 38,
    color: colors.text,
  },
  titleDot: { color: colors.primary },
  search: {
    marginHorizontal: 24,
    paddingLeft: 16,
    paddingRight: 6,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#F5F6F8",
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    color: colors.text,
    fontSize: 13,
  },
  shortcuts: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 25,
  },
  shortcut: { flex: 1, alignItems: "center", gap: 9 },
  shortcutIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutText: { fontSize: 12, fontWeight: "600", color: colors.text },
  featureSection: { marginHorizontal: 24, marginTop: 2 },
  featureHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  featureLabel: { fontSize: 10, fontWeight: "800", color: colors.primary },
  blueDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  featureDate: { color: colors.textMuted, fontSize: 11 },
  today: {
    flexDirection: "row",
    backgroundColor: "#F2F6FF",
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 184,
  },
  todayCopy: { flex: 1, minWidth: 0, padding: 18, paddingRight: 8 },
  todayLocation: { color: colors.primary, fontSize: 10, fontWeight: "600" },
  todayTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginTop: 12,
  },
  todaySides: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 7,
    lineHeight: 17,
  },
  todayPrice: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 15,
    marginBottom: 8,
  },
  todayTime: { fontSize: 10, color: colors.textMuted },
  todayPhoto: { width: "42%", overflow: "hidden" },
  todayImage: { width: "100%", height: "100%" },
  photoCaption: {
    position: "absolute",
    top: 9,
    right: 7,
    fontSize: 8,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 4,
    borderRadius: 4,
  },
  photoArrow: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  section: { paddingHorizontal: 24, paddingTop: 24 },
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
  sample: { fontSize: 10, color: colors.textSoft },
  crowdItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 8,
    minHeight: 45,
  },
  crowdDivider: { borderLeftWidth: 1, borderColor: colors.border },
  crowdName: { fontSize: 10, color: colors.textMuted },
  crowdStatus: { flexDirection: "row", gap: 5, alignItems: "center" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  crowdText: { fontSize: 12, fontWeight: "700" },
  menuSection: { paddingTop: 24, paddingLeft: 24 },
  filters: { gap: 8, paddingBottom: 18, paddingRight: 24 },
  filter: {
    paddingHorizontal: 17,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F5F6F8",
    alignItems: "center",
    justifyContent: "center",
  },
  filterActive: { backgroundColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  filterTextActive: { color: "white" },
  menuList: { gap: 14, paddingRight: 24, paddingBottom: 6 },
  menuCard: { width: 156 },
  menuImage: { width: "100%", height: 136, borderRadius: 12 },
  heart: { position: "absolute", top: 8, right: 8 },
  menuRestaurant: {
    marginTop: 12,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 5,
  },
  menuName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  price: { fontSize: 16, fontWeight: "800", color: colors.text },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 10, color: colors.textMuted },
  empty: { alignItems: "center", gap: 14, paddingVertical: 70 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  recommendation: {
    marginTop: 28,
    marginHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 118,
    backgroundColor: "#EFF4FF",
    borderRadius: 14,
    overflow: "hidden",
  },
  recommendationCopy: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 18,
    paddingVertical: 18,
    zIndex: 1,
  },
  recommendationTag: { fontSize: 10, color: colors.primary, fontWeight: "600" },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8,
    marginBottom: 10,
  },
  recommendationLink: { fontSize: 10, color: colors.primary },
  lunchbox: { width: 108, height: 118, transform: [{ scale: 1.5 }] },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 18,
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
  meta: { fontSize: 11, color: colors.textMuted, lineHeight: 18, marginTop: 4 },
  buildingRestaurants: { fontSize: 10, color: colors.textSoft, marginTop: 6 },
  divider: { height: 7, backgroundColor: "#F5F6F8", marginTop: 26 },
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
    backgroundColor: "#EFF8F3",
    borderRadius: 12,
  },
  mateIcon: { width: 40, alignItems: "center" },
  footer: {
    textAlign: "center",
    color: colors.textSoft,
    fontSize: 10,
    marginBottom: 15,
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
