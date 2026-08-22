import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { to: "/financeiro/caixa", label: "Caixa" },
  { to: "/financeiro/receber", label: "Contas a Receber" },
  { to: "/financeiro/pagar", label: "Contas a Pagar" },
  { to: "/financeiro/fornecedores", label: "Fornecedores" },
  { to: "/financeiro/relatorios", label: "Relatórios" },
];

export function FinanceLayout() {
  return (
    <div>
      <header className="page-header">
        <h1>Financeiro</h1>
        <p>Caixa, contas a receber, contas a pagar e fornecedores.</p>
      </header>

      <div className="tab-bar">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `tab${isActive ? " tab-active" : ""}`}>
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
