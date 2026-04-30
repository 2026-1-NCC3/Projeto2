"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./layout.module.css";
import { getToken } from "../login/auth";

// ─── Nav items ────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: "home", label: "Home", href: "/home",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>),
  },
  {
    id: "patients", label: "Pacientes", href: "/patients",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
  },
  {
    id: "exercises", label: "Exercícios", href: "/exercises",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>),
  },
  {
    id: "calendar", label: "Agenda", href: "/calendar",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
  },
  {
    id: "analytics", label: "Estatísticas", href: "/analytics",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>),
  },
  {
    id: "messages", label: "Mensagens", href: "/messages",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>),
  },
  {
    id: "settings", label: "Configurações", href: "/settings",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>),
  },
];

// ─── Helpers ─────────────────────────────────────────────
function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface CurrentAdmin {
  id: number;
  name: string;
  email: string;
  status: "ATIVO" | "INATIVO";
}

// ─── Layout principal ────────────────────────────────────
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const fetchCurrentAdmin = async () => {
    try {
      const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, { headers: authHeaders() });
      if (!meRes.ok) return;
      const me = await meRes.json();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/${me.subject}`, { headers: authHeaders() });
      if (res.ok) setCurrentAdmin(await res.json());
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchCurrentAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = currentAdmin ? getInitials(currentAdmin.name) : "A";
  const displayName = currentAdmin?.name ?? "Admin";

  // Determina o item ativo baseado no pathname atual
  const activeNavId = NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.id ?? "";

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarAvatar}>{initials}</div>
          <div className={styles.sidebarClinic}>
            <span className={styles.clinicName}>{displayName}</span>
            <span className={styles.clinicTag}>RPG Clinic</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navLabel}>MENU</span>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${item.id === activeNavId ? styles.navItemActive : ""}`}
                  onClick={() => router.push(item.href)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.footerAvatar}>{initials}</div>
          <div className={styles.footerInfo}>
            <span className={styles.footerName}>{displayName}</span>
            <span className={styles.footerRole}>Fisioterapeuta</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input type="text" className={styles.searchInput} placeholder="Buscar pacientes, exercícios..." />
          </div>

          <div className={styles.topbarRight}>
            <button className={styles.iconBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              <span className={styles.notifDot} />
            </button>

            <div className={styles.topbarUser}>
              <div className={styles.topbarAvatar}>{initials}</div>
              <div className={styles.topbarUserInfo}>
                <span className={styles.topbarUserName}>{displayName}</span>
                <span className={styles.topbarUserRole}>Admin</span>
              </div>
            </div>

            <button className={styles.iconBtn} onClick={() => router.push("/login")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
