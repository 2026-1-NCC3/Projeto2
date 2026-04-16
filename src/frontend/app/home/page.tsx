"use client";

import { useState } from "react";
import styles from "./style.module.css";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "patients",
    label: "Patients",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "exercises",
    label: "Exercises",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "messages",
    label: "Messages",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const PATIENTS_TODAY = [
  { time: "08:00", name: "Ana Paula Costa", type: "Evaluation", status: "completed" },
  { time: "09:00", name: "Bruno Ferreira", type: "Follow-up", status: "completed" },
  { time: "10:30", name: "Elena Rodrigues", type: "Session", status: "inprogress" },
  { time: "14:00", name: "Diego Lima", type: "Follow-up", status: "upcoming" },
  { time: "15:30", name: "Gabriela Oliveira", type: "Session", status: "upcoming" },
  { time: "17:00", name: "Carlos Mendes", type: "Evaluation", status: "upcoming" },
];

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  inprogress: "In Progress",
  upcoming: "Upcoming",
};

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("home");

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        {/* Clinic header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarAvatar}>MY</div>
          <div className={styles.sidebarClinic}>
            <span className={styles.clinicName}>Maya Yamamoto</span>
            <span className={styles.clinicTag}>RPG Clinic</span>
          </div>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          <span className={styles.navLabel}>MENU</span>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${activeNav === item.id ? styles.navItemActive : ""}`}
                  onClick={() => setActiveNav(item.id)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom user */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerAvatar}>MY</div>
          <div className={styles.footerInfo}>
            <span className={styles.footerName}>Maya Yamamoto</span>
            <span className={styles.footerRole}>Physiotherapist</span>
          </div>
        </div>
      </aside>

      {/* ── Main wrapper ── */}
      <div className={styles.mainWrapper}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search patients, exercises..."
            />
          </div>

          <div className={styles.topbarRight}>
            <button className={styles.iconBtn} aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className={styles.notifDot} />
            </button>

            <div className={styles.topbarUser}>
              <div className={styles.topbarAvatar}>MY</div>
              <div className={styles.topbarUserInfo}>
                <span className={styles.topbarUserName}>Maya Yamamoto</span>
                <span className={styles.topbarUserRole}>Admin</span>
              </div>
            </div>

            <button className={styles.iconBtn} aria-label="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className={styles.content}>
          {/* Greeting */}
          <div className={styles.greeting}>
            <h1 className={styles.greetingTitle}>
              Bom dia, Maya <span className={styles.wave}>👋</span>
            </h1>
            <p className={styles.greetingSubtitle}>
              Monday, March 2, 2025 — Here&apos;s your daily overview.
            </p>
          </div>

          {/* Stat cards */}
          <div className={styles.statsGrid}>
            {/* Active Patients */}
            <div className={`${styles.statCard} ${styles.statCardAnimated}`} style={{ animationDelay: "0ms" }}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>ACTIVE PATIENTS</span>
                <div className={styles.statIconWrap}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <div className={styles.statValue}>6</div>
              <div className={styles.statChange}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
                2 new this month
              </div>
            </div>

            {/* Weekly Adherence */}
            <div className={`${styles.statCard} ${styles.statCardAnimated}`} style={{ animationDelay: "80ms" }}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>WEEKLY ADHERENCE</span>
                <div className={styles.statIconWrap}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
              </div>
              <div className={styles.statValue}>80%</div>
              <div className={styles.statChange}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
                4% from last week
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: "80%" }} />
              </div>
            </div>

            {/* Sessions Today */}
            <div className={`${styles.statCard} ${styles.statCardAnimated}`} style={{ animationDelay: "160ms" }}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>SESSIONS TODAY</span>
                <div className={styles.statIconWrap}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
              <div className={styles.statValue}>6</div>
              <div className={`${styles.statChange} ${styles.statChangeBlue}`}>
                2 completed
              </div>
            </div>
          </div>

          {/* Bottom grid */}
          <div className={styles.bottomGrid}>
            {/* Patients of the Day */}
            <div className={`${styles.card} ${styles.cardAnimated}`} style={{ animationDelay: "220ms" }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Patients of the Day</h2>
                <button className={styles.cardLink}>View calendar →</button>
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
                <h2 className={styles.cardTitle}>Quick Actions</h2>
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
                    <span className={styles.actionTitle}>View Patient</span>
                    <span className={styles.actionSub}>Open medical records</span>
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
                    <span className={styles.actionTitle}>Create Session</span>
                    <span className={styles.actionSub}>Schedule new appointment</span>
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
                    <span className={styles.actionTitle}>New Prescription</span>
                    <span className={styles.actionSub}>Build exercise routine</span>
                  </div>
                </button>
              </div>

              {/* Next session banner */}
              <div className={styles.nextSession}>
                <div className={styles.nextSessionTop}>
                  <span className={styles.nextSessionLabel}>Next session in</span>
                  <span className={styles.nextSessionTime}>32 min</span>
                </div>
                <div className={styles.nextSessionPatient}>Elena Rodrigues</div>
                <div className={styles.nextSessionMeta}>10:30 · Session</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
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