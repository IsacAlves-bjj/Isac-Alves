export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const LEAD_PRIORITY_LABEL: Record<string, string> = {
  NORMAL: "Normal",
  ATENCAO_CLINICA: "Atenção Clínica",
  REVISAO_MANUAL: "Revisão Manual",
};

const LEAD_PRIORITY_TONE: Record<string, BadgeTone> = {
  NORMAL: "neutral",
  ATENCAO_CLINICA: "danger",
  REVISAO_MANUAL: "warning",
};

export function LeadPriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge tone={LEAD_PRIORITY_TONE[priority] ?? "neutral"}>
      {LEAD_PRIORITY_LABEL[priority] ?? priority}
    </Badge>
  );
}

const LEAD_STATUS_LABEL: Record<string, string> = {
  NOVO: "Novo",
  EM_REVISAO: "Em Revisão",
  AGENDADO: "Agendado",
  DESCARTADO: "Descartado",
};

const LEAD_STATUS_TONE: Record<string, BadgeTone> = {
  NOVO: "info",
  EM_REVISAO: "warning",
  AGENDADO: "success",
  DESCARTADO: "neutral",
};

export function LeadStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={LEAD_STATUS_TONE[status] ?? "neutral"}>{LEAD_STATUS_LABEL[status] ?? status}</Badge>
  );
}

const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  REALIZADO: "Realizado",
  FALTOU: "Faltou",
  CANCELADO: "Cancelado",
};

const APPOINTMENT_STATUS_TONE: Record<string, BadgeTone> = {
  AGENDADO: "info",
  CONFIRMADO: "success",
  REALIZADO: "neutral",
  FALTOU: "danger",
  CANCELADO: "danger",
};

export function AppointmentStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={APPOINTMENT_STATUS_TONE[status] ?? "neutral"}>
      {APPOINTMENT_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

const TRANSACTION_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
};

const TRANSACTION_STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "danger",
  CANCELLED: "neutral",
};

export function TransactionStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={TRANSACTION_STATUS_TONE[status] ?? "neutral"}>
      {TRANSACTION_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
