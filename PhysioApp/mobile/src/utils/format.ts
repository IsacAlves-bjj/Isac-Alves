const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Formata um ISO string para "segunda-feira, 12 de agosto". */
export function formatAppointmentDate(iso: string): string {
  const formatted = DATE_FORMATTER.format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatAppointmentTime(iso: string): string {
  return TIME_FORMATTER.format(new Date(iso));
}

const STATUS_LABELS: Record<string, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  REALIZADO: "Realizado",
  FALTOU: "Faltou",
  CANCELADO: "Cancelado",
};

export function formatAppointmentStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
