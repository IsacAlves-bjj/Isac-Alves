import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { Patient } from "../api/types";

const STORAGE_KEY = "@physioapp/patient-session";

interface StoredSession {
  token: string;
  patient: Patient;
}

interface PatientAuthValue {
  /** null enquanto a sessão salva ainda está sendo carregada do armazenamento local. */
  isRestoring: boolean;
  token: string | null;
  patient: Patient | null;
  signIn: (session: StoredSession) => Promise<void>;
  signOut: () => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthValue | null>(null);

/**
 * Sessão do paciente (telefone + código) persistida localmente, para não
 * pedir login toda vez que o app abre. Envolve toda a aba "Meus
 * agendamentos", que decide entre o fluxo de login e a lista conforme
 * `token` estar presente.
 */
export function PatientAuthProvider({ children }: PropsWithChildren) {
  const [isRestoring, setIsRestoring] = useState(true);
  const [session, setSession] = useState<StoredSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw) as StoredSession;
        setSession(parsed);
      })
      .catch(() => {
        // Sessão corrompida ou indisponível: trata como deslogado, sem travar o app.
      })
      .finally(() => {
        if (!cancelled) setIsRestoring(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (newSession: StoredSession) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo<PatientAuthValue>(
    () => ({
      isRestoring,
      token: session?.token ?? null,
      patient: session?.patient ?? null,
      signIn,
      signOut,
    }),
    [isRestoring, session, signIn, signOut]
  );

  return <PatientAuthContext.Provider value={value}>{children}</PatientAuthContext.Provider>;
}

export function usePatientAuth(): PatientAuthValue {
  const ctx = useContext(PatientAuthContext);
  if (!ctx) throw new Error("usePatientAuth deve ser usado dentro de PatientAuthProvider");
  return ctx;
}
