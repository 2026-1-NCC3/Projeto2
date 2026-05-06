"use client";

import { useState, useEffect } from "react";
import styles from "./style.module.css";
import { getToken } from "../../login/auth";

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

// ─── Empty form state ─────────────────────────────────────
const emptyForm = () => ({
  name: "",
  desc: "",
  instructions: "",
  youtube: "",
});

// ─── Main component ──────────────────────────────────────
export default function ExercisesPage() {
  const [exercises, setExercises]   = useState<Exercise[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");

  // Detail drawer
  const [selected, setSelected]     = useState<Exercise | null>(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm());
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit modal
  const [editOpen, setEditOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [editForm, setEditForm]     = useState(emptyForm());
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError]   = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const createYtId = extractYoutubeId(createForm.youtube);
  const editYtId   = extractYoutubeId(editForm.youtube);

  // ── Auth headers ─────────────────────────────────────
  const headers = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  // ── Fetch exercises ──────────────────────────────────
  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/exercise?page=0&size=100`,
        { headers: headers() }
      );
      if (res.ok) {
        const data = await res.json();
        setExercises(data.content ?? []);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExercises(); }, []);

  // ── Filter ────────────────────────────────────────────
  const filtered = exercises.filter((ex) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ex.name.toLowerCase().includes(q) ||
      ex.exerciseDescription.toLowerCase().includes(q) ||
      ex.instructions.toLowerCase().includes(q)
    );
  });

  // ── Create ────────────────────────────────────────────
  const handleCreate = async () => {
    const { name, desc, instructions, youtube } = createForm;
    if (!name.trim() || !desc.trim() || !instructions.trim()) {
      setCreateError("Preencha todos os campos obrigatórios.");
      return;
    }
    setCreateError("");
    setCreateSubmitting(true);
    try {
      const exRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ name, exerciseDescription: desc, instructions }),
      });
      if (!exRes.ok) throw new Error("Erro ao criar exercício.");
      const newEx: Exercise = await exRes.json();

      if (youtube.trim() && createYtId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise/media`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ imageUrl: youtube.trim(), exercise: { id: newEx.id } }),
        });
      }

      setCreateForm(emptyForm());
      setCreateOpen(false);
      fetchExercises();
    } catch (e: any) {
      setCreateError(e.message ?? "Erro inesperado.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // ── Open edit modal ───────────────────────────────────
  const openEdit = (ex: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    const firstYt = ex.mediaList?.[0]?.imageUrl ?? "";
    setEditTarget(ex);
    setEditForm({
      name: ex.name,
      desc: ex.exerciseDescription,
      instructions: ex.instructions,
      youtube: firstYt,
    });
    setEditError("");
    setEditOpen(true);
  };

  // ── Save edit ─────────────────────────────────────────
  const handleEdit = async () => {
    if (!editTarget) return;
    const { name, desc, instructions, youtube } = editForm;
    if (!name.trim() || !desc.trim() || !instructions.trim()) {
      setEditError("Preencha todos os campos obrigatórios.");
      return;
    }
    setEditError("");
    setEditSubmitting(true);
    try {
      // Update exercise fields
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/exercise/${editTarget.id}`,
        {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({
            name,
            exerciseDescription: desc,
            instructions,
            mediaList: editTarget.mediaList ?? [],
          }),
        }
      );
      if (!res.ok) throw new Error("Erro ao atualizar exercício.");

      // If a new YouTube URL was provided and it differs from existing, add it
      const existingUrl = editTarget.mediaList?.[0]?.imageUrl ?? "";
      if (youtube.trim() && youtube.trim() !== existingUrl && editYtId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise/media`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            imageUrl: youtube.trim(),
            exercise: { id: editTarget.id },
          }),
        });
      }

      setEditOpen(false);
      setEditTarget(null);
      // Update selected drawer if it was the edited exercise
      if (selected?.id === editTarget.id) setSelected(null);
      fetchExercises();
    } catch (e: any) {
      setEditError(e.message ?? "Erro inesperado.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/exercise/${deleteTarget.id}`,
        { method: "DELETE", headers: headers() }
      );
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      fetchExercises();
    } catch { /* silent */ } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Biblioteca de exercícios</h1>
          <p className={styles.pageSubtitle}>
            {loading
              ? "Carregando..."
              : `${exercises.length} exercício${exercises.length !== 1 ? "s" : ""} disponíve${exercises.length !== 1 ? "is" : "l"}`}
          </p>
        </div>
        <button className={styles.newBtn} onClick={() => { setCreateForm(emptyForm()); setCreateError(""); setCreateOpen(true); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Exercício
        </button>
      </div>

      {/* Search bar */}
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
            placeholder="Buscar por nome, descrição ou instruções..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.filterClear} onClick={() => setSearch("")} aria-label="Limpar busca">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        {search && (
          <p className={styles.searchCount}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para <strong>"{search}"</strong>
          </p>
        )}
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
          <p>{search ? "Nenhum exercício encontrado para esta busca." : "Nenhum exercício cadastrado ainda."}</p>
          {!search && (
            <button className={styles.newBtn} style={{ marginTop: 8 }} onClick={() => { setCreateForm(emptyForm()); setCreateOpen(true); }}>
              + Adicionar primeiro exercício
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((ex, i) => {
            const firstMedia = ex.mediaList?.[0];
            const thumb      = firstMedia ? getYoutubeThumbnail(firstMedia.imageUrl) : null;
            const isYt       = firstMedia && !!extractYoutubeId(firstMedia.imageUrl);

            return (
              <div
                key={ex.id}
                className={styles.card}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => setSelected(ex)}
              >
                {/* Thumbnail */}
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

                  {/* Action buttons on hover */}
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.cardActionBtn} ${styles.cardActionEdit}`}
                      onClick={(e) => openEdit(ex, e)}
                      title="Editar exercício"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      className={`${styles.cardActionBtn} ${styles.cardActionDelete}`}
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(ex); }}
                      title="Excluir exercício"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{ex.name}</h3>
                  <p className={styles.cardDesc}>{ex.exerciseDescription}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardMediaCount}>
                      {ex.mediaList?.length ?? 0} mídia{(ex.mediaList?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                    <button
                      className={styles.cardViewBtn}
                      onClick={(e) => { e.stopPropagation(); setSelected(ex); }}
                    >
                      Ver detalhes →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Exercise Detail Drawer ── */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerTopBar}>
              <button className={styles.drawerClose} onClick={() => setSelected(null)} aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className={styles.drawerTopActions}>
                <button
                  className={styles.drawerActionBtn}
                  onClick={(e) => { setSelected(null); openEdit(selected, e); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar
                </button>
                <button
                  className={`${styles.drawerActionBtn} ${styles.drawerActionBtnDanger}`}
                  onClick={() => { setDeleteTarget(selected); setSelected(null); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Excluir
                </button>
              </div>
            </div>

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

      {/* ── Create Modal ── */}
      {createOpen && (
        <ExerciseFormModal
          title="Novo Exercício"
          form={createForm}
          ytId={createYtId}
          error={createError}
          submitting={createSubmitting}
          submitLabel="Criar Exercício"
          onClose={() => setCreateOpen(false)}
          onChange={(field, val) => setCreateForm((f) => ({ ...f, [field]: val }))}
          onSubmit={handleCreate}
        />
      )}

      {/* ── Edit Modal ── */}
      {editOpen && editTarget && (
        <ExerciseFormModal
          title={`Editar: ${editTarget.name}`}
          form={editForm}
          ytId={editYtId}
          error={editError}
          submitting={editSubmitting}
          submitLabel="Salvar alterações"
          onClose={() => { setEditOpen(false); setEditTarget(null); }}
          onChange={(field, val) => setEditForm((f) => ({ ...f, [field]: val }))}
          onSubmit={handleEdit}
        />
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 className={styles.confirmTitle}>Excluir exercício?</h3>
            <p className={styles.confirmDesc}>
              Tem certeza que deseja excluir <strong>"{deleteTarget.name}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <><div className={styles.spinnerSm} /> Excluindo...</>
                ) : (
                  "Sim, excluir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Shared form modal (create & edit) ───────────────────
interface FormState { name: string; desc: string; instructions: string; youtube: string; }

function ExerciseFormModal({
  title, form, ytId, error, submitting, submitLabel,
  onClose, onChange, onSubmit,
}: {
  title: string;
  form: FormState;
  ytId: string | null;
  error: string;
  submitting: boolean;
  submitLabel: string;
  onClose: () => void;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Form */}
          <div className={styles.modalForm}>
            <div className={styles.field}>
              <label className={styles.label}>Nome do exercício <span className={styles.required}>*</span></label>
              <input
                className={styles.input}
                placeholder="Ex: Rotação Cervical"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Descrição <span className={styles.required}>*</span></label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Breve descrição do exercício..."
                value={form.desc}
                onChange={(e) => onChange("desc", e.target.value)}
                rows={3}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Instruções <span className={styles.required}>*</span></label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Passo a passo para execução..."
                value={form.instructions}
                onChange={(e) => onChange("instructions", e.target.value)}
                rows={4}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Link do YouTube <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                className={styles.input}
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.youtube}
                onChange={(e) => onChange("youtube", e.target.value)}
              />
              {form.youtube && !ytId && (
                <span className={styles.fieldHint} style={{ color: "#ef4444" }}>URL do YouTube inválida.</span>
              )}
            </div>
            {error && <p className={styles.formError}>{error}</p>}
          </div>

          {/* Preview */}
          <div className={styles.modalPreview}>
            <span className={styles.previewLabel}>Pré-visualização</span>
            {ytId ? (
              <div className={styles.previewVideo}>
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
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
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.submitBtn} onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <><div className={styles.spinnerSm} /> Salvando...</>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}