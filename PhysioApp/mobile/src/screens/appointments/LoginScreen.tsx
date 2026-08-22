import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ApiError } from "../../api/client";
import { requestPatientOtp } from "../../api/auth";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type { AppointmentsScreenProps } from "../../navigation/types";

export function LoginScreen({ navigation }: AppointmentsScreenProps<"Login">) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneValid = phone.trim().replace(/\D/g, "").length >= 8;

  async function handleSendCode() {
    if (!phoneValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      await requestPatientOtp(phone.trim());
      navigation.navigate("Otp", { phone: phone.trim() });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={typography.title}>Seus agendamentos</Text>
      <Text style={[typography.subtitle, styles.subtitle]}>
        Informe o telefone que você usou na triagem para ver suas sessões marcadas.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Telefone / WhatsApp</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="(11) 99999-9999"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />
      </View>

      {error ? <Text style={styles.errorHint}>{error}</Text> : null}

      <View style={styles.actions}>
        <PrimaryButton label="Enviar código" onPress={handleSendCode} disabled={!phoneValid} loading={loading} />
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
    marginBottom: spacing.sm,
  },
  actions: {
    marginTop: spacing.md,
  },
});
