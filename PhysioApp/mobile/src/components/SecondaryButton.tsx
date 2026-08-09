import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../theme/theme";

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Botão de ação secundária (ex.: "Voltar"), sem preenchimento sólido. */
export function SecondaryButton({ label, onPress, disabled }: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
