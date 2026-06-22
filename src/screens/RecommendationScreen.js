import React, { useMemo, useRef, useState } from "react";
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  getRecommendationTree,
  getRecommendedMenuResult,
  getRestaurantNameById,
} from "../services/restaurantService";
import { colors } from "../theme/colors";
import { formatPrice } from "../utils/formatPrice";

export default function RecommendationScreen({ navigation }) {
  const tree = getRecommendationTree();
  const [selectedOptions, setSelectedOptions] = useState({});
  const resultOpacity = useRef(new Animated.Value(1)).current;

  const selectedTags = useMemo(() => {
    return tree.flatMap((step) => selectedOptions[step.id]?.tags ?? []);
  }, [selectedOptions, tree]);

  const activeStepIndex = Math.min(Object.keys(selectedOptions).length, tree.length - 1);
  const visibleSteps = tree.slice(0, activeStepIndex + 1);
  const recommendation = useMemo(() => getRecommendedMenuResult(selectedTags), [selectedTags]);
  const recommendedMenu = recommendation.primary;
  const selectedPath = tree.map((step) => selectedOptions[step.id]?.label).filter(Boolean);

  function handleSelect(stepId, option) {
    const stepIndex = tree.findIndex((step) => step.id === stepId);
    const nextSelectedOptions = tree.slice(0, stepIndex).reduce((next, step) => {
      if (selectedOptions[step.id]) {
        next[step.id] = selectedOptions[step.id];
      }
      return next;
    }, {});

    nextSelectedOptions[stepId] = option;
    setSelectedOptions(nextSelectedOptions);
    animateResult();
  }

  function handleReset() {
    setSelectedOptions({});
    animateResult();
  }

  function handleShuffle() {
    animateResult();
  }

  const progressText = `${selectedPath.length}/${tree.length}개 선택`;

  function animateResult() {
    resultOpacity.setValue(0);
    Animated.timing(resultOpacity, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>오늘 메뉴 큐레이션</Text>
        <Text style={styles.title}>몇 번만 고르면 메뉴가 좁혀져요</Text>
        <Text style={styles.description}>
          상황, 입맛, 형태, 가격대를 반영해 캠퍼스 메뉴 중 가장 잘 맞는 후보를 골라줄게요.
        </Text>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>{progressText}</Text>
        </View>
      </View>

      {selectedPath.length > 0 && (
        <View style={styles.pathBox}>
          <Text style={styles.pathLabel}>내가 고른 취향</Text>
          <Text style={styles.pathText}>{selectedPath.join("  /  ")}</Text>
        </View>
      )}

      <View style={styles.treeWrap}>
        {visibleSteps.map((step, index) => (
          <View key={step.id} style={styles.stepBlock}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </View>
            </View>

            <View style={styles.optionGrid}>
              {step.options.map((option) => {
                const isSelected = selectedOptions[step.id]?.id === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={[styles.optionButton, isSelected && styles.optionButtonActive]}
                    onPress={() => handleSelect(step.id, option)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.lightButton} onPress={handleReset}>
          <Text style={styles.lightButtonText}>처음부터</Text>
        </Pressable>
        <Pressable style={styles.lightButton} onPress={handleShuffle}>
          <Text style={styles.lightButtonText}>후보 바꾸기</Text>
        </Pressable>
      </View>

      {recommendedMenu && (
        <Animated.View style={{ opacity: resultOpacity }}>
          <Text style={styles.resultSectionTitle}>지금 가장 잘 맞는 메뉴</Text>
          <Pressable
            style={styles.resultCard}
            onPress={() => navigation.navigate("MenuDetail", { menuId: recommendedMenu.id })}
          >
            <Image source={{ uri: recommendedMenu.imageUrl }} style={styles.resultImage} />
            <View style={styles.resultContent}>
              <Text style={styles.resultBadge}>{recommendedMenu.category}</Text>
              <Text style={styles.resultName}>{recommendedMenu.name}</Text>
              <Text style={styles.restaurant}>{getRestaurantNameById(recommendedMenu.restaurantId)}</Text>
              <Text style={styles.resultDescription}>{recommendedMenu.recommendationReason}</Text>
              <View style={styles.tagRow}>
                {(recommendedMenu.matchedTags?.length ? recommendedMenu.matchedTags : recommendedMenu.tags)
                  .slice(0, 5)
                  .map((tag) => (
                  <Text key={tag} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
              <Text style={styles.price}>{formatPrice(recommendedMenu.price)}</Text>
              <Text style={styles.cta}>이 메뉴로 갈래요</Text>
            </View>
          </Pressable>

          {recommendation.alternatives.length > 0 && (
            <View style={styles.alternativeWrap}>
              <Text style={styles.alternativeTitle}>다른 후보도 있어요</Text>
              {recommendation.alternatives.map((menu) => (
                <Pressable
                  key={menu.id}
                  style={styles.alternativeItem}
                  onPress={() => navigation.navigate("MenuDetail", { menuId: menu.id })}
                >
                  <View style={styles.alternativeCopy}>
                    <Text style={styles.alternativeName}>{menu.name}</Text>
                    <Text style={styles.alternativeMeta}>
                      {getRestaurantNameById(menu.restaurantId)} · {formatPrice(menu.price)}
                    </Text>
                  </View>
                  <Text style={styles.alternativeTag}>
                    {menu.matchedTags?.[0] ? `#${menu.matchedTags[0]}` : "보기"}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  hero: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.ink,
  },
  eyebrow: {
    color: "#ffc4ad",
    fontSize: 13,
    fontWeight: "800",
  },
  title: {
    marginTop: 8,
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 34,
  },
  description: {
    marginTop: 8,
    color: "#f5ded3",
    lineHeight: 21,
  },
  progressPill: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  progressText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  pathBox: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  pathLabel: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  pathText: {
    marginTop: 5,
    color: colors.text,
    fontWeight: "800",
  },
  treeWrap: {
    gap: 12,
  },
  stepBlock: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumber: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.primary,
  },
  stepNumberText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  stepSubtitle: {
    marginTop: 3,
    color: colors.textMuted,
    lineHeight: 19,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: "#f8efe6",
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontWeight: "800",
  },
  optionTextActive: {
    color: "#ffffff",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 16,
  },
  lightButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lightButtonText: {
    color: colors.primary,
    fontWeight: "800",
  },
  resultCard: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultSectionTitle: {
    marginBottom: 10,
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  resultImage: {
    width: "100%",
    height: 220,
  },
  resultContent: {
    padding: 18,
  },
  resultBadge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceWarm,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  resultName: {
    marginTop: 12,
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
  },
  restaurant: {
    marginTop: 6,
    color: colors.primary,
    fontWeight: "800",
  },
  resultDescription: {
    marginTop: 10,
    color: colors.textMuted,
    lineHeight: 21,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  tag: {
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f8efe6",
    color: "#7c4b3b",
    fontSize: 12,
    fontWeight: "800",
  },
  price: {
    marginTop: 12,
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  cta: {
    marginTop: 12,
    color: colors.primary,
    fontWeight: "800",
  },
  alternativeWrap: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alternativeTitle: {
    marginBottom: 10,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  alternativeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f6e8dc",
  },
  alternativeCopy: {
    flex: 1,
  },
  alternativeName: {
    color: colors.text,
    fontWeight: "800",
  },
  alternativeMeta: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 12,
  },
  alternativeTag: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceWarm,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
});
