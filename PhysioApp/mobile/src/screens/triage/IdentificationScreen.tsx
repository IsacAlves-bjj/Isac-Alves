import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ApiError } from "../../api/client";
import { submitLead } from "../../api/triage";
import { answersMapToPayload, extractLeadFields } from "../../utils/triageFlow";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type { TriageScreenProps } from "../../navigation/types";

const SOURCE_OPTIONS = ["Indicação", "Redes sociais", "Já sou paciente", "Convênio", "Outro"];

// TRIAGEM.md §2 — identificação do contato: nome, telefone, e-mail
// (opcional) e origem (não bloqueia o envio se não for respondida).
export function IdentificationScreen({ navigation, route }: TriageScreenProps<"Identification">) {
  const { category, questions, answers } = route.params;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const nameValid = name.trim().length >= 2;
  const phoneValid = phone.trim().replace(/\D/g, "").length >= 8;
  const emailValid = email.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = nameValid && phoneValid && emailValid;

  async function handleSubmit() {
    setAttempted(true);
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    const extracted = extractLeadFields(questions, answers);

    try {
      const lead = await submitLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() ? email.trim() : undefined,
        source,
        categoryKey: category.key,
        chiefComplaint: extracted.chiefComplaint,
        painScore: extracted.painScore,
        goal: extracted.goal,
        city: extracted.city,
        preferredTimes: extracted.preferredTimes,
        answers: answersMapToPayload(answers),
      });
      navigation.replace("Confirmation", { lead });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Não foi possível enviar suas respostas. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Text style={typography.title}>Quase lá</Text>
      <Text style={[typography.subtitle, styles.subtitle]}>
        Para eu poder te chamar e entrar em contato, preciso de alguns dados seus.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nome completo *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor={colors.textMuted}
        />
        {attempted && !nameValid ? <Text style={styles.errorHint}>Informe seu nome completo.</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Telefone / WhatsApp *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="(11) 99999-9999"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />
        {attempted && !phoneValid ? <Text style={styles.errorHint}>Informe um telefone válido.</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>E-mail (opcional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {attempted && !emailValid ? <Text style={styles.errorHint}>E-mail inválido.</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Como você chegou até mim? (opcional)</Text>
        <View style={styles.sourceList}>
          {SOURCE_OPTIONS.map((option) => {
            const selected = source === option;
            return (
              <Pressable
                key={option}
                onPress={() => setSource(selected ? undefined : option)}
                style={[styles.sourceChip, selected && styles.sourceChipSelected]}
              >
                <Text style={[styles.sourceChipLabel, selected && styles.sourceChipLabelSelected]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {submitError ? <Text style={styles.errorHint}>{submitError}</Text> : null}

      <View style={styles.actions}>
        <PrimaryButton label="Enviar" onPress={handleSubmit} loading={submitting} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    color: colors.text,
  },
  errorHint: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  sourceList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sourceChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  sourceChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  sourceChipLabel: {
    fontSize: 14,
    color: colors.text,
  },
  sourceChipLabelSelected: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  actions: {
    marginTop: spacing.lg,
  },
});
