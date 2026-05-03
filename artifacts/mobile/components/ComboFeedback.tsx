import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text } from "react-native";

interface Props {
  text: string | null;
}

const platformTextShadow = Platform.select({
  ios: {
    textShadowColor: "rgba(200,169,110,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  android: {
    textShadowColor: "rgba(200,169,110,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  default: {},
});

export default function ComboFeedback({ text }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (text) {
      opacity.setValue(0);
      scale.setValue(0.6);
      translateY.setValue(20);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.sequence([
          Animated.delay(900),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -20,
              duration: 400,
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
      <Text style={[styles.text, platformTextShadow]}>{text}</Text>
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
  text: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    color: "#C8A96E",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
