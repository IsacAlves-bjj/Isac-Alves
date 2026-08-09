import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/leads", label: "Leads / Triagens" },
  { to: "/pacientes", label: "Pacientes" },
  { to: "/agenda", label: "Agenda" },
  { to: "/financeiro", label: "Financeiro" },
  { to: "/configuracoes", label: "Configurações" },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">Fx</span>
          <span>PhysioApp</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? " sidebar-link-active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            <span>{user?.role === "ADMIN" ? "Administradora" : "Fisioterapeuta"}</span>
          </div>
          <button type="button" className="btn btn-secondary btn-block" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
