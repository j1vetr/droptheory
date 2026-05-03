import LottieView from "lottie-react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SplashScreen() {
  useEffect(() => {
    const fallback = setTimeout(() => router.replace("/menu"), 4200);
    return () => clearTimeout(fallback);
  }, []);

  const handleFinish = () => router.replace("/menu");

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleFinish}
    >
      <StatusBar style="light" />
      <LottieView
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
});
