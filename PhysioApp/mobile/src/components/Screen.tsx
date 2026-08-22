import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme/theme";

interface ScreenProps extends PropsWithChildren {
  /** Quando true, o conteúdo rola (telas longas como o questionário); quando false, ocupa a tela fixa (ex.: telas com botão fixo no rodapé). */
  scroll?: boolean;
  style?: ViewStyle;
}

/** Casca padrão de tela: fundo do tema + respeito à área segura + padding consistente. */
export function Screen({ children, scroll = true, style }: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, style]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={[styles.fixedContent, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  fixedContent: {
    flex: 1,
    padding: spacing.lg,
  },
});
