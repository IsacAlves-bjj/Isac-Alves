import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/theme";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  /** Rótulo da etapa atual (ex.: "Dor"), exibido acima da barra. */
  label: string;
}

/** Indicador de progresso do questionário — "passo X de N" com barra preenchida. */
export function ProgressBar({ currentStep, totalSteps, label }: ProgressBarProps) {
  const ratio = totalSteps > 0 ? currentStep / totalSteps : 0;
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={typography.sectionLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.stepText}>
          {currentStep} de {totalSteps}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  stepText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
});
