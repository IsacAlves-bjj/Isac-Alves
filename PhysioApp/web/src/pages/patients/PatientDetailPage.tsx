import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { BILLING_TYPE_LABELS } from "../../api/types";
import type {
  Appointment,
  ClinicalRecord,
  ExamRequest,
  Patient,
  PatientFeedback,
  PriceListItem,
  Referral,
  TreatmentPlan,
} from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { PatientForm } from "../../components/PatientForm";
import type { PatientFormValues } from "../../components/PatientForm";
import { AppointmentForm } from "../../components/AppointmentForm";
import type { AppointmentFormValues } from "../../components/AppointmentForm";
import { ClinicalRecordForm } from "../../components/ClinicalRecordForm";
import type { ClinicalRecordFormValues } from "../../components/ClinicalRecordForm";
import { TreatmentPlanForm } from "../../components/TreatmentPlanForm";
import type { TreatmentPlanFormValues } from "../../components/TreatmentPlanForm";
import { ClosePackageForm } from "../../components/ClosePackageForm";
import type { ClosePackageFormValues } from "../../components/ClosePackageForm";
import { ExamRequestForm } from "../../components/ExamRequestForm";
import type { ExamRequestFormValues } from "../../components/ExamRequestForm";
import { ReferralForm } from "../../components/ReferralForm";
import type { ReferralFormValues } from "../../components/ReferralForm";
import { FeedbackForm } from "../../components/FeedbackForm";
import type { FeedbackFormValues } from "../../components/FeedbackForm";
import { PainTrendChart } from "../../components/PainTrendChart";
import { AppointmentStatusBadge, Badge } from "../../components/Badge";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/format";
import { Modal } from "../../components/Modal";

