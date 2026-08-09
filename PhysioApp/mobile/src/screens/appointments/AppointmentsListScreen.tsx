import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { LoadingView } from "../../components/LoadingView";
import { ErrorView } from "../../components/ErrorView";
import { getMyAppointments } from "../../api/appointments";
import { useAsync } from "../../hooks/useAsync";
import { usePatientAuth } from "../../auth/PatientAuthContext";
import { formatAppointmentDate, formatAppointmentStatus, formatAppointmentTime } from "../../utils/format";
import { colors, radius, spacing, typography } from "../../theme/theme";
import type { Appointment, AppointmentStatus } from "../../api/types";

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  AGENDADO: colors.primary,
  CONFIRMADO: colors.primary,
  REALIZADO: colors.textMuted,
  FALTOU: colors.danger,
  CANCELADO: colors.danger,
};

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formatAppointmentDate(appointment.startsAt)}</Text>
        <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[appointment.status] }]}>
          <Text style={styles.statusText}>{formatAppointmentStatus(appointment.status)}</Text>
        </View>
      </View>
      <Text style={styles.cardTime}>
        {formatAppointmentTime(appointment.startsAt)} – {formatAppointmentTime(appointment.endsAt)}
      </Text>
      {appointment.location ? <Text style={typography.caption}>{appointment.location}</Text> : null}
      {appointment.notes ? <Text style={[typography.caption, styles.notes]}>{appointment.notes}</Text> : null}
    </View>
  );
}

export function AppointmentsListScreen() {
  const { token, patient, signOut } = usePatientAuth();

  const { data: appointments, loading, error, refetch } = useAsync(
    () => getMyAppointments(token as string),
    [token]
  );

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <View>
          <Text style={typography.title}>Meus agendamentos</Text>
          {patient ? <Text style={typography.caption}>{patient.name} · {patient.phone}</Text> : null}
        </View>
        <Pressable onPress={signOut} accessibilityRole="button">
          <Text style={styles.signOut}>Sair</Text>
        </Pressable>
      </View>

      {loading ? <LoadingView message="Carregando seus agendamentos..." /> : null}
      {error ? <ErrorView message={error} onRetry={refetch} /> : null}

      {!loading && !error ? (
        <FlatList
          style={styles.list}
          data={appointments ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AppointmentCard appointment={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={typography.body}>Você ainda não tem agendamentos marcados.</Text>
              <Text style={[typography.caption, styles.emptyHint]}>
                Assim que sua avaliação for agendada, ela aparece aqui.
              </Text>
            </View>
          }
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  signOut: {
    color: colors.primaryDark,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  cardDate: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  cardTime: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  notes: {
    marginTop: spacing.xs,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing.xl,
  },
  emptyHint: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
