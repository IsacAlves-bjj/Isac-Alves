import { apiRequest } from "./client";
import type { CreateLeadPayload, LeadResponse, TriageCategory, TriageQuestion } from "./types";

/** GET /triage/categories — as "caixinhas" exibidas na tela inicial. Público. */
export function getTriageCategories(): Promise<TriageCategory[]> {
  return apiRequest<TriageCategory[]>("/triage/categories");
}

/**
 * GET /triage/questions?category=<key> — perguntas gerais (categoryId
 * null) + específicas da categoria escolhida. Público.
 */
export function getTriageQuestions(categoryKey: string): Promise<TriageQuestion[]> {
  return apiRequest<TriageQuestion[]>(`/triage/questions?category=${encodeURIComponent(categoryKey)}`);
}

/** POST /leads — envia a triagem preenchida. Público. */
export function submitLead(payload: CreateLeadPayload): Promise<LeadResponse> {
  return apiRequest<LeadResponse>("/leads", { method: "POST", body: payload });
}
