"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./style.module.css";
import { getToken } from "../../login/auth";

// ─── Types ───────────────────────────────────────────────
interface Patient {
  id: number;
  name: string;
  email?: string;
}

interface Appointment {
  id: number;
  patient: { id: number; name: string };
  admin?: { id: number; name: string };
  appointmentDatetime: string; // ISO datetime
  sessionType: string;
  status: string;
  notes?: string;
}

interface CalendarBlock {
  id: number;
  blockedDate: string; // ISO date "yyyy-MM-dd"
  reason?: string;
}

// ─── Constants ───────────────────────────────────────────
const SESSION_TYPES = ["Avaliação", "Sessão", "Acompanhamento", "Follow-up", "Consulta Inicial"];
const STATUS_OPTIONS = ["AGENDADO", "CONCLUÍDO", "CANCELADO"];

const TYPE_COLOR: Record<string, string> = {
  "Avaliação":       "green",
  "Sessão":          "blue",
  "Acompanhamento":  "purple",
  "Follow-up":       "yellow",
  "Consulta Inicial":"teal",
};

const STATUS_LABEL: Record<string, string> = {
  AGENDADO:  "Agendado",
  CONCLUÍDO: "Concluído",
  CANCELADO: "Cancelado",
};

const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_FULL  = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// ─── Helpers ─────────────────────────────────────────────
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth() &&
         a.getDate()     === b.getDate();
}

