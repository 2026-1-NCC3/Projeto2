"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./style.module.css";
import { getToken } from "../../login/auth";

// ─── Saudação adaptativa por hora ──────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

// ─── Status da consulta com base no horário atual ──────────
function getAppointmentStatus(
  dt: Date
): "completed" | "inprogress" | "upcoming" {
  const now = new Date();
  const diffMin = (dt.getTime() - now.getTime()) / 60000;
  if (diffMin < -60) return "completed";
  if (diffMin <= 0) return "inprogress";
  return "upcoming";
}

// ─── Formata countdown legível ─────────────────────────────
function formatCountdown(dt: Date): string {
  const diffMin = Math.ceil((dt.getTime() - Date.now()) / 60000);
  if (diffMin <= 0) return "Agora";
  if (diffMin < 60) return `${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── Tipos ────────────────────────────────────────────────
interface AppointmentItem {
  id: number;
  time: string;
  name: string;
  type: string;
  status: "completed" | "inprogress" | "upcoming";
  rawDatetime: Date;
}

const STATUS_LABEL: Record<string, string> = {
  completed: "Concluído",
  inprogress: "Em Andamento",
  upcoming: "Próximo",
};

// ─── Componente principal ─────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();

  const [greeting, setGreeting] = useState(getGreeting());
  const [adminName, setAdminName] = useState("Carregando...");
  const [totalPatients, setTotalPatients] = useState(0);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [countdown, setCountdown] = useState<string>("");
  const [loadingAppts, setLoadingAppts] = useState(true);

  // Atualiza saudação a cada minuto
  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Data formatada pro subtítulo
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Fetch inicial ──────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = getToken();
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Admin /me
        const meRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/me`,
          { headers }
        );
        if (!meRes.ok) return;
        const me = await meRes.json();
        const adminId = me.subject;

        // Nome do admin
        const adminRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/${adminId}`,
          { headers }
        );
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setAdminName(adminData.name);
        }

        // Total de pacientes
        const patientsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/patients?page=0&size=1`,
          { headers }
        );
        if (patientsRes.ok) {
          const pd = await patientsRes.json();
          setTotalPatients(pd.totalElements);
        }

        // Consultas do admin → filtra pelo dia de hoje
        const apptRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/appointments/admin/${adminId}`,
          { headers }
        );
        if (apptRes.ok) {
          const raw: any[] = await apptRes.json();
          const todayStr = new Date().toDateString();

          const todayAppts: AppointmentItem[] = raw
            .filter((a) => new Date(a.appointmentDatetime).toDateString() === todayStr)
            .sort(
              (a, b) =>
                new Date(a.appointmentDatetime).getTime() -
                new Date(b.appointmentDatetime).getTime()
            )
            .map((a) => {
              const dt = new Date(a.appointmentDatetime);
              return {
                id: a.id,
                time: dt.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                name: a.patient?.name ?? "Paciente",
                type: a.notes ?? "Sessão",
                status: getAppointmentStatus(dt),
                rawDatetime: dt,
              };
            });

          setAppointments(todayAppts);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setAdminName("Usuário");
      } finally {
        setLoadingAppts(false);
      }
    };

    fetchAll();
  }, []);

  // ── Countdown em tempo real ────────────────────────────
  useEffect(() => {
    const nextAppt = appointments.find(
      (a) => a.status === "upcoming" || a.status === "inprogress"
    );
    if (!nextAppt) {
      setCountdown("");
      return;
    }

    const tick = () => setCountdown(formatCountdown(nextAppt.rawDatetime));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [appointments]);

  // ── Derived values ─────────────────────────────────────
  const nextSession = appointments.find(
    (a) => a.status === "upcoming" || a.status === "inprogress"
  ) ?? null;

  const sessionsCompleted = appointments.filter(
    (a) => a.status === "completed"
  ).length;

  return (
    <>
      {/* Saudação */}
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>
          {greeting}, {adminName}{" "}
          <span className={styles.wave}>👋</span>
        </h1>
        <p className={styles.greetingSubtitle}>
          {today.charAt(0).toUpperCase() + today.slice(1)} — Aqui está o seu
          resumo diário.
        </p>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {/* Pacientes ativos */}
        <div
          className={`${styles.statCard} ${styles.statCardAnimated}`}
          style={{ animationDelay: "0ms" }}
        >
          <div className={styles.statTop}>
            <span className={styles.statLabel}>PACIENTES ATIVOS</span>
            <div className={styles.statIconWrap}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{totalPatients}</div>
          <div className={styles.statChange}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
            2 novos este mês
          </div>
        </div>

        {/* Sessões hoje */}
        <div
          className={`${styles.statCard} ${styles.statCardAnimated}`}
          style={{ animationDelay: "160ms" }}
        >
          <div className={styles.statTop}>
            <span className={styles.statLabel}>SESSÕES HOJE</span>
            <div className={styles.statIconWrap}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>
            {loadingAppts ? "—" : appointments.length}
          </div>
          <div className={`${styles.statChange} ${styles.statChangeBlue}`}>
            {sessionsCompleted} concluída{sessionsCompleted !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className={styles.bottomGrid}>
        {/* Pacientes do dia */}
        <div
          className={`${styles.card} ${styles.cardAnimated}`}
          style={{ animationDelay: "220ms" }}
        >
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Pacientes do Dia</h2>
            <button
              className={styles.cardLink}
              onClick={() => router.push("/dashboard/calendar")}
            >
              Ver agenda →
            </button>
          </div>

          <ul className={styles.patientList}>
            {loadingAppts ? (
              <li className={styles.emptyState}>
                <span className={styles.skeletonSpinner} />
                <span>Carregando agenda...</span>
              </li>
            ) : appointments.length === 0 ? (
              <li className={styles.emptyState}>
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.22 }}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Nenhuma sessão agendada para hoje</span>
              </li>
            ) : (
              appointments.map((p) => (
                <li key={p.id} className={styles.patientRow}>
                  <div className={styles.patientLeft}>
                    <StatusIcon status={p.status} />
                    <span className={styles.patientTime}>{p.time}</span>
                    <div className={styles.patientInfo}>
                      <span className={styles.patientName}>{p.name}</span>
                      <span className={styles.patientType}>{p.type}</span>
                    </div>
                  </div>
                  <span
                    className={`${styles.badge} ${styles[`badge_${p.status}`]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Ações rápidas */}
        <div
          className={`${styles.card} ${styles.cardAnimated}`}
          style={{ animationDelay: "300ms" }}
        >
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Ações Rápidas</h2>
          </div>

          <div className={styles.actionList}>
            {/* Ver pacientes */}
            <button
              className={styles.actionItem}
              onClick={() => router.push("/dashboard/patients")}
            >
              <div className={`${styles.actionIcon} ${styles.actionIconTeal}`}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div className={styles.actionText}>
                <span className={styles.actionTitle}>Ver Pacientes</span>
                <span className={styles.actionSub}>Lista de pacientes ativos</span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.25, flexShrink: 0 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Criar sessão — abre modal diretamente via query param */}
            <button
              className={styles.actionItem}
              onClick={() =>
                router.push("/dashboard/calendar?openModal=true")
              }
            >
              <div
                className={`${styles.actionIcon} ${styles.actionIconSlate}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div className={styles.actionText}>
                <span className={styles.actionTitle}>Criar Sessão</span>
                <span className={styles.actionSub}>Agendar nova consulta</span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.25, flexShrink: 0 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Nova prescrição */}
            <button
              className={styles.actionItem}
              onClick={() => router.push("/dashboard/exercise")}
            >
              <div
                className={`${styles.actionIcon} ${styles.actionIconPurple}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className={styles.actionText}>
                <span className={styles.actionTitle}>Nova Prescrição</span>
                <span className={styles.actionSub}>Montar rotina de exercícios</span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.25, flexShrink: 0 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Banner próxima sessão */}
          {nextSession ? (
            <div className={styles.nextSession}>
              <div className={styles.nextSessionTop}>
                <span className={styles.nextSessionLabel}>
                  {nextSession.status === "inprogress"
                    ? "Sessão em andamento"
                    : "Próxima sessão em"}
                </span>
                <span className={styles.nextSessionTime}>{countdown}</span>
              </div>
              <div className={styles.nextSessionPatient}>
                {nextSession.name}
              </div>
              <div className={styles.nextSessionMeta}>
                {nextSession.time} · {nextSession.type}
              </div>
            </div>
          ) : !loadingAppts ? (
            <div className={styles.nextSessionEmpty}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.4 }}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Nenhuma sessão pendente hoje</span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

// ─── Ícone de status ──────────────────────────────────────
function StatusIcon({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className={`${styles.statusIcon} ${styles.statusCompleted}`}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === "inprogress") {
    return (
      <span className={`${styles.statusIcon} ${styles.statusInProgress}`}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${styles.statusIcon} ${styles.statusUpcoming}`} />
  );
}