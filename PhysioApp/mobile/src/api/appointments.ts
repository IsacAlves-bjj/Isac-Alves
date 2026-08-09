import { apiRequest } from "./client";
import type { Appointment } from "./types";

/** GET /appointments/me — agendamentos do paciente autenticado. Exige token JWT de paciente. */
export function getMyAppointments(token: string): Promise<Appointment[]> {
  return apiRequest<Appointment[]>("/appointments/me", { token });
}
