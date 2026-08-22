import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

interface StaffTokenPayload {
  sub: string;
  role: "ADMIN" | "FISIOTERAPEUTA";
  kind: "staff";
}

interface PatientTokenPayload {
  sub: string; // patientId
  kind: "patient";
}

export type AuthPayload = StaffTokenPayload | PatientTokenPayload;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

function secret() {
  return process.env.JWT_SECRET || "dev-secret";
}

export function signStaffToken(userId: string, role: "ADMIN" | "FISIOTERAPEUTA") {
  return jwt.sign({ sub: userId, role, kind: "staff" }, secret(), {
    expiresIn: "12h",
  });
}

export function signPatientToken(patientId: string) {
  return jwt.sign({ sub: patientId, kind: "patient" }, secret(), {
    expiresIn: "30d",
  });
}

// Exige qualquer usuário autenticado (staff ou paciente) e popula req.auth.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Token de autenticação ausente", 401);
  }

  try {
    const payload = jwt.verify(header.slice(7), secret()) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    throw new AppError("Token de autenticação inválido ou expirado", 401);
  }
}

// Exige que o usuário autenticado seja da equipe (painel da fisioterapeuta).
export function requireStaff(req: Request, _res: Response, next: NextFunction) {
  if (req.auth?.kind !== "staff") {
    throw new AppError("Acesso restrito à equipe", 403);
  }
  next();
}
