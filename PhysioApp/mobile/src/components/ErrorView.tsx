import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme/theme";
import { PrimaryButton } from "./PrimaryButton";

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

/** Estado de erro padrão para telas que dependem de uma chamada de API. */
export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[typography.body, styles.message]}>{message}</Text>
      {onRetry ? (
        <View style={styles.retryButton}>
          <PrimaryButton label="Tentar novamente" onPress={onRetry} />
        </View>
      ) : null}
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
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: "center",
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  retryButton: {
    alignSelf: "stretch",
  },
});
