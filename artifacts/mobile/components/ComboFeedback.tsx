import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";

interface Props {
  text: string | null;
}

const platformTextShadow = Platform.select({
  ios: {
    textShadowColor: "rgba(176,126,40,0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  android: {
    textShadowColor: "rgba(176,126,40,0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  default: {},
});

export default function ComboFeedback({ text }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.55)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (text) {
      opacity.setValue(0);
      scale.setValue(0.55);
      translateY.setValue(24);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 110,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.sequence([
          Animated.delay(1000),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 380,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -28,
              duration: 380,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    }
  }, [text, opacity, scale, translateY]);

  if (!text) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { opacity, transform: [{ scale }, { translateY }] },
      ]}
    >
      <View style={styles.pill}>
        <Text style={[styles.text, platformTextShadow]}>{text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "38%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  pill: {
    backgroundColor: "rgba(17,17,24,0.82)",
    borderRadius: 26,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(200,169,110,0.28)",
  },
  text: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#D4A83A",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
});
