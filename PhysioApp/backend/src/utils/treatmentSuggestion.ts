// Implementa PhysioApp/docs/TRIAGEM.md §9 — "Da triagem à sugestão de
// tratamento". Gera um resumo clínico legível e uma sugestão inicial de
// linha de cuidado a partir dos dados do lead. Isto NÃO é um diagnóstico:
// é um ponto de partida editável pela fisioterapeuta antes do atendimento.

interface SuggestionInput {
  categoryTitle: string;
  categoryKey: string;
  chiefComplaint: string | null;
  painScore: number | null;
  hasRedFlag: boolean;
  isOtherOrIncomplete: boolean;
}

// Linhas de cuidado por categoria (TRIAGEM.md §9.2). Mantidas aqui como
// mapa simples e explícito — a fisioterapeuta pode editar o texto
// diretamente neste arquivo ou, em uma futura extensão, via tela de
// configurações que grava por cima destes defaults em banco.
const CARE_LINES: Record<string, string> = {
  coluna:
    "Avaliação postural e funcional da coluna, terapia manual, fortalecimento de core, reavaliação em 4 sessões.",
  ombro:
    "Avaliação da amplitude de movimento e força do manguito rotador, terapia manual, exercícios progressivos, reavaliação em 4 sessões.",
  joelho:
    "Avaliação funcional do joelho e cadeia cinética, controle de edema se presente, fortalecimento progressivo, reavaliação em 4 sessões.",
  quadril:
    "Avaliação de quadril e pelve, mobilidade articular, fortalecimento de glúteo médio/core, reavaliação em 4 sessões.",
  tornozelo_pe:
    "Avaliação de estabilidade e mobilidade de tornozelo/pé, controle de edema se agudo, propriocepção, reavaliação em 4 sessões.",
  cotovelo_punho_mao:
    "Avaliação funcional de membro superior distal, terapia manual, exercícios de força e mobilidade, reavaliação em 4 sessões.",
  pos_operatorio:
    "Confirmar liberação e restrições médicas antes de iniciar. Reabilitação progressiva conforme protocolo da cirurgia, reavaliação a cada 2 sessões.",
  neurologico:
    "Avaliação neurofuncional completa, definição de objetivos com paciente/família, plano individualizado, reavaliação em 6 sessões.",
  gestante_pos_parto:
    "Avaliação uroginecológica e musculoesquelética, adequação à fase gestacional/puerperal, reavaliação em 4 sessões.",
  esportiva_performance:
    "Avaliação funcional e de performance, análise de gesto esportivo, plano de fortalecimento/prevenção, reavaliação em 4 sessões.",
  postural_dor_cronica:
    "Avaliação biopsicossocial da dor crônica, educação em dor, exercício gradual, reavaliação em 6 sessões.",
  respiratoria:
    "Avaliação da função respiratória, treino muscular respiratório, reavaliação em 4 sessões.",
  outro:
    "Categoria não padronizada — revisar respostas manualmente antes de sugerir linha de cuidado.",
};

export function buildClinicalSummary(input: SuggestionInput): string {
  const parts: string[] = [];
  parts.push(`Paciente relata ${input.chiefComplaint ?? "queixa não detalhada"}`);
  parts.push(`(categoria: ${input.categoryTitle})`);
  if (input.painScore !== null) {
    parts.push(`EVA ${input.painScore}/10`);
  }
  parts.push(input.hasRedFlag ? "com sinal de alerta identificado" : "sem sinais de alerta");
  return parts.join(", ") + ".";
}

export function suggestCareLine(input: SuggestionInput): string {
  if (input.isOtherOrIncomplete) {
    return CARE_LINES.outro;
  }
  const base = CARE_LINES[input.categoryKey] ?? CARE_LINES.outro;
  if (input.hasRedFlag) {
    return (
      "ATENÇÃO: sinal de alerta identificado na triagem — avaliar necessidade de encaminhamento médico antes de iniciar. " +
      base
    );
  }
  return base;
}

export function computePriority(
  hasRedFlag: boolean,
  isOtherOrIncomplete: boolean
): "NORMAL" | "ATENCAO_CLINICA" | "REVISAO_MANUAL" {
  if (hasRedFlag) return "ATENCAO_CLINICA";
  if (isOtherOrIncomplete) return "REVISAO_MANUAL";
  return "NORMAL";
}
