// Tipos espelhando o retorno da API (backend/prisma/schema.prisma é a
// fonte de verdade do modelo — aqui só o formato serializado em JSON).

export type StaffRole = "ADMIN" | "FISIOTERAPEUTA";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  document?: string | null;
}

export type LeadStatus = "NOVO" | "EM_REVISAO" | "AGENDADO" | "DESCARTADO";
export type LeadPriority = "NORMAL" | "ATENCAO_CLINICA" | "REVISAO_MANUAL";

export type QuestionType =
  | "TEXT"
  | "LONG_TEXT"
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "SCALE_0_10"
  | "BOOLEAN"
  | "BODY_MAP";

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
  type: QuestionType;
  options: string | null;
  isRedFlag: boolean;
  required: boolean;
  order: number;
  active: boolean;
}

export interface LeadAnswer {
  id: string;
  leadId: string;
  questionId: string;
  question: TriageQuestion;
  value: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string | null;
  categoryId: string;
  category: TriageCategory;
  chiefComplaint: string | null;
  painScore: number | null;
  goal: string | null;
  city: string | null;
  preferredTimes: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  clinicalSummary: string | null;
  suggestedCare: string | null;
  answers?: LeadAnswer[];
  patient?: Patient | null;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | "AGENDADO"
  | "CONFIRMADO"
  | "REALIZADO"
  | "FALTOU"
  | "CANCELADO";

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  location: string | null;
  notes: string | null;
  confirmationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  appointmentId: string;
  appointment?: Appointment;
  authorId: string;
  author?: { name: string };
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  painScore: number | null;
  createdAt: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  goal: string;
  careLine: string;
  startDate: string | null;
  sessionsPlanned: number | null;
  active: boolean;
  createdAt: string;
}

export type ExamRequestStatus = "SOLICITADO" | "RECEBIDO";

export interface ExamRequest {
  id: string;
  patientId: string;
  appointmentId: string | null;
  description: string;
  status: ExamRequestStatus;
  requestedAt: string;
  resultNotes: string | null;
  resultReceivedAt: string | null;
}

export interface PatientFeedback {
  id: string;
  patientId: string;
  appointmentId: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface SessionsSummary {
  planned: number | null;
  completed: number;
  startDate: string | null;
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
  lead?: Lead | null;
  appointments?: Appointment[];
  clinicalRecords?: ClinicalRecord[];
  treatmentPlans?: TreatmentPlan[];
  transactions?: Transaction[];
  examRequests?: ExamRequest[];
  feedbacks?: PatientFeedback[];
  sessionsSummary?: SessionsSummary;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "RECEIVABLE" | "PAYABLE";
export type TransactionStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentMethod =
  | "dinheiro"
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "transferencia";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  transferencia: "Transferência",
};

export interface Supplier {
  id: string;
  name: string;
  category: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: PaymentMethod | null;
  patientId: string | null;
  patient?: Patient | null;
  appointmentId: string | null;
  appointment?: Appointment | null;
  supplierId: string | null;
  supplier?: Supplier | null;
  cashSessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  number: string;
  issuedAt: string;
  transaction: Transaction;
}

export interface CashSession {
  id: string;
  openedById: string;
  openedBy?: { name: string };
  openedAt: string;
  closedAt: string | null;
  openingBalance: number;
  closingBalance: number | null;
  notes: string | null;
  transactions?: Transaction[];
}

export interface DashboardSummary {
  pendingLeads: number;
  attentionLeads: number;
  todayAppointments: Appointment[];
  cashOpen: boolean;
  cashSessionId: string | null;
  upcomingReceivables: Transaction[];
  upcomingPayables: Transaction[];
  upcomingReceivablesTotal: number;
  upcomingPayablesTotal: number;
}
