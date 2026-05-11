"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./layout.module.css";
import { getToken, removeToken } from "../login/auth";

// ─── Nav items ────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: "home", label: "Home", href: "/dashboard/home",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>),
  },
  {
    id: "patients", label: "Pacientes", href: "/dashboard/patients",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
  },
  {
    id: "exercises", label: "Exercícios", href: "/dashboard/exercise",
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" /><path d="M3 9.5v5" /><path d="M21 9.5v5" /><path d="M3 12h18" /><rect x="1" y="9" width="4" height="6" rx="1" /><rect x="19" y="9" width="4" height="6" rx="1" /><rect x="6" y="5" width="3" height="14" rx="1" /><rect x="15" y="5" width="3" height="14" rx="1" /></svg>),
  },
  {
    id: "calendar", label: "Agenda", href: "/dashboard/calendar",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
  },
  {
    id: "messages", label: "Mensagens", href: "/dashboard/messages",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>),
  },
  {
    id: "settings", label: "Configurações", href: "/dashboard/settings",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>),
  },
];

// ─── Helpers ─────────────────────────────────────────────
function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Search result types ─────────────────────────────────
type ResultKind = "patient" | "exercise";

interface SearchResult {
  id: number;
  label: string;
  sub: string;
  kind: ResultKind;
  href: string;
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

  // ── Search state ────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Logout modal state ───────────────────────────────
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  }), []);

  // ── Fetch current admin ──────────────────────────────
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

  // ── Close search dropdown on outside click ───────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Debounced search ─────────────────────────────────
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      setSearchOpen(true);
      try {
        const headers = authHeaders();

        const [patientsRes, exercisesRes] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients?page=0&size=100`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise?page=0&size=100`, { headers }),
        ]);

        const results: SearchResult[] = [];
        const lq = q.toLowerCase();

        // Patients
        if (patientsRes.status === "fulfilled" && patientsRes.value.ok) {
          const data = await patientsRes.value.json();
          const patients: any[] = data.content ?? [];
          patients
            .filter((p: any) =>
              p.name?.toLowerCase().includes(lq) ||
              p.email?.toLowerCase().includes(lq) ||
              p.cpf?.toLowerCase().includes(lq)
            )
            .slice(0, 5)
            .forEach((p: any) => {
              results.push({
                id: p.id,
                label: p.name,
                sub: p.email ?? "Paciente",
                kind: "patient",
                href: `/dashboard/patients/${p.id}`,
              });
            });
        }

        // Exercises
        if (exercisesRes.status === "fulfilled" && exercisesRes.value.ok) {
          const data = await exercisesRes.value.json();
          const exercises: any[] = data.content ?? [];
          exercises
            .filter((ex: any) =>
              ex.name?.toLowerCase().includes(lq) ||
              ex.exerciseDescription?.toLowerCase().includes(lq)
            )
            .slice(0, 5)
            .forEach((ex: any) => {
              results.push({
                id: ex.id,
                label: ex.name,
                sub: ex.exerciseDescription ?? "Exercício",
                kind: "exercise",
                href: `/dashboard/exercise`,
              });
            });
        }

        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 320);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [searchQuery, authHeaders]);

  // ── Navigate to result ───────────────────────────────
  const handleSelectResult = (result: SearchResult) => {
    setSearchQuery("");
    setSearchOpen(false);
    setSearchResults([]);
    router.push(result.href);
  };

  // ── Logout ───────────────────────────────────────────
  const handleConfirmLogout = () => {
    removeToken();
    router.push("/login");
  };

  const initials = currentAdmin ? getInitials(currentAdmin.name) : "A";
  const displayName = currentAdmin?.name ?? "Admin";
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
        {/* sidebar footer removido */}
      </aside>

      {/* ── Main ── */}
      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          {/* ── Search ── */}
          <div className={styles.searchWrapper} ref={searchRef}>
            <span className={styles.searchIcon}>
              {searchLoading ? (
                <span className={styles.searchSpinner} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar pacientes, exercícios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
            />

            {/* Dropdown */}
            {searchOpen && (
              <div className={styles.searchDropdown}>
                {searchResults.length === 0 && !searchLoading ? (
                  <div className={styles.searchEmpty}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Nenhum resultado para <strong>"{searchQuery}"</strong></span>
                  </div>
                ) : (
                  <>
                    {/* Group: Patients */}
                    {searchResults.filter(r => r.kind === "patient").length > 0 && (
                      <div className={styles.searchGroup}>
                        <span className={styles.searchGroupLabel}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                          Pacientes
                        </span>
                        {searchResults.filter(r => r.kind === "patient").map(r => (
                          <button key={`p-${r.id}`} className={styles.searchItem} onClick={() => handleSelectResult(r)}>
                            <span className={styles.searchItemIcon} data-kind="patient">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                            </span>
                            <span className={styles.searchItemText}>
                              <span className={styles.searchItemLabel}>{r.label}</span>
                              <span className={styles.searchItemSub}>{r.sub}</span>
                            </span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><polyline points="9 18 15 12 9 6" /></svg>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Group: Exercises */}
                    {searchResults.filter(r => r.kind === "exercise").length > 0 && (
                      <div className={styles.searchGroup}>
                        <span className={styles.searchGroupLabel}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /></svg>
                          Exercícios
                        </span>
                        {searchResults.filter(r => r.kind === "exercise").map(r => (
                          <button key={`e-${r.id}`} className={styles.searchItem} onClick={() => handleSelectResult(r)}>
                            <span className={styles.searchItemIcon} data-kind="exercise">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /></svg>
                            </span>
                            <span className={styles.searchItemText}>
                              <span className={styles.searchItemLabel}>{r.label}</span>
                              <span className={styles.searchItemSub}>{r.sub}</span>
                            </span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><polyline points="9 18 15 12 9 6" /></svg>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Topbar right: user + logout ── */}
          <div className={styles.topbarRight}>
            <div className={styles.topbarUser}>
              <div className={styles.topbarAvatar}>{initials}</div>
              <div className={styles.topbarUserInfo}>
                <span className={styles.topbarUserName}>{displayName}</span>
                <span className={styles.topbarUserRole}>Admin</span>
              </div>
            </div>

            <button
              className={styles.iconBtn}
              onClick={() => setLogoutModalOpen(true)}
              aria-label="Sair"
              title="Sair"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>

      {/* ── Logout Confirmation Modal ── */}
      {logoutModalOpen && (
        <div className={styles.logoutOverlay} onClick={() => setLogoutModalOpen(false)}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            {/* Icon */}
            <div className={styles.logoutIconWrap}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            <h2 className={styles.logoutTitle}>Sair da conta</h2>
            <p className={styles.logoutDesc}>
              Tem certeza que deseja encerrar a sessão? Você precisará fazer login novamente para acessar o sistema.
            </p>

            <div className={styles.logoutActions}>
              <button
                className={styles.logoutCancel}
                onClick={() => setLogoutModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.logoutConfirm}
                onClick={handleConfirmLogout}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sim, sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}