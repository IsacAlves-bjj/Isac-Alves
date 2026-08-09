import type { LeadAnswerInput, TriageQuestion } from "../api/types";

// Ordem do funil de triagem — TRIAGEM.md §1. A API devolve as perguntas
// ordenadas por seção alfabeticamente (ver triage.routes.ts), então
// reagrupamos aqui na ordem clínica correta antes de exibir os steps.
const SECTION_ORDER = [
  "geral",
  "dor",
  "funcional",
  "historico",
  "especifica",
  "red_flag",
  "objetivo",
  "logistica",
] as const;

const SECTION_LABELS: Record<string, string> = {
  geral: "Sobre o problema",
  dor: "Sobre a dor",
  funcional: "Impacto no dia a dia",
  historico: "Histórico",
  especifica: "Detalhes específicos",
  red_flag: "Sinais de atenção",
  objetivo: "Seu objetivo",
  logistica: "Disponibilidade",
};

export interface TriageStep {
  section: string;
  label: string;
  questions: TriageQuestion[];
}

/** Agrupa a lista plana de perguntas em steps, na ordem do funil clínico, omitindo seções vazias. */
export function buildTriageSteps(questions: TriageQuestion[]): TriageStep[] {
  const bySection = new Map<string, TriageQuestion[]>();
  for (const question of questions) {
    const list = bySection.get(question.section) ?? [];
    list.push(question);
    bySection.set(question.section, list);
  }

  const orderedSections = [
    ...SECTION_ORDER,
    ...[...bySection.keys()].filter((section) => !(SECTION_ORDER as readonly string[]).includes(section)),
  ];

  return orderedSections
    .filter((section) => bySection.has(section))
    .map((section) => ({
      section,
      label: SECTION_LABELS[section] ?? section,
      questions: [...(bySection.get(section) ?? [])].sort((a, b) => a.order - b.order),
    }));
}

function findAnswer(
  questions: TriageQuestion[],
  answers: Record<string, string>,
  predicate: (q: TriageQuestion) => boolean
): string | undefined {
  const candidates = questions.filter(predicate).sort((a, b) => a.order - b.order);
  for (const question of candidates) {
    const value = answers[question.id];
    if (value) return value;
  }
  return undefined;
}

export interface ExtractedLeadFields {
  chiefComplaint?: string;
  painScore?: number;
  goal?: string;
  city?: string;
  preferredTimes?: string;
}

/**
 * Extrai os campos "resumo" do Lead (chiefComplaint, painScore, goal,
 * city, preferredTimes) a partir das respostas do questionário dinâmico.
 *
 * As perguntas vêm do banco (configuráveis pela fisioterapeuta, ver
 * TriageQuestion no schema), então não há IDs fixos para amarrar — a
 * heurística usa tipo + seção + palavras-chave do texto, alinhada ao
 * conteúdo padrão semeado em backend/prisma/seed.ts. Se a fisioterapeuta
 * reescrever essas perguntas de um jeito muito diferente, o pior caso é
 * o campo de resumo ficar vazio (a resposta continua salva em `answers`,
 * nada se perde).
 */
export function extractLeadFields(
  questions: TriageQuestion[],
  answers: Record<string, string>
): ExtractedLeadFields {
  const chiefComplaint = findAnswer(
    questions,
    answers,
    (q) => q.section === "geral" && q.type === "LONG_TEXT"
  );

  const painScoreRaw = findAnswer(questions, answers, (q) => q.section === "dor" && q.type === "SCALE_0_10");
  const painScore = painScoreRaw !== undefined ? Number(painScoreRaw) : undefined;

  const goal = findAnswer(questions, answers, (q) => q.section === "objetivo" && q.type === "LONG_TEXT");

  const city = findAnswer(
    questions,
    answers,
    (q) => q.section === "logistica" && /cidade|regi[aã]o/i.test(q.text)
  );

  const preferredTimes = findAnswer(
    questions,
    answers,
    (q) => q.section === "logistica" && /dia|turno|hor[aá]rio/i.test(q.text)
  );

  return {
    chiefComplaint,
    painScore: Number.isFinite(painScore) ? painScore : undefined,
    goal,
    city,
    preferredTimes,
  };
}

export function answersMapToPayload(answers: Record<string, string>): LeadAnswerInput[] {
  return Object.entries(answers)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([questionId, value]) => ({ questionId, value }));
}
