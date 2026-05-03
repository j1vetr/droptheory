import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text } from "react-native";

interface Props {
  id: number;
  x: number;
  y: number;
  value: number;
}

const textShadow = Platform.select({
  ios: {
    textShadowColor: "rgba(176,126,40,0.85)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  android: {
    textShadowColor: "rgba(176,126,40,0.85)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  default: {},
});

export default function ScorePopup({ x, y, value }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 130,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -40,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 720,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [opacity, scale, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          left: x,
          top: y,
          opacity,
          transform: [{ scale }, { translateY }],
        },
      ]}
    >
      <Text style={[styles.text, textShadow]}>+{value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 200,
    pointerEvents: "none",
  },
  text: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#D4A83A",
    letterSpacing: 0.5,
  },
});
