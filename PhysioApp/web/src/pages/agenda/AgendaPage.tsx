import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import type { Appointment, AppointmentStatus, Patient } from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { AppointmentStatusBadge } from "../../components/Badge";
import { AppointmentForm } from "../../components/AppointmentForm";
import type { AppointmentFormValues } from "../../components/AppointmentForm";
import { Modal } from "../../components/Modal";
import { formatDate, formatTime } from "../../utils/format";

const STATUS_OPTIONS: AppointmentStatus[] = ["AGENDADO", "CONFIRMADO", "REALIZADO", "FALTOU", "CANCELADO"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function groupByDay(appointments: Appointment[]): [string, Appointment[]][] {
  const groups = new Map<string, Appointment[]>();
  for (const appt of appointments) {
    const key = new Date(appt.startsAt).toDateString();
    const list = groups.get(key) ?? [];
    list.push(appt);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(
    (a, b) => new Date(a[1][0].startsAt).getTime() - new Date(b[1][0].startsAt).getTime()
  );
}

export function AgendaPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const from = weekStart.toISOString();
      const to = weekEnd.toISOString();
      const [appts, pts] = await Promise.all([
        api.get<Appointment[]>(`/appointments?from=${from}&to=${to}`),
        api.get<Patient[]>("/patients"),
      ]);
      setAppointments(appts);
      setPatients(pts);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  async function handleCreate(values: AppointmentFormValues) {
    await api.post<Appointment>("/appointments", values);
    setShowForm(false);
    await load();
  }

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setStatusError(null);
    try {
      const updated = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: updated.status } : a)));
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : "Erro ao mudar status do agendamento.");
    }
  }

  const groups = groupByDay(appointments);

  return (
    <div>
      <header className="page-header page-header-actions">
        <div>
          <h1>Agenda</h1>
          <p>
            {formatDate(weekStart.toISOString())} — {formatDate(addDays(weekStart, 6).toISOString())}
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setWeekStart((d) => addDays(d, -7))}>
            ← Semana anterior
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Hoje
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setWeekStart((d) => addDays(d, 7))}>
            Próxima semana →
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Novo agendamento
          </button>
        </div>
      </header>

      {statusError && <div className="alert alert-error">{statusError}</div>}

      <LoadState loading={loading} error={error} onRetry={load} empty={groups.length === 0} emptyMessage="Nenhum agendamento nesta semana.">
        <div className="agenda-days">
          {groups.map(([day, dayAppointments]) => (
            <section className="card" key={day}>
              <h2>{formatDate(dayAppointments[0].startsAt)}</h2>
              <ul className="agenda-list">
                {dayAppointments.map((appt) => (
                  <li key={appt.id} className="agenda-item">
                    <span className="simple-list-time">
                      {formatTime(appt.startsAt)}–{formatTime(appt.endsAt)}
                    </span>
                    <div className="agenda-item-main">
                      <Link to={`/pacientes/${appt.patientId}`} className="table-link">
                        {appt.patient?.name ?? "Paciente"}
                      </Link>
                      <span className="muted small">{appt.location ?? "Consultório"}</span>
                    </div>
                    <AppointmentStatusBadge status={appt.status} />
                    <select
                      className="input input-small"
                      value={appt.status}
                      onChange={(e) => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </LoadState>

      {showForm && (
        <Modal title="Novo agendamento" onClose={() => setShowForm(false)}>
          <AppointmentForm patients={patients} onSubmit={handleCreate} />
        </Modal>
      )}
    </div>
  );
}
