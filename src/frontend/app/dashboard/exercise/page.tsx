"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./style.module.css";
import { getToken } from "../../login/auth";

// ─── Nav items (same as home) ────────────────────────────
const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    href: "/home",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "patients",
    label: "Pacientes",
    href: "/patients",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "exercises",
    label: "Exercícios",
    href: "/exercises",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Agenda",
    href: "/calendar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Estatísticas",
    href: "/analytics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "messages",
    label: "Mensagens",
    href: "/messages",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Configurações",
    href: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

// ─── Tag list ────────────────────────────────────────────
const TAGS = [
  "Todos", "pescoço", "mobilidade", "alongamento", "quadril",
  "flexibilidade", "ombro", "reabilitação", "core", "estabilidade",
  "fortalecimento", "equilíbrio", "propriocepção", "funcional", "joelho",
];

// ─── Types ───────────────────────────────────────────────
interface ExerciseMedia {
  id?: number;
  imageUrl: string;
}

interface Exercise {
  id: number;
  name: string;
  exerciseDescription: string;
  instructions: string;
  mediaList: ExerciseMedia[];
}

// ─── YouTube helpers ─────────────────────────────────────
function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getYoutubeThumbnail(url: string): string {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

function getYoutubeEmbed(url: string): string {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : "";
}

// ─── Main component ──────────────────────────────────────
export default function ExercisesPage() {
  const router = useRouter();

  // Auth / user
  const [adminName, setAdminName] = useState("Admin");

  // Exercises data
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("Todos");

  // Selected exercise (detail drawer)
  const [selected, setSelected] = useState<Exercise | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formYoutube, setFormYoutube] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const youtubePreviewId = extractYoutubeId(formYoutube);

  // ── Fetch admin name ─────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const token = getToken();
        const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, { headers });
        if (meRes.ok) {
          const me = await meRes.json();
          const adminRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/${me.subject}`, { headers });
          if (adminRes.ok) {
            const data = await adminRes.json();
            setAdminName(data.name);
          }
        }
      } catch { /* silent */ }
    };
    init();
  }, []);

  // ── Fetch exercises ──────────────────────────────────
  const fetchExercises = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise?page=0&size=100`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExercises(data.content ?? []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExercises(); }, []);

  // ── Filter exercises ─────────────────────────────────
  const filtered = exercises.filter((ex) => {
    const matchSearch =
      search === "" ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.exerciseDescription.toLowerCase().includes(search.toLowerCase());
    const matchTag =
      activeTag === "Todos" ||
      ex.name.toLowerCase().includes(activeTag.toLowerCase()) ||
      ex.exerciseDescription.toLowerCase().includes(activeTag.toLowerCase()) ||
      ex.instructions.toLowerCase().includes(activeTag.toLowerCase());
    return matchSearch && matchTag;
  });

  // ── Create exercise ───────────────────────────────────
  const handleCreate = async () => {
    if (!formName.trim() || !formDesc.trim() || !formInstructions.trim()) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }
    setFormError("");
    setFormSubmitting(true);
    try {
      const token = getToken();
      const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

      // 1. Create exercise
      const exRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: formName, exerciseDescription: formDesc, instructions: formInstructions }),
      });
      if (!exRes.ok) throw new Error("Erro ao criar exercício.");
      const newEx: Exercise = await exRes.json();

      // 2. Attach YouTube media if provided
      if (formYoutube.trim() && youtubePreviewId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise/media`, {
          method: "POST",
          headers,
          body: JSON.stringify({ imageUrl: formYoutube.trim(), exercise: { id: newEx.id } }),
        });
      }

      // Reset & close
      setFormName(""); setFormDesc(""); setFormInstructions(""); setFormYoutube("");
      setModalOpen(false);
      fetchExercises();
    } catch (e: any) {
      setFormError(e.message ?? "Erro inesperado.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const initials = adminName.charAt(0).toUpperCase();

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarAvatar}>{initials}</div>
          <div className={styles.sidebarClinic}>
            <span className={styles.clinicName}>{adminName}</span>
            <span className={styles.clinicTag}>RPG Clinic</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navLabel}>MENU</span>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${item.id === "exercises" ? styles.navItemActive : ""}`}
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
            <span className={styles.footerName}>{adminName}</span>
            <span className={styles.footerRole}>Fisioterapeuta</span>
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
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input type="text" className={styles.searchInput} placeholder="Buscar pacientes, exercícios..." />
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.iconBtn} aria-label="Notificações">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className={styles.notifDot} />
            </button>
            <div className={styles.topbarUser}>
              <div className={styles.topbarAvatar}>{initials}</div>
              <div className={styles.topbarUserInfo}>
                <span className={styles.topbarUserName}>{adminName}</span>
                <span className={styles.topbarUserRole}>Admin</span>
              </div>
            </div>
            <button className={styles.iconBtn} aria-label="Sair" onClick={() => router.push("/login")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className={styles.content}>
          {/* Page header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Exercise Library</h1>
              <p className={styles.pageSubtitle}>
                {loading ? "Carregando..." : `${exercises.length} exercício${exercises.length !== 1 ? "s" : ""} disponíve${exercises.length !== 1 ? "is" : "l"}`}
              </p>
            </div>
            <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Novo Exercício
            </button>
          </div>

          {/* Search + tags filter */}
          <div className={styles.filterCard}>
            <div className={styles.filterSearchWrap}>
              <span className={styles.filterSearchIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                className={styles.filterSearch}
                placeholder="Buscar exercícios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.tagRow}>
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  className={`${styles.tagPill} ${activeTag === tag ? styles.tagPillActive : ""}`}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag !== "Todos" && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  )}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className={styles.emptyState}>
              <div className={styles.spinner} />
              <p>Carregando exercícios...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              <p>Nenhum exercício encontrado.</p>
              <button className={styles.newBtn} style={{ marginTop: 8 }} onClick={() => setModalOpen(true)}>
                + Adicionar primeiro exercício
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((ex, i) => {
                const firstMedia = ex.mediaList?.[0];
                const thumb = firstMedia ? getYoutubeThumbnail(firstMedia.imageUrl) : null;
                const isYt = firstMedia && !!extractYoutubeId(firstMedia.imageUrl);

                return (
                  <div
                    key={ex.id}
                    className={styles.card}
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => setSelected(ex)}
                  >
                    <div className={styles.cardThumb}>
                      {thumb ? (
                        <img src={thumb} alt={ex.name} className={styles.cardImg} />
                      ) : (
                        <div className={styles.cardImgPlaceholder}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                          </svg>
                        </div>
                      )}
                      {isYt && (
                        <div className={styles.ytBadge}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-2.75 12.63 12.63 0 0 0-8.45 0A4.83 4.83 0 0 1 3.6 6.69 49.11 49.11 0 0 0 3 12a49.11 49.11 0 0 0 .6 5.31 4.83 4.83 0 0 1 3.77 2.75 12.63 12.63 0 0 0 8.45 0 4.83 4.83 0 0 1 3.77-2.75A49.11 49.11 0 0 0 21 12a49.11 49.11 0 0 0-.41-5.31zM9.75 15.02V8.98L15.5 12z" />
                          </svg>
                          YouTube
                        </div>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{ex.name}</h3>
                      <p className={styles.cardDesc}>{ex.exerciseDescription}</p>
                      <div className={styles.cardFooter}>
                        <span className={styles.cardMediaCount}>
                          {ex.mediaList?.length ?? 0} mídia{(ex.mediaList?.length ?? 0) !== 1 ? "s" : ""}
                        </span>
                        <button className={styles.cardViewBtn} onClick={(e) => { e.stopPropagation(); setSelected(ex); }}>
                          Ver detalhes →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Exercise Detail Drawer ── */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.drawerClose} onClick={() => setSelected(null)} aria-label="Fechar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* YouTube embed */}
            {selected.mediaList?.[0] && extractYoutubeId(selected.mediaList[0].imageUrl) && (
              <div className={styles.drawerVideo}>
                <iframe
                  src={getYoutubeEmbed(selected.mediaList[0].imageUrl)}
                  title={selected.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={styles.drawerIframe}
                />
              </div>
            )}

            <div className={styles.drawerContent}>
              <h2 className={styles.drawerTitle}>{selected.name}</h2>

              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionLabel}>Descrição</span>
                <p className={styles.drawerSectionText}>{selected.exerciseDescription}</p>
              </div>

              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionLabel}>Instruções</span>
                <p className={styles.drawerSectionText}>{selected.instructions}</p>
              </div>

              {(selected.mediaList?.length ?? 0) > 1 && (
                <div className={styles.drawerSection}>
                  <span className={styles.drawerSectionLabel}>Outras Mídias</span>
                  <div className={styles.drawerThumbRow}>
                    {selected.mediaList.slice(1).map((m, i) => {
                      const tid = extractYoutubeId(m.imageUrl);
                      return tid ? (
                        <img key={i} src={`https://img.youtube.com/vi/${tid}/default.jpg`} alt="" className={styles.drawerThumb} />
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── New Exercise Modal ── */}
      {modalOpen && (
        <div className={styles.overlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Novo Exercício</h2>
              <button className={styles.drawerClose} onClick={() => setModalOpen(false)} aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Left: form */}
              <div className={styles.modalForm}>
                <div className={styles.field}>
                  <label className={styles.label}>Nome do exercício <span className={styles.required}>*</span></label>
                  <input
                    className={styles.input}
                    placeholder="Ex: Rotação Cervical"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Descrição <span className={styles.required}>*</span></label>
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Breve descrição do exercício..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Instruções <span className={styles.required}>*</span></label>
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Passo a passo para execução..."
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Link do YouTube
                    <span className={styles.optional}> (opcional)</span>
                  </label>
                  <input
                    className={styles.input}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formYoutube}
                    onChange={(e) => setFormYoutube(e.target.value)}
                  />
                  {formYoutube && !youtubePreviewId && (
                    <span className={styles.fieldHint} style={{ color: "#ef4444" }}>URL do YouTube inválida.</span>
                  )}
                </div>

                {formError && <p className={styles.formError}>{formError}</p>}
              </div>

              {/* Right: YouTube preview */}
              <div className={styles.modalPreview}>
                <span className={styles.previewLabel}>Pré-visualização</span>
                {youtubePreviewId ? (
                  <div className={styles.previewVideo}>
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubePreviewId}?rel=0&modestbranding=1`}
                      title="Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className={styles.previewIframe}
                    />
                  </div>
                ) : (
                  <div className={styles.previewEmpty}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <polygon points="8 21 16 21 12 17" />
                    </svg>
                    <p>Cole um link do YouTube para ver a prévia aqui</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className={styles.submitBtn} onClick={handleCreate} disabled={formSubmitting}>
                {formSubmitting ? (
                  <><div className={styles.spinnerSm} /> Criando...</>
                ) : (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg> Criar Exercício</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}