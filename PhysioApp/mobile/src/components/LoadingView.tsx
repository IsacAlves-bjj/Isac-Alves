import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme/theme";

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = "Carregando..." }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[typography.body, styles.message]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  message: {
    marginTop: spacing.md,
    color: colors.textMuted,
  },
});
