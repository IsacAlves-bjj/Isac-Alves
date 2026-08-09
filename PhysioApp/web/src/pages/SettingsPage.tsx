import { useAuth } from "../auth/AuthContext";

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <header className="page-header">
        <h1>Configurações</h1>
        <p>Preferências da conta e do consultório.</p>
      </header>

      <section className="card">
        <h2>Conta</h2>
        <dl className="info-list">
          <div>
            <dt>Nome</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Perfil</dt>
            <dd>{user?.role === "ADMIN" ? "Administradora" : "Fisioterapeuta"}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>Linhas de cuidado e categorias de triagem</h2>
        <p className="muted">
          A edição das categorias e perguntas de triagem, e das regras de sugestão de linha de
          cuidado (ver TRIAGEM.md §9.2), ainda não tem tela própria — hoje são mantidas
          diretamente no banco de dados pela equipe técnica. Fica como próximo passo natural
          desta tela.
        </p>
      </section>
    </div>
  );
}
