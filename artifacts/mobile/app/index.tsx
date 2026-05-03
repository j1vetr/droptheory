import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

let LottieView: any = null;
if (Platform.OS !== "web") {
  LottieView = require("lottie-react-native").default;
}

export default function SplashScreen() {
  const animRef = useRef<any>(null);

  useEffect(() => {
    const fallback = setTimeout(() => {
      router.replace("/menu");
    }, 4200);
    return () => clearTimeout(fallback);
  }, []);

  const handleFinish = () => {
    router.replace("/menu");
  };

  if (Platform.OS === "web" || !LottieView) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.webTitle}>DROP THEORY</Text>
        <TouchableOpacity style={styles.webSkip} onPress={handleFinish}>
          <Text style={styles.webSkipText}>▶</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleFinish}
    >
      <StatusBar style="light" />
      <LottieView
        ref={animRef}
        source={require("../assets/animations/intro.json")}
        autoPlay
        loop={false}
        onAnimationFinish={handleFinish}
        style={styles.animation}
        resizeMode="contain"
      />
      <Text style={styles.brandName}>DROP THEORY</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: 200,
    height: 200,
  },
  brandName: {
    marginTop: 32,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#C8A96E",
    letterSpacing: 6,
    textTransform: "uppercase",
  },
  webTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#C8A96E",
    letterSpacing: 8,
  },
  webSkip: {
    marginTop: 40,
    padding: 16,
  },
  webSkipText: {
    fontSize: 28,
    color: "#6B6354",
  },
});
