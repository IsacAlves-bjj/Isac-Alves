import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import type { Appointment, ClinicalRecord, Patient } from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { PatientForm } from "../../components/PatientForm";
import type { PatientFormValues } from "../../components/PatientForm";
import { AppointmentForm } from "../../components/AppointmentForm";
import type { AppointmentFormValues } from "../../components/AppointmentForm";
import { ClinicalRecordForm } from "../../components/ClinicalRecordForm";
import type { ClinicalRecordFormValues } from "../../components/ClinicalRecordForm";
import { AppointmentStatusBadge } from "../../components/Badge";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/format";
import { Modal } from "../../components/Modal";

type TabKey = "visao-geral" | "agendamentos" | "prontuario";

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("visao-geral");
  const [showEdit, setShowEdit] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Patient>(`/patients/${id}`);
      setPatient(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar paciente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleEdit(values: PatientFormValues) {
    if (!id) return;
    const updated = await api.put<Patient>(`/patients/${id}`, values);
    setPatient((prev) => (prev ? { ...prev, ...updated } : updated));
    setShowEdit(false);
  }

  async function handleCreateAppointment(values: AppointmentFormValues) {
    await api.post<Appointment>("/appointments", values);
    setShowNewAppointment(false);
    await load();
  }

  async function handleCreateRecord(values: ClinicalRecordFormValues) {
    if (!id) return;
    await api.post<ClinicalRecord>("/clinical-records", { patientId: id, ...values });
    await load();
  }

  const appointments = patient?.appointments ?? [];
  const clinicalRecords = patient?.clinicalRecords ?? [];
  const recordedAppointmentIds = new Set(clinicalRecords.map((r) => r.appointmentId));
  const availableAppointments = appointments.filter((a) => !recordedAppointmentIds.has(a.id));

  return (
    <div>
      <header className="page-header">
        <Link to="/pacientes" className="back-link">
          ← Pacientes
        </Link>
        <h1>{patient ? patient.name : "Ficha do paciente"}</h1>
      </header>

      <LoadState loading={loading} error={error} onRetry={load}>
        {patient && (
          <>
            <div className="tab-bar">
              <button type="button" className={tab === "visao-geral" ? "tab tab-active" : "tab"} onClick={() => setTab("visao-geral")}>
                Visão geral
              </button>
              <button type="button" className={tab === "agendamentos" ? "tab tab-active" : "tab"} onClick={() => setTab("agendamentos")}>
                Agendamentos ({appointments.length})
              </button>
              <button type="button" className={tab === "prontuario" ? "tab tab-active" : "tab"} onClick={() => setTab("prontuario")}>
                Prontuário ({clinicalRecords.length})
              </button>
            </div>

            {tab === "visao-geral" && (
              <div className="detail-grid">
                <div className="detail-main">
                  <section className="card">
                    <div className="card-title-row">
                      <h2>Dados cadastrais</h2>
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => setShowEdit(true)}>
                        Editar
                      </button>
                    </div>
                    <dl className="info-list">
                      <div>
                        <dt>Telefone</dt>
                        <dd>{patient.phone}</dd>
                      </div>
                      <div>
                        <dt>E-mail</dt>
                        <dd>{patient.email ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Data de nascimento</dt>
                        <dd>{patient.birthDate ? formatDate(patient.birthDate) : "—"}</dd>
                      </div>
                      <div>
                        <dt>CPF</dt>
                        <dd>{patient.document ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Endereço</dt>
                        <dd>{patient.address ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Observações</dt>
                        <dd>{patient.notes ?? "—"}</dd>
                      </div>
                    </dl>
                  </section>

                  {patient.transactions && patient.transactions.length > 0 && (
                    <section className="card">
                      <h2>Financeiro do paciente</h2>
                      <div className="table-wrap">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Descrição</th>
                              <th>Vencimento</th>
                              <th>Valor</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patient.transactions.map((t) => (
                              <tr key={t.id}>
                                <td>{t.description}</td>
                                <td>{formatDate(t.dueDate)}</td>
                                <td>{formatCurrency(t.amount)}</td>
                                <td>{t.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}
                </div>

                <div className="detail-side">
                  <section className="card">
                    <h2>Plano de tratamento</h2>
                    {(!patient.treatmentPlans || patient.treatmentPlans.length === 0) ? (
                      <p className="muted">Nenhum plano de tratamento registrado.</p>
                    ) : (
                      patient.treatmentPlans.map((plan) => (
                        <div key={plan.id} className="plan-item">
                          <strong>{plan.goal}</strong>
                          <p>{plan.careLine}</p>
                          {plan.sessionsPlanned && <span className="muted small">{plan.sessionsPlanned} sessões previstas</span>}
                        </div>
                      ))
                    )}
                  </section>

                  {patient.lead && (
                    <section className="card">
                      <h2>Origem</h2>
                      <p className="muted small">Convertido a partir de um lead de triagem.</p>
                      <Link to={`/leads/${patient.lead.id}`} className="card-link">
                        Ver triagem original →
                      </Link>
                    </section>
                  )}
                </div>
              </div>
            )}

            {tab === "agendamentos" && (
              <section className="card">
                <div className="card-title-row">
                  <h2>Histórico de agendamentos</h2>
                  <button type="button" className="btn btn-primary btn-small" onClick={() => setShowNewAppointment(true)}>
                    + Novo agendamento
                  </button>
                </div>
                {appointments.length === 0 ? (
                  <p className="muted">Nenhum agendamento registrado.</p>
                ) : (
                  <ul className="simple-list">
                    {appointments.map((appt) => (
                      <li key={appt.id}>
                        <span className="simple-list-time">{formatDateTime(appt.startsAt)}</span>
                        <span className="simple-list-main">{appt.location ?? "Consultório"}</span>
                        <AppointmentStatusBadge status={appt.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {tab === "prontuario" && (
              <div className="detail-grid">
                <div className="detail-main">
                  <section className="card">
                    <h2>Histórico de evoluções</h2>
                    {clinicalRecords.length === 0 ? (
                      <p className="muted">Nenhuma evolução registrada ainda.</p>
                    ) : (
                      clinicalRecords.map((record) => (
                        <article key={record.id} className="record-item">
                          <header>
                            <strong>{formatDateTime(record.createdAt)}</strong>
                            {record.painScore !== null && <span className="muted small">Dor: {record.painScore}/10</span>}
                          </header>
                          <dl className="soap-list">
                            <div>
                              <dt>S</dt>
                              <dd>{record.subjective}</dd>
                            </div>
                            <div>
                              <dt>O</dt>
                              <dd>{record.objective}</dd>
                            </div>
                            <div>
                              <dt>A</dt>
                              <dd>{record.assessment}</dd>
                            </div>
                            <div>
                              <dt>P</dt>
                              <dd>{record.plan}</dd>
                            </div>
                          </dl>
                          {record.author && <span className="muted small">Registrado por {record.author.name}</span>}
                        </article>
                      ))
                    )}
                  </section>
                </div>
                <div className="detail-side">
                  <section className="card">
                    <h2>Nova evolução</h2>
                    <ClinicalRecordForm availableAppointments={availableAppointments} onSubmit={handleCreateRecord} />
                  </section>
                </div>
              </div>
            )}
          </>
        )}
      </LoadState>

      {showEdit && patient && (
        <Modal title="Editar paciente" onClose={() => setShowEdit(false)}>
          <PatientForm initial={patient} submitLabel="Salvar alterações" onSubmit={handleEdit} />
        </Modal>
      )}

      {showNewAppointment && patient && (
        <Modal title="Novo agendamento" onClose={() => setShowNewAppointment(false)}>
          <AppointmentForm fixedPatient={patient} onSubmit={handleCreateAppointment} />
        </Modal>
      )}
    </div>
  );
}
