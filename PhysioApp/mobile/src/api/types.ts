// Tipos espelhando exatamente o schema Prisma e os schemas Zod do backend
// (ver backend/prisma/schema.prisma e backend/src/routes/*.ts). Mantidos
// à mão (sem geração automática) — qualquer mudança de contrato no
// backend deve ser refletida aqui.

export type TriageQuestionType =
  | "TEXT"
  | "LONG_TEXT"
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "SCALE_0_10"
  | "BOOLEAN"
  | "BODY_MAP";

/** Ordem do funil de triagem, conforme TRIAGEM.md §1. Seções fora desta lista não são esperadas. */
export type TriageSection =
  | "geral"
  | "dor"
  | "funcional"
  | "historico"
  | "especifica"
  | "red_flag"
  | "objetivo"
  | "logistica";

export interface TriageCategory {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  order: number;
  active: boolean;
}

export interface TriageQuestion {
  id: string;
  categoryId: string | null;
  section: string;
  text: string;
  type: TriageQuestionType;
  /** JSON stringificado de string[] quando o tipo tem opções (SINGLE_CHOICE/MULTI_CHOICE); null caso contrário. */
  options: string | null;
  isRedFlag: boolean;
  required: boolean;
  order: number;
  active: boolean;
}

export interface LeadAnswerInput {
  questionId: string;
  value: string;
}

export interface CreateLeadPayload {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  categoryKey: string;
  chiefComplaint?: string;
  painScore?: number;
  goal?: string;
  city?: string;
  preferredTimes?: string;
  answers: LeadAnswerInput[];
}

export type LeadPriority = "NORMAL" | "ATENCAO_CLINICA" | "REVISAO_MANUAL";
export type LeadStatus = "NOVO" | "EM_REVISAO" | "AGENDADO" | "DESCARTADO";

export interface LeadResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string | null;
  categoryId: string;
  chiefComplaint: string | null;
  painScore: number | null;
  goal: string | null;
  city: string | null;
  preferredTimes: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  clinicalSummary: string | null;
  suggestedCare: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  document: string | null;
  address: string | null;
  notes: string | null;
  leadId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = "AGENDADO" | "CONFIRMADO" | "REALIZADO" | "FALTOU" | "CANCELADO";

export interface Appointment {
  id: string;
  patientId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
