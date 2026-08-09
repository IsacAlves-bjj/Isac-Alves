import { CommonActions } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type { TriageScreenProps } from "../../navigation/types";

// clinicalSummary/suggestedCare vêm prontos do backend (TRIAGEM.md §9).
// São exibidos como confirmação acolhedora do que foi entendido — nunca
// como diagnóstico fechado, por isso o texto de apoio deixa isso claro.
export function ConfirmationScreen({ navigation, route }: TriageScreenProps<"Confirmation">) {
  const { lead } = route.params;

  function backToHome() {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Home" }] }));
  }

  return (
    <Screen>
      <View style={styles.badge}>
        <Text style={styles.badgeIcon}>💚</Text>
      </View>

      <Text style={typography.title}>Recebemos suas informações!</Text>
      <Text style={[typography.subtitle, styles.subtitle]}>
        Obrigado, {lead.name.split(" ")[0]}. Vamos analisar com carinho e entrar em contato em breve
        pelo telefone {lead.phone}.
      </Text>

      {lead.clinicalSummary ? (
        <View style={styles.card}>
          <Text style={typography.sectionLabel}>O QUE ENTENDEMOS</Text>
          <Text style={[typography.body, styles.cardText]}>{lead.clinicalSummary}</Text>
        </View>
      ) : null}

      {lead.suggestedCare ? (
        <View style={styles.card}>
          <Text style={typography.sectionLabel}>PRÓXIMOS PASSOS SUGERIDOS</Text>
          <Text style={[typography.body, styles.cardText]}>{lead.suggestedCare}</Text>
          <Text style={styles.disclaimer}>
            Isto é só um ponto de partida — a avaliação e o plano definitivo são feitos
            presencialmente.
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton label="Voltar ao início" onPress={backToHome} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  badgeIcon: {
    fontSize: 30,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardText: {
    marginTop: spacing.xs,
  },
  disclaimer: {
    ...typography.caption,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  actions: {
    marginTop: spacing.lg,
  },
});
