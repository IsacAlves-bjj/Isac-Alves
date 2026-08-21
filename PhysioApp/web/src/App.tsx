import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { AppLayout } from "./layout/AppLayout";
import { FinanceLayout } from "./layout/FinanceLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LeadsListPage } from "./pages/leads/LeadsListPage";
import { LeadDetailPage } from "./pages/leads/LeadDetailPage";
import { PatientsListPage } from "./pages/patients/PatientsListPage";
import { PatientDetailPage } from "./pages/patients/PatientDetailPage";
import { AgendaPage } from "./pages/agenda/AgendaPage";
import { CashPage } from "./pages/finance/CashPage";
import { ReceivablesPage } from "./pages/finance/ReceivablesPage";
import { PayablesPage } from "./pages/finance/PayablesPage";
import { SuppliersPage } from "./pages/finance/SuppliersPage";
import { ReportsPage } from "./pages/finance/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsListPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="pacientes" element={<PatientsListPage />} />
          <Route path="pacientes/:id" element={<PatientDetailPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="financeiro" element={<FinanceLayout />}>
            <Route index element={<Navigate to="caixa" replace />} />
            <Route path="caixa" element={<CashPage />} />
            <Route path="receber" element={<ReceivablesPage />} />
            <Route path="pagar" element={<PayablesPage />} />
            <Route path="fornecedores" element={<SuppliersPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
          </Route>
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
