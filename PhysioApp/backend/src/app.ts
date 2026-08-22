import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { triageRouter } from "./routes/triage.routes";
import { leadsRouter } from "./routes/leads.routes";
import { patientsRouter } from "./routes/patients.routes";
import { appointmentsRouter } from "./routes/appointments.routes";
import { clinicalRecordsRouter } from "./routes/clinicalRecords.routes";
import { financeRouter } from "./routes/finance.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { examRequestsRouter } from "./routes/examRequests.routes";
import { feedbackRouter } from "./routes/feedback.routes";
import { referralsRouter } from "./routes/referrals.routes";

export const app = express();

// CORS_ORIGIN aceita uma lista separada por vírgula (painel web + app do
// paciente, quando publicados em domínios diferentes). Sem a variável,
// libera qualquer origem — conveniente em desenvolvimento/teste, mas deve
// ser restrito antes de ir ao ar com pacientes reais.
const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim());
app.use(cors({ origin: corsOrigin && corsOrigin.length > 0 ? corsOrigin : true }));

// Limite alto o bastante para as fotos/documentos em data URL (avatar até
// ~2MB, tabela de preços até ~6MB — ver auth.routes.ts) — o default do
// express (100kb) rejeitaria esses uploads com 413.
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/triage", triageRouter);
app.use("/leads", leadsRouter);
app.use("/patients", patientsRouter);
app.use("/appointments", appointmentsRouter);
app.use("/clinical-records", clinicalRecordsRouter);
app.use("/finance", financeRouter);
app.use("/dashboard", dashboardRouter);
app.use("/exam-requests", examRequestsRouter);
app.use("/feedback", feedbackRouter);
app.use("/referrals", referralsRouter);

// Sempre por último: captura erros lançados por qualquer rota acima.
app.use(errorHandler);
