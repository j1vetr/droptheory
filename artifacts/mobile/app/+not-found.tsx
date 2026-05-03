import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useLanguage } from "@/context/LanguageContext";

export default function NotFoundScreen() {
  const { t } = useLanguage();

  return (
    <>
      <Stack.Screen options={{ title: "–" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{t.notFound}</Text>
        <Link href="/menu" style={styles.link}>
          <Text style={styles.linkText}>{t.goHome}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#6B6354",
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  linkText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#C8A96E",
    letterSpacing: 0.5,
  },
});