function toLocalDateStr(d: Date) {
  // "yyyy-MM-dd" in local time
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getAppointmentTime(ap: Appointment) {
  try { return new Date(ap.appointmentDatetime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

function getAppointmentDate(ap: Appointment): Date {
  return new Date(ap.appointmentDatetime);
}

// ─── Main component ──────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(today);

  // Data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<number | null>(null);

  // New Appointment modal
  const [apptModal, setApptModal] = useState(false);
  const [apptPatientId, setApptPatientId] = useState("");
  const [apptDate, setApptDate] = useState(toLocalDateStr(today));
  const [apptTime, setApptTime] = useState("09:00");
  const [apptType, setApptType] = useState("Sessão");
  const [apptStatus, setApptStatus] = useState("AGENDADO");
  const [apptNotes, setApptNotes] = useState("");
  const [apptSubmitting, setApptSubmitting] = useState(false);
  const [apptError, setApptError] = useState("");

  // Block Day modal
  const [blockModal, setBlockModal] = useState(false);
  const [blockDate, setBlockDate] = useState(toLocalDateStr(today));
  const [blockReason, setBlockReason] = useState("");
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const [blockError, setBlockError] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  }), []);

  // ── Fetch all data ────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const h = authHeaders();

      // 1. Get current admin id
      const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, { headers: h });
      let aid: number | null = null;
      if (meRes.ok) {
        const me = await meRes.json();
        aid = me.subject ? Number(me.subject) : null;
        setAdminId(aid);
      }

      // 2. Appointments
      const apptUrl = aid
        ? `${process.env.NEXT_PUBLIC_API_URL}/appointments/admin/${aid}`
        : `${process.env.NEXT_PUBLIC_API_URL}/appointments`;
      const apptRes = await fetch(apptUrl, { headers: h });
      if (apptRes.ok) setAppointments(await apptRes.json());

      // 3. Blocked days
      const blockRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calendar?page=0&size=200`, { headers: h });
      if (blockRes.ok) {
        const blockData = await blockRes.json();
        setBlocks(blockData.content ?? blockData ?? []);
      }

      // 4. Patients (for modal select)
      const patRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients?page=0&size=200`, { headers: h });
      if (patRes.ok) {
        const pd = await patRes.json();
        setPatients(pd.content ?? pd ?? []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [authHeaders]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Create appointment ────────────────────────────────
  const handleCreateAppt = async () => {
    if (!apptPatientId) { setApptError("Selecione um paciente."); return; }
    if (!apptDate || !apptTime) { setApptError("Informe data e horário."); return; }
    setApptError(""); setApptSubmitting(true);
    try {
      const appointmentDatetime = `${apptDate}T${apptTime}:00`;
      const body: any = {
        patient: { id: Number(apptPatientId) },
        appointmentDatetime,
        status: apptStatus,
        notes: apptNotes,
      };
      if (adminId) body.admin = { id: adminId };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao criar agendamento.");
      closeApptModal();
      showToast("Agendamento criado com sucesso!");
      fetchAll();
    } catch (e: any) { setApptError(e.message); }
    finally { setApptSubmitting(false); }
  };

  // ── Block day ─────────────────────────────────────────
  const handleBlockDay = async () => {
    if (!blockDate) { setBlockError("Informe a data."); return; }
    setBlockError(""); setBlockSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calendar`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ blockedDate: blockDate, reason: blockReason || null }),
      });
      if (!res.ok) throw new Error("Erro ao bloquear dia.");
      setBlockModal(false); setBlockDate(toLocalDateStr(today)); setBlockReason("");
      showToast("Dia bloqueado com sucesso!");
      fetchAll();
    } catch (e: any) { setBlockError(e.message); }
    finally { setBlockSubmitting(false); }
  };

  // ── Delete appointment ────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${deleteTarget.id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      showToast("Agendamento removido.");
      fetchAll();
    } catch { showToast("Erro ao remover agendamento.", "error"); }
    finally { setDeleteSubmitting(false); }
  };

  const closeApptModal = () => {
    setApptModal(false); setApptPatientId(""); setApptDate(toLocalDateStr(today));
    setApptTime("09:00"); setApptType("Sessão"); setApptStatus("AGENDADO");
    setApptNotes(""); setApptError("");
  };

  // ── Open new appointment pre-filled with selected day ──
  const openApptOnDay = (day: Date) => {
    setApptDate(toLocalDateStr(day));
    setApptModal(true);
  };

  // ── Calendar navigation ───────────────────────────────
  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (viewMode === "weekly") d.setDate(d.getDate() + dir * 7);
    else { d.setMonth(d.getMonth() + dir); d.setDate(1); }
    setCurrentDate(d);
  };

  // ── Weekly grid helpers ───────────────────────────────
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // ── Monthly grid helpers ──────────────────────────────
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd   = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const gridStart  = startOfWeek(monthStart);
  const totalCells = Math.ceil((monthEnd.getDate() + monthStart.getDay()) / 7) * 7;
  const monthDays  = Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i));

  // ── Filtered data ─────────────────────────────────────
  const aptForDay = (d: Date) =>
    appointments.filter(a => isSameDay(getAppointmentDate(a), d));

  const isBlocked = (d: Date) =>
    blocks.some(b => b.blockedDate === toLocalDateStr(d));

  const selectedDayAppts = selectedDay ? aptForDay(selectedDay) : [];

  // ── Month header ──────────────────────────────────────
  const headerText = viewMode === "weekly"
    ? `${MONTHS_PT[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}${
        weekDays[6].getMonth() !== weekDays[0].getMonth()
          ? ` — ${MONTHS_PT[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`
          : ""}`
    : `${MONTHS_PT[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const thisMonthCount = appointments.filter(a => {
    const d = getAppointmentDate(a);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  }).length;

  return (
    <>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Agenda de Consultas</h1>
          <p className={styles.pageSubtitle}>
            {loading ? "Carregando..." : `${thisMonthCount} agendamento${thisMonthCount !== 1 ? "s" : ""} este mês`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.blockBtn} onClick={() => setBlockModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="9" y1="14" x2="15" y2="20"/><line x1="15" y1="14" x2="9" y2="20"/>
            </svg>
            Bloquear Dia
          </button>
          <button className={styles.newApptBtn} onClick={() => setApptModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* ── Calendar card ── */}
      <div className={styles.calCard}>
        {/* Calendar toolbar */}
        <div className={styles.calToolbar}>
          <div className={styles.calNav}>
            <button className={styles.navBtn} onClick={() => navigate(-1)} aria-label="Anterior">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <h2 className={styles.calMonth}>{headerText}</h2>
            <button className={styles.navBtn} onClick={() => navigate(1)} aria-label="Próximo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === "monthly" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("monthly")}
            >Mensal</button>
            <button
              className={`${styles.viewBtn} ${viewMode === "weekly" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("weekly")}
            >Semanal</button>
          </div>
        </div>

        {/* ── WEEKLY VIEW ── */}
        {viewMode === "weekly" && (
          <div className={styles.weekGrid}>
            {weekDays.map((day, i) => {
              const dayApts = aptForDay(day);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const blocked = isBlocked(day);

              return (
                <div
                  key={i}
                  className={`${styles.weekCol} ${isSelected ? styles.weekColSelected : ""} ${blocked ? styles.weekColBlocked : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className={styles.weekColHeader}>
                    <span className={styles.weekDayLabel}>{WEEKDAYS_SHORT[i]}</span>
                    <span className={`${styles.weekDayNum} ${isToday ? styles.weekDayNumToday : ""}`}>
                      {day.getDate()}
                    </span>
                  </div>

                  <div className={styles.weekColBody}>
                    {blocked && (
                      <div className={styles.blockedPill}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Bloqueado
                      </div>
                    )}
                    {dayApts.map((a) => (
                      <div
                        key={a.id}
                        className={`${styles.apptPill} ${styles[`apptPill_${TYPE_COLOR[a.sessionType] ?? "teal"}`]}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedDay(day); }}
                      >
                        <span className={styles.apptPillName}>{a.patient?.name?.split(" ")[0] ?? "—"}</span>
                        <span className={styles.apptPillType}>{a.sessionType}</span>
                      </div>
                    ))}
                    {!blocked && dayApts.length === 0 && (
                      <button
                        className={styles.addSlot}
                        onClick={(e) => { e.stopPropagation(); openApptOnDay(day); }}
                        title="Adicionar agendamento"
                      >+</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MONTHLY VIEW ── */}
        {viewMode === "monthly" && (
          <div className={styles.monthGrid}>
            {/* Header row */}
            {WEEKDAYS_SHORT.map((d) => (
              <div key={d} className={styles.monthHeaderCell}>{d}</div>
            ))}

            {/* Day cells */}
            {monthDays.map((day, i) => {
              const inMonth  = day.getMonth() === currentDate.getMonth();
              const isToday  = isSameDay(day, today);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const blocked  = isBlocked(day);
              const dayApts  = aptForDay(day);

              return (
                <div
                  key={i}
                  className={`${styles.monthCell}
                    ${!inMonth ? styles.monthCellOut : ""}
                    ${isSelected ? styles.monthCellSelected : ""}
                    ${blocked ? styles.monthCellBlocked : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className={`${styles.monthCellNum} ${isToday ? styles.monthCellNumToday : ""}`}>
                    {day.getDate()}
                  </span>
                  <div className={styles.monthCellPills}>
                    {dayApts.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        className={`${styles.monthPill} ${styles[`monthPill_${TYPE_COLOR[a.sessionType] ?? "teal"}`]}`}
                      >
                        {a.patient?.name?.split(" ")[0] ?? "—"}
                      </div>
                    ))}
                    {dayApts.length > 3 && (
                      <div className={styles.monthPillMore}>+{dayApts.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Day detail panel ── */}
      {selectedDay && (
        <div className={styles.dayPanel}>
          <div className={styles.dayPanelHeader}>
            <h3 className={styles.dayPanelTitle}>
              {WEEKDAYS_FULL[selectedDay.getDay()]}, {selectedDay.getDate()} de {MONTHS_PT[selectedDay.getMonth()]}
              {isBlocked(selectedDay) && (
                <span className={styles.dayBlockedBadge}>Dia Bloqueado</span>
              )}
            </h3>
            <div className={styles.dayPanelHeaderRight}>
              <span className={styles.dayPanelCount}>
                {selectedDayAppts.length} consulta{selectedDayAppts.length !== 1 ? "s" : ""}
              </span>
              <button
                className={styles.dayPanelAddBtn}
                onClick={() => openApptOnDay(selectedDay)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Adicionar
              </button>
              <button className={styles.dayPanelClose} onClick={() => setSelectedDay(null)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {selectedDayAppts.length === 0 ? (
            <div className={styles.dayPanelEmpty}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Nenhum agendamento neste dia.</span>
            </div>
          ) : (
            <div className={styles.dayPanelList}>
              {selectedDayAppts
                .sort((a, b) => new Date(a.appointmentDatetime).getTime() - new Date(b.appointmentDatetime).getTime())
                .map((a) => (
                <div
                  key={a.id}
                  className={`${styles.dayApptRow} ${styles[`dayApptRow_${TYPE_COLOR[a.sessionType] ?? "teal"}`]}`}
                >
                  <div className={styles.dayApptTime}>{getAppointmentTime(a)}</div>
                  <div className={styles.dayApptInfo}>
                    <span className={styles.dayApptPatient}>{a.patient?.name ?? "—"}</span>
                    <span className={styles.dayApptType}>{a.sessionType}</span>
                  </div>
                  <span className={`${styles.dayApptStatus} ${styles[`dayApptStatus_${(a.status ?? "AGENDADO").toLowerCase()}`]}`}>
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                  <button
                    className={styles.dayApptDelete}
                    onClick={() => setDeleteTarget(a)}
                    title="Remover agendamento"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Legend ── */}
      <div className={styles.legend}>
        {Object.entries(TYPE_COLOR).map(([type, color]) => (
          <span key={type} className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles[`legendDot_${color}`]}`} />
            {type}
          </span>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────
          MODAL: Novo Agendamento
      ───────────────────────────────────────────────── */}
      {apptModal && (
        <div className={styles.overlay} onClick={closeApptModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconWrap}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
                  </svg>
                </div>
                <div>
                  <h2 className={styles.modalTitle}>Novo Agendamento</h2>
                  <p className={styles.modalSubtitle}>Preencha os dados da consulta.</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={closeApptModal}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Patient */}
              <div className={styles.field}>
                <label className={styles.label}>Paciente <span className={styles.required}>*</span></label>
                <select
                  className={styles.select}
                  value={apptPatientId}
                  onChange={(e) => setApptPatientId(e.target.value)}
                >
                  <option value="">Selecione o paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Date + Time row */}
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Data <span className={styles.required}>*</span></label>
                  <input
                    type="date"
                    className={styles.input}
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Horário <span className={styles.required}>*</span></label>
                  <input
                    type="time"
                    className={styles.input}
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Type */}
              <div className={styles.field}>
                <label className={styles.label}>Tipo de sessão</label>
                <div className={styles.typeGrid}>
                  {SESSION_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.typeOpt} ${apptType === t ? styles.typeOptActive : ""}`}
                      onClick={() => setApptType(t)}
                    >
                      <span className={`${styles.typeDot} ${styles[`typeDot_${TYPE_COLOR[t] ?? "teal"}`]}`} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <div className={styles.statusRow}>
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.statusOpt} ${apptStatus === s ? styles[`statusOpt_${s.toLowerCase()}`] : ""}`}
                      onClick={() => setApptStatus(s)}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className={styles.field}>
                <label className={styles.label}>Observações <span className={styles.optional}>(opcional)</span></label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="Informações adicionais sobre a consulta..."
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {apptError && (
                <div className={styles.errorBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {apptError}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeApptModal}>Cancelar</button>
              <button className={styles.submitBtn} onClick={handleCreateAppt} disabled={apptSubmitting}>
                {apptSubmitting ? (
                  <><div className={styles.spinnerSm} />Criando...</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Criar Agendamento</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────
          MODAL: Bloquear Dia
      ───────────────────────────────────────────────── */}
      {blockModal && (
        <div className={styles.overlay} onClick={() => setBlockModal(false)}>
          <div className={styles.modalSm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconWrapSlate}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="9" y1="14" x2="15" y2="20"/><line x1="15" y1="14" x2="9" y2="20"/>
                  </svg>
                </div>
                <div>
                  <h2 className={styles.modalTitle}>Bloquear Dia</h2>
                  <p className={styles.modalSubtitle}>Marque um dia como indisponível.</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setBlockModal(false)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Data <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  className={styles.input}
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Motivo <span className={styles.optional}>(opcional)</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ex: Feriado, férias, evento..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
              {blockError && (
                <div className={styles.errorBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {blockError}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setBlockModal(false)}>Cancelar</button>
              <button className={styles.submitBtn} onClick={handleBlockDay} disabled={blockSubmitting}>
                {blockSubmitting ? <><div className={styles.spinnerSm} />Bloqueando...</> : "Bloquear Dia"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────
          MODAL: Confirmar exclusão
      ───────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modalSm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconWrapRed}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </div>
                <div>
                  <h2 className={styles.modalTitle}>Remover Agendamento</h2>
                  <p className={styles.modalSubtitle}>Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setDeleteTarget(null)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteMessage}>
                Deseja remover o agendamento de <strong>{deleteTarget.patient?.name}</strong>{" "}
                ({deleteTarget.sessionType}) em{" "}
                <strong>{new Date(deleteTarget.appointmentDatetime).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} às {getAppointmentTime(deleteTarget)}</strong>?
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className={styles.dangerBtn} onClick={handleDelete} disabled={deleteSubmitting}>
                {deleteSubmitting ? <><div className={styles.spinnerSm} />Removendo...</> : "Sim, remover"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === "success"
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}