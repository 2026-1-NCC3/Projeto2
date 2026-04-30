"use client";

import { useState, useEffect } from "react";
import styles from "./style.module.css";
import { getToken } from "../../login/auth";

const PATIENTS_TODAY = [
  { time: "08:00", name: "Ana Paula Costa", type: "Avaliação", status: "completed" },
  { time: "09:00", name: "Bruno Ferreira", type: "Acompanhamento", status: "completed" },
  { time: "10:30", name: "Elena Rodrigues", type: "Sessão", status: "inprogress" },
  { time: "14:00", name: "Diego Lima", type: "Acompanhamento", status: "upcoming" },
  { time: "15:30", name: "Gabriela Oliveira", type: "Sessão", status: "upcoming" },
  { time: "17:00", name: "Carlos Mendes", type: "Avaliação", status: "upcoming" },
];

const STATUS_LABEL: Record<string, string> = {
  completed: "Concluído",
  inprogress: "Em Andamento",
  upcoming: "Próximo",
};

export default function DashboardPage() {
  // Estados para armazenar os dados vindos do backend
  const [adminName, setAdminName] = useState("Carregando...");
  const [totalPatients, setTotalPatients] = useState(0);


  // Data dinâmica formatada para o subtítulo
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Pegando o token e o ID salvos no login
        const token = getToken();
        
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        const fetchAdmin = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, { headers });

        if (!fetchAdmin.ok) {
          alert("Erro ao buscar o fetch admin");
        }

        const data = await fetchAdmin.json();
        const adminId = data.subject;

        // 1. Busca o nome do Admin (Rota GET /admin/{id})
        if (adminId) {
          const adminResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/${adminId}`, { headers });

          const adminData = await adminResponse.json();
          setAdminName(adminData.name);
        }

        // 2. Busca a soma dos pacientes ativos (Rota GET /patients)
        // O Spring Pageable retorna o 'totalElements', não precisamos carregar a lista toda, só size=1
        const patientsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients?page=0&size=1`, { headers });
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          // Pega o número total de itens registrados no banco
          setTotalPatients(patientsData.totalElements);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setAdminName("Usuário");
      }
    };

    fetchDashboardData();
  }, []);


  return (
    <>
          <div className={styles.greeting}>
            <h1 className={styles.greetingTitle}>
              Bom dia, {adminName} <span className={styles.wave}>👋</span>
            </h1>
            <p className={styles.greetingSubtitle}>
              {today.charAt(0).toUpperCase() + today.slice(1)} — Aqui está o seu resumo diário.
            </p>
          </div>

          {/* Stat cards */}
          <div className={styles.statsGrid}>
            {/* Active Patients */}
            <div className={`${styles.statCard} ${styles.statCardAnimated}`} style={{ animationDelay: "0ms" }}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>PACIENTES ATIVOS</span>
                <div className={styles.statIconWrap}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <div className={styles.statValue}>{totalPatients}</div>
              <div className={styles.statChange}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
                2 novos este mês
              </div>
            </div>

            {/* Sessions Today */}
            <div className={`${styles.statCard} ${styles.statCardAnimated}`} style={{ animationDelay: "160ms" }}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>SESSÕES HOJE</span>
                <div className={styles.statIconWrap}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
              <div className={styles.statValue}>6</div>
              <div className={`${styles.statChange} ${styles.statChangeBlue}`}>
                2 concluídas
              </div>
            </div>
          </div>

          {/* Bottom grid */}
          <div className={styles.bottomGrid}>
            {/* Patients of the Day */}
            <div className={`${styles.card} ${styles.cardAnimated}`} style={{ animationDelay: "220ms" }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Pacientes do Dia</h2>
                <button className={styles.cardLink}>Ver agenda →</button>
              </div>

              <ul className={styles.patientList}>
                {PATIENTS_TODAY.map((p, i) => (
                  <li key={i} className={styles.patientRow}>
                    <div className={styles.patientLeft}>
                      <StatusIcon status={p.status} />
                      <span className={styles.patientTime}>{p.time}</span>
                      <div className={styles.patientInfo}>
                        <span className={styles.patientName}>{p.name}</span>
                        <span className={styles.patientType}>{p.type}</span>
                      </div>
                    </div>
                    <span className={`${styles.badge} ${styles[`badge_${p.status}`]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className={`${styles.card} ${styles.cardAnimated}`} style={{ animationDelay: "300ms" }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Ações Rápidas</h2>
              </div>

              <div className={styles.actionList}>
                <button className={styles.actionItem}>
                  <div className={`${styles.actionIcon} ${styles.actionIconTeal}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div className={styles.actionText}>
                    <span className={styles.actionTitle}>Ver Paciente</span>
                    <span className={styles.actionSub}>Abrir prontuário médico</span>
                  </div>
                </button>

                <button className={styles.actionItem}>
                  <div className={`${styles.actionIcon} ${styles.actionIconSlate}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <div className={styles.actionText}>
                    <span className={styles.actionTitle}>Criar Sessão</span>
                    <span className={styles.actionSub}>Agendar nova consulta</span>
                  </div>
                </button>

                <button className={styles.actionItem}>
                  <div className={`${styles.actionIcon} ${styles.actionIconPurple}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                </button>
              </div>

              {/* Next session banner */}
              <div className={styles.nextSession}>
                <div className={styles.nextSessionTop}>
                  <span className={styles.nextSessionLabel}>Próxima sessão em</span>
                  <span className={styles.nextSessionTime}>32 min</span>
                </div>
                <div className={styles.nextSessionPatient}>Elena Rodrigues</div>
                <div className={styles.nextSessionMeta}>10:30 · Sessão</div>
              </div>
            </div>
          </div>
    </>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className={`${styles.statusIcon} ${styles.statusCompleted}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === "inprogress") {
    return (
      <span className={`${styles.statusIcon} ${styles.statusInProgress}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${styles.statusIcon} ${styles.statusUpcoming}`} />
  );
}