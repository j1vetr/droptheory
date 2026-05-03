import LottieView from "lottie-react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const LOTTIE_DURATION_MS = 2500;
const MIN_VISIBLE_MS = 2600;

export default function SplashScreen() {
  const finishedRef = useRef(false);
  const mountedAtRef = useRef<number>(Date.now());
  const lottieRef = useRef<LottieView>(null);

  const goNext = () => {
    if (finishedRef.current) return;
    const elapsed = Date.now() - mountedAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    finishedRef.current = true;
    setTimeout(() => router.replace("/menu"), remaining);
  };

  useEffect(() => {
    mountedAtRef.current = Date.now();
    lottieRef.current?.reset();
    lottieRef.current?.play();
    const fallback = setTimeout(goNext, LOTTIE_DURATION_MS + 1500);
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
        ref={lottieRef}
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
