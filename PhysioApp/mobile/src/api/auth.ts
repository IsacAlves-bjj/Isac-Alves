import { apiRequest } from "./client";
import type { Patient } from "./types";

/** POST /auth/patient/otp/request — dispara o "envio" do código (em dev, sempre 123456, logado no console do backend). */
export function requestPatientOtp(phone: string): Promise<{ sent: boolean }> {
  return apiRequest<{ sent: boolean }>("/auth/patient/otp/request", {
    method: "POST",
    body: { phone },
  });
}

/** POST /auth/patient/otp/verify — troca telefone+código pelo token JWT do paciente. */
export function verifyPatientOtp(phone: string, code: string): Promise<{ token: string; patient: Patient }> {
  return apiRequest<{ token: string; patient: Patient }>("/auth/patient/otp/verify", {
    method: "POST",
    body: { phone, code },
  });
}
