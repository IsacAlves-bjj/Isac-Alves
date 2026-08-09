import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, radius, spacing, typography } from "../../theme/theme";
import { physioProfile } from "../../config/physioProfile";
import type { TriageScreenProps } from "../../navigation/types";

// Texto de consentimento — TRIAGEM.md §10 (LGPD art. 11, dado de saúde sensível).
export function ConsentScreen({ navigation, route }: TriageScreenProps<"Consent">) {
  const { category } = route.params;
  const [accepted, setAccepted] = useState(false);

  return (
    <Screen>
      <Text style={styles.eyebrow}>{category.title}</Text>
      <Text style={typography.title}>Antes de começar</Text>

      <View style={styles.card}>
        <Text style={[typography.body, styles.paragraph]}>
          As próximas perguntas envolvem informações sobre sua saúde. Isso nos ajuda a entender seu
          caso antes do primeiro contato.
        </Text>
        <Text style={[typography.body, styles.paragraph]}>
          Seus dados serão usados exclusivamente para avaliação fisioterapêutica por{" "}
          {physioProfile.name} e não serão compartilhados com terceiros.
        </Text>
        <Text style={[typography.body, styles.paragraph]}>
          Você pode pedir a exclusão dos seus dados a qualquer momento, falando diretamente com{" "}
          {physioProfile.name}.
        </Text>
      </View>

      <Pressable
        onPress={() => setAccepted((prev) => !prev)}
        style={styles.checkboxRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
          {accepted ? <Text style={styles.checkboxMark}>✓</Text> : null}
        </View>
        <Text style={[typography.body, styles.checkboxLabel]}>
          Li e concordo com o uso das minhas informações para esta avaliação.
        </Text>
      </Pressable>

      <View style={styles.actions}>
        <PrimaryButton
          label="Continuar"
          disabled={!accepted}
          onPress={() => navigation.navigate("Questionnaire", { category })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...typography.sectionLabel,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  paragraph: {
    marginBottom: spacing.sm,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxMark: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  checkboxLabel: {
    flex: 1,
  },
  actions: {
    marginTop: "auto",
  },
});
