import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ApiError } from "../../api/client";
import { verifyPatientOtp } from "../../api/auth";
import { usePatientAuth } from "../../auth/PatientAuthContext";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type { AppointmentsScreenProps } from "../../navigation/types";

export function OtpScreen({ route }: AppointmentsScreenProps<"Otp">) {
  const { phone } = route.params;
  const { signIn } = usePatientAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (code.trim().length < 4 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { token, patient } = await verifyPatientOtp(phone, code.trim());
      // Ao entrar no context, AppointmentsNavigator troca este stack pela
      // tela de lista automaticamente (ver navigation/AppointmentsNavigator.tsx).
      await signIn({ token, patient });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível confirmar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={typography.title}>Digite o código</Text>
      <Text style={[typography.subtitle, styles.subtitle]}>
        Enviamos um código de verificação para {phone}.
      </Text>
      {__DEV__ ? (
        <Text style={styles.devHint}>Ambiente de testes: use o código 123456.</Text>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>Código</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      {error ? <Text style={styles.errorHint}>{error}</Text> : null}

      <View style={styles.actions}>
        <PrimaryButton label="Confirmar" onPress={handleConfirm} disabled={code.trim().length < 4} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  devHint: {
    ...typography.caption,
    marginBottom: spacing.lg,
    color: colors.primaryDark,
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
    fontSize: 20,
    letterSpacing: 4,
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
