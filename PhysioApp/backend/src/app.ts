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

export const app = express();

app.use(cors());
app.use(express.json());

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

// Sempre por último: captura erros lançados por qualquer rota acima.
app.use(errorHandler);
