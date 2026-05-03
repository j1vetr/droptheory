import LottieView from "lottie-react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function SplashScreen() {
  const finishedRef = useRef(false);

  const goNext = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    router.replace("/game");
  };

  useEffect(() => {
    const fallback = setTimeout(goNext, 4200);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={goNext}
    >
      <StatusBar style="dark" />
      <LottieView
        source={require("../assets/animations/intro.json")}
        autoPlay
        loop={false}
        onAnimationFinish={goNext}
        style={styles.animation}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: 280,
    height: 280,
  },
});
