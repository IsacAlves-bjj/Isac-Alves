import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import type { Patient } from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { PatientForm } from "../../components/PatientForm";
import type { PatientFormValues } from "../../components/PatientForm";
import { Modal } from "../../components/Modal";

export function PatientsListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function load(term?: string) {
    setLoading(true);
    setError(null);
    try {
      const query = term ? `?search=${encodeURIComponent(term)}` : "";
      const data = await api.get<Patient[]>(`/patients${query}`);
      setPatients(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar pacientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search || undefined), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleCreate(values: PatientFormValues) {
    const patient = await api.post<Patient>("/patients", values);
    setShowForm(false);
    navigate(`/pacientes/${patient.id}`);
  }

  return (
    <div>
      <header className="page-header page-header-actions">
        <div>
          <h1>Pacientes</h1>
          <p>Cadastro e histórico de todos os pacientes.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Novo paciente
        </button>
      </header>

      <div className="filter-bar">
        <input
          className="input input-search"
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <LoadState
        loading={loading}
        error={error}
        onRetry={() => load(search || undefined)}
        empty={patients.length === 0}
        emptyMessage="Nenhum paciente encontrado."
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>E-mail</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <Link to={`/pacientes/${patient.id}`} className="table-link">
                      {patient.name}
                    </Link>
                  </td>
                  <td>{patient.phone}</td>
                  <td>{patient.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>

      {showForm && (
        <Modal title="Novo paciente" onClose={() => setShowForm(false)}>
          <PatientForm submitLabel="Cadastrar paciente" onSubmit={handleCreate} />
        </Modal>
      )}
    </div>
  );
}