type TabKey = "visao-geral" | "agendamentos" | "prontuario" | "exames" | "encaminhamentos" | "feedback";

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("visao-geral");
  const [showEdit, setShowEdit] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showTreatmentPlan, setShowTreatmentPlan] = useState(false);
  const [showClosePackage, setShowClosePackage] = useState(false);
  const [receivingExamId, setReceivingExamId] = useState<string | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [completingReferralId, setCompletingReferralId] = useState<string | null>(null);
  const [referralNotes, setReferralNotes] = useState("");
  const [sendingConfirmationId, setSendingConfirmationId] = useState<string | null>(null);
  const [priceListItems, setPriceListItems] = useState<PriceListItem[]>([]);

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

  useEffect(() => {
    api.get<PriceListItem[]>("/finance/price-list").then(setPriceListItems).catch(() => {});
  }, []);

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

  async function handleCreateTreatmentPlan(values: TreatmentPlanFormValues) {
    if (!id) return;
    await api.post<TreatmentPlan>(`/patients/${id}/treatment-plan`, values);
    setShowTreatmentPlan(false);
    await load();
  }

  async function handleClosePackage(values: ClosePackageFormValues) {
    if (!id) return;
    await api.post(`/patients/${id}/close-package`, values);
    setShowClosePackage(false);
    await load();
  }

  async function handleCreateExamRequest(values: ExamRequestFormValues) {
    if (!id) return;
    await api.post<ExamRequest>("/exam-requests", { patientId: id, ...values });
    await load();
  }

  async function handleReceiveExam(examId: string, event: FormEvent) {
    event.preventDefault();
    await api.patch<ExamRequest>(`/exam-requests/${examId}/receive`, { resultNotes: resultNotes || undefined });
    setReceivingExamId(null);
    setResultNotes("");
    await load();
  }

  async function handleCreateReferral(values: ReferralFormValues) {
    if (!id) return;
    await api.post<Referral>("/referrals", { patientId: id, ...values });
    await load();
  }

  async function handleCompleteReferral(referralId: string, event: FormEvent) {
    event.preventDefault();
    await api.patch<Referral>(`/referrals/${referralId}/complete`, { notes: referralNotes || undefined });
    setCompletingReferralId(null);
    setReferralNotes("");
    await load();
  }

  async function handleCreateFeedback(values: FeedbackFormValues) {
    if (!id) return;
    await api.post<PatientFeedback>("/feedback", { patientId: id, ...values });
    await load();
  }

  async function handleSendConfirmation(appointmentId: string) {
    setSendingConfirmationId(appointmentId);
    try {
      await api.post<Appointment>(`/appointments/${appointmentId}/send-confirmation`);
      await load();
    } finally {
      setSendingConfirmationId(null);
    }
  }

  const appointments = patient?.appointments ?? [];
  const clinicalRecords = patient?.clinicalRecords ?? [];
  const examRequests = patient?.examRequests ?? [];
  const referrals = patient?.referrals ?? [];
  const feedbacks = patient?.feedbacks ?? [];
  const activePlan = patient?.treatmentPlans?.find((p) => p.active) ?? patient?.treatmentPlans?.[0];
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
              <button type="button" className={tab === "exames" ? "tab tab-active" : "tab"} onClick={() => setTab("exames")}>
                Exames ({examRequests.length})
              </button>
              <button type="button" className={tab === "encaminhamentos" ? "tab tab-active" : "tab"} onClick={() => setTab("encaminhamentos")}>
                Encaminhamentos ({referrals.length})
              </button>
              <button type="button" className={tab === "feedback" ? "tab tab-active" : "tab"} onClick={() => setTab("feedback")}>
                Feedback ({feedbacks.length})
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
                        <dt>Peso / Altura</dt>
                        <dd>
                          {patient.weight ? `${patient.weight} kg` : "—"} / {patient.height ? `${patient.height} cm` : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Comorbidades</dt>
                        <dd>{patient.comorbidities ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Atendimento preferido</dt>
                        <dd>{patient.preferredLocation ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Cobrança</dt>
                        <dd>
                          <Badge tone={patient.billingType === "CONVENIO" ? "info" : "neutral"}>
                            {BILLING_TYPE_LABELS[patient.billingType]}
                          </Badge>
                          {patient.billingType === "CONVENIO" && patient.insuranceName && (
                            <span style={{ marginLeft: 8 }}>{patient.insuranceName}</span>
                          )}
                        </dd>
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
                    <div className="card-title-row">
                      <h2>Tratamento</h2>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="btn btn-secondary btn-small" onClick={() => setShowTreatmentPlan(true)}>
                          {activePlan ? "Atualizar" : "Iniciar"}
                        </button>
                        <button type="button" className="btn btn-primary btn-small" onClick={() => setShowClosePackage(true)}>
                          Fechar pacote
                        </button>
                      </div>
                    </div>
                    {!activePlan ? (
                      <p className="muted">Nenhum plano de tratamento registrado.</p>
                    ) : (
                      <>
                        <dl className="info-list" style={{ marginBottom: 12 }}>
                          <div>
                            <dt>Início do tratamento</dt>
                            <dd>{patient.sessionsSummary?.startDate ? formatDate(patient.sessionsSummary.startDate) : "—"}</dd>
                          </div>
                          <div>
                            <dt>Sessões</dt>
                            <dd>
                              {patient.sessionsSummary?.completed ?? 0}
                              {patient.sessionsSummary?.planned ? ` de ${patient.sessionsSummary.planned}` : ""} realizadas
                            </dd>
                          </div>
                        </dl>
                        <div className="plan-item">
                          <strong>{activePlan.goal}</strong>
                          <p>{activePlan.careLine}</p>
                        </div>
                      </>
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
                        <span className="simple-list-main">
                          {appt.location ?? "Consultório"}
                          {appt.confirmationSentAt && (
                            <span className="muted small"> · confirmação enviada em {formatDateTime(appt.confirmationSentAt)}</span>
                          )}
                        </span>
                        <AppointmentStatusBadge status={appt.status} />
                        {appt.status === "AGENDADO" && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            disabled={sendingConfirmationId === appt.id}
                            onClick={() => handleSendConfirmation(appt.id)}
                          >
                            {sendingConfirmationId === appt.id
                              ? "Enviando..."
                              : appt.confirmationSentAt
                                ? "Reenviar confirmação"
                                : "Enviar confirmação"}
                          </button>
                        )}
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
                    <h2>Evolução da dor</h2>
                    <PainTrendChart records={clinicalRecords} />
                  </section>
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

            {tab === "exames" && (
              <div className="detail-grid">
                <div className="detail-main">
                  <section className="card">
                    <h2>Exames solicitados</h2>
                    {examRequests.length === 0 ? (
                      <p className="muted">Nenhum exame solicitado ainda.</p>
                    ) : (
                      examRequests.map((exam) => (
                        <article key={exam.id} className="record-item">
                          <header>
                            <strong>{exam.description}</strong>
                            <Badge tone={exam.status === "RECEBIDO" ? "success" : "warning"}>
                              {exam.status === "RECEBIDO" ? "Recebido" : "Solicitado"}
                            </Badge>
                          </header>
                          <p className="muted small">Solicitado em {formatDateTime(exam.requestedAt)}</p>
                          {exam.resultNotes && <p>{exam.resultNotes}</p>}
                          {exam.status === "SOLICITADO" && receivingExamId !== exam.id && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => {
                                setReceivingExamId(exam.id);
                                setResultNotes("");
                              }}
                            >
                              Marcar como recebido
                            </button>
                          )}
                          {receivingExamId === exam.id && (
                            <form className="form" onSubmit={(e) => handleReceiveExam(exam.id, e)} style={{ marginTop: 8 }}>
                              <label className="field">
                                <span className="label">Resumo do resultado (opcional)</span>
                                <textarea
                                  className="input"
                                  rows={2}
                                  value={resultNotes}
                                  onChange={(e) => setResultNotes(e.target.value)}
                                />
                              </label>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button type="submit" className="btn btn-primary btn-small">
                                  Confirmar recebimento
                                </button>
                                <button type="button" className="btn btn-secondary btn-small" onClick={() => setReceivingExamId(null)}>
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          )}
                        </article>
                      ))
                    )}
                  </section>
                </div>
                <div className="detail-side">
                  <section className="card">
                    <h2>Solicitar exame</h2>
                    <ExamRequestForm onSubmit={handleCreateExamRequest} />
                  </section>
                </div>
              </div>
            )}

            {tab === "encaminhamentos" && (
              <div className="detail-grid">
                <div className="detail-main">
                  <section className="card">
                    <h2>Encaminhamentos</h2>
                    {referrals.length === 0 ? (
                      <p className="muted">Nenhum encaminhamento registrado ainda.</p>
                    ) : (
                      referrals.map((ref) => (
                        <article key={ref.id} className="record-item">
                          <header>
                            <strong>{ref.specialty}</strong>
                            <Badge tone={ref.status === "REALIZADO" ? "success" : "warning"}>
                              {ref.status === "REALIZADO" ? "Realizado" : "Solicitado"}
                            </Badge>
                          </header>
                          <p className="muted small">Solicitado em {formatDateTime(ref.requestedAt)}</p>
                          {ref.reason && <p>{ref.reason}</p>}
                          {ref.notes && <p className="muted small">Retorno: {ref.notes}</p>}
                          {ref.status === "SOLICITADO" && completingReferralId !== ref.id && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => {
                                setCompletingReferralId(ref.id);
                                setReferralNotes("");
                              }}
                            >
                              Marcar como realizado
                            </button>
                          )}
                          {completingReferralId === ref.id && (
                            <form className="form" onSubmit={(e) => handleCompleteReferral(ref.id, e)} style={{ marginTop: 8 }}>
                              <label className="field">
                                <span className="label">Retorno / observações (opcional)</span>
                                <textarea
                                  className="input"
                                  rows={2}
                                  value={referralNotes}
                                  onChange={(e) => setReferralNotes(e.target.value)}
                                />
                              </label>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button type="submit" className="btn btn-primary btn-small">
                                  Confirmar
                                </button>
                                <button type="button" className="btn btn-secondary btn-small" onClick={() => setCompletingReferralId(null)}>
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          )}
                        </article>
                      ))
                    )}
                  </section>
                </div>
                <div className="detail-side">
                  <section className="card">
                    <h2>Novo encaminhamento</h2>
                    <ReferralForm onSubmit={handleCreateReferral} />
                  </section>
                </div>
              </div>
            )}

            {tab === "feedback" && (
              <div className="detail-grid">
                <div className="detail-main">
                  <section className="card">
                    <h2>Feedback do paciente</h2>
                    {feedbacks.length === 0 ? (
                      <p className="muted">Nenhum feedback registrado ainda.</p>
                    ) : (
                      feedbacks.map((f) => (
                        <article key={f.id} className="record-item">
                          <header>
                            <strong>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</strong>
                            <span className="muted small">{formatDateTime(f.createdAt)}</span>
                          </header>
                          {f.comment && <p>{f.comment}</p>}
                        </article>
                      ))
                    )}
                  </section>
                </div>
                <div className="detail-side">
                  <section className="card">
                    <h2>Registrar feedback</h2>
                    <FeedbackForm onSubmit={handleCreateFeedback} />
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

      {showTreatmentPlan && patient && (
        <Modal title={activePlan ? "Atualizar plano de tratamento" : "Iniciar plano de tratamento"} onClose={() => setShowTreatmentPlan(false)}>
          <TreatmentPlanForm initial={activePlan} onSubmit={handleCreateTreatmentPlan} />
        </Modal>
      )}

      {showClosePackage && patient && (
        <Modal title="Fechar pacote" onClose={() => setShowClosePackage(false)}>
          <ClosePackageForm priceListItems={priceListItems} onSubmit={handleClosePackage} />
        </Modal>
      )}
    </div>
  );
}
