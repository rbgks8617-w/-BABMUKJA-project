import React, { useMemo, useRef, useState } from "react";
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  getRecommendationTree,
  getRecommendedMenuByTags,
  getRestaurantNameById,
} from "../services/restaurantService";
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
  const recommendedMenu = useMemo(() => getRecommendedMenuByTags(selectedTags), [selectedTags]);
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
        <Text style={styles.eyebrow}>취향 트리 추천</Text>
        <Text style={styles.title}>뭐가 땡기는지 따라가보자</Text>
        <Text style={styles.description}>
          단맛, 짠맛, 국물, 볶음처럼 지금 끌리는 느낌을 고르면 메뉴 추천이 점점 좁혀져요.
        </Text>
      </View>

      {selectedPath.length > 0 && (
        <View style={styles.pathBox}>
          <Text style={styles.pathLabel}>선택한 흐름</Text>
          <Text style={styles.pathText}>{selectedPath.join("  >  ")}</Text>
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
          <Text style={styles.lightButtonText}>다시 추천</Text>
        </Pressable>
      </View>

      {recommendedMenu && (
        <Animated.View style={{ opacity: resultOpacity }}>
          <Pressable
            style={styles.resultCard}
            onPress={() => navigation.navigate("MenuDetail", { menuId: recommendedMenu.id })}
          >
            <Image source={{ uri: recommendedMenu.imageUrl }} style={styles.resultImage} />
            <View style={styles.resultContent}>
              <Text style={styles.resultBadge}>{recommendedMenu.category}</Text>
              <Text style={styles.resultName}>{recommendedMenu.name}</Text>
              <Text style={styles.restaurant}>{getRestaurantNameById(recommendedMenu.restaurantId)}</Text>
              <Text style={styles.resultDescription}>{recommendedMenu.recommendationText}</Text>
              <View style={styles.tagRow}>
                {recommendedMenu.tags.slice(0, 5).map((tag) => (
                  <Text key={tag} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
              <Text style={styles.price}>{formatPrice(recommendedMenu.price)}</Text>
              <Text style={styles.cta}>이 메뉴로 갈래요</Text>
            </View>
          </Pressable>
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
    backgroundColor: "#222222",
  },
  eyebrow: {
    color: "#ffc4ad",
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    marginTop: 8,
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 34,
  },
  description: {
    marginTop: 8,
    color: "#f5ded3",
    lineHeight: 21,
  },
  pathBox: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#fff0e8",
    borderWidth: 1,
    borderColor: "#ffc4ad",
  },
  pathLabel: {
    color: "#b8401f",
    fontSize: 12,
    fontWeight: "900",
  },
  pathText: {
    marginTop: 5,
    color: "#222222",
    fontWeight: "900",
  },
  treeWrap: {
    gap: 12,
  },
  stepBlock: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
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
    backgroundColor: "#d9532b",
  },
  stepNumberText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    color: "#222222",
    fontSize: 18,
    fontWeight: "900",
  },
  stepSubtitle: {
    marginTop: 3,
    color: "#666666",
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
    borderColor: "#f0dfcc",
  },
  optionButtonActive: {
    backgroundColor: "#d9532b",
    borderColor: "#d9532b",
  },
  optionText: {
    color: "#222222",
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
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
  },
  lightButtonText: {
    color: "#d9532b",
    fontWeight: "900",
  },
  resultCard: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
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
    backgroundColor: "#fff0e8",
    color: "#d9532b",
    fontSize: 12,
    fontWeight: "900",
  },
  resultName: {
    marginTop: 12,
    color: "#222222",
    fontSize: 25,
    fontWeight: "900",
  },
  restaurant: {
    marginTop: 6,
    color: "#d9532b",
    fontWeight: "800",
  },
  resultDescription: {
    marginTop: 10,
    color: "#666666",
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
    color: "#222222",
    fontSize: 20,
    fontWeight: "900",
  },
  cta: {
    marginTop: 12,
    color: "#d9532b",
    fontWeight: "900",
  },
});
