"use client";

import { useState, useEffect, useCallback } from "react";
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

interface Patient {
  id: number;
  name: string;
  email: string;
  status: string;
}

interface PlanExerciseEntry {
  exerciseId: number;
  days: string[];
  specificNotes: string;
}

interface PlanExerciseDetailItem {
  id?: number;
  frequency: string;
  specificNotes: string | null;
  exercise: {
    id: number;
    name: string;
    exerciseDescription: string;
    instructions: string;
  };
}

interface PlanDetail {
  id: number;
  createdAt: string;
  status: string;
  patient: Patient;
  admin: { id: number };
  planExercises: PlanExerciseDetailItem[];
}

const DAYS = [
  { key: "SEGUNDA",  label: "Seg" },
  { key: "TERÇA",    label: "Ter" },
  { key: "QUARTA",   label: "Qua" },
  { key: "QUINTA",   label: "Qui" },
  { key: "SEXTA",    label: "Sex" },
  { key: "SÁBADO",   label: "Sáb" },
  { key: "DOMINGO",  label: "Dom" },
];

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

const emptyForm = () => ({ name: "", desc: "", instructions: "", youtube: "" });

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return iso;
  }
}

// ─── Main component ──────────────────────────────────────
export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  const [selected, setSelected]   = useState<Exercise | null>(null);

  // Create exercise modal
  const [createOpen, setCreateOpen]           = useState(false);
  const [createForm, setCreateForm]           = useState(emptyForm());
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError]         = useState("");

  // Edit exercise modal
  const [editOpen, setEditOpen]               = useState(false);
  const [editTarget, setEditTarget]           = useState<Exercise | null>(null);
  const [editForm, setEditForm]               = useState(emptyForm());
  const [editSubmitting, setEditSubmitting]   = useState(false);
  const [editError, setEditError]             = useState("");

  // Delete exercise
  const [deleteTarget, setDeleteTarget]       = useState<Exercise | null>(null);
  const [deleteLoading, setDeleteLoading]     = useState(false);

  // ── Plan creation ────────────────────────────────────
  const [planOpen, setPlanOpen]               = useState(false);
  const [patients, setPatients]               = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [adminId, setAdminId]                 = useState<number | null>(null);
  const [planPatientId, setPlanPatientId]     = useState<number | "">("");
  const [planEntries, setPlanEntries]         = useState<PlanExerciseEntry[]>([]);
  const [planExSearch, setPlanExSearch]       = useState("");
  const [planSubmitting, setPlanSubmitting]   = useState(false);
  const [planError, setPlanError]             = useState("");
  const [planSuccess, setPlanSuccess]         = useState(false);

  // ── Manage plans ─────────────────────────────────────
  const [manageOpen, setManageOpen]           = useState(false);
  const [plans, setPlans]                     = useState<PlanDetail[]>([]);
  const [plansLoading, setPlansLoading]       = useState(false);
  const [managePlanSearch, setManagePlanSearch] = useState("");

  // Edit plan
  const [editingPlan, setEditingPlan]             = useState<PlanDetail | null>(null);
  const [editPlanPatientId, setEditPlanPatientId] = useState<number | "">("");
  const [editPlanStatus, setEditPlanStatus]       = useState("ATIVO");
  const [editPlanEntries, setEditPlanEntries]     = useState<PlanExerciseEntry[]>([]);
  const [editPlanExSearch, setEditPlanExSearch]   = useState("");
  const [editPlanSubmitting, setEditPlanSubmitting] = useState(false);
  const [editPlanError, setEditPlanError]         = useState("");

  // Delete plan
  const [deletePlanTarget, setDeletePlanTarget]   = useState<PlanDetail | null>(null);
  const [deletePlanLoading, setDeletePlanLoading] = useState(false);

  const createYtId = extractYoutubeId(createForm.youtube);
  const editYtId   = extractYoutubeId(editForm.youtube);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  }), []);

  // ── Fetch exercises ──────────────────────────────────
  const fetchExercises = useCallback(async () => {
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
  }, [headers]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  // ── Fetch patients + admin (for plan creation) ───────
  const fetchPatientsAndAdmin = useCallback(async () => {
    setPatientsLoading(true);
    try {
      const [pRes, meRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients?page=0&size=200`, { headers: headers() }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, { headers: headers() }),
      ]);
      if (pRes.ok) {
        const data = await pRes.json();
        setPatients((data.content ?? []).filter((p: Patient) => p.status === "ATIVO"));
      }
      if (meRes.ok) {
        const me = await meRes.json();
        setAdminId(Number(me.subject));
      }
    } catch { /* silent */ } finally {
      setPatientsLoading(false);
    }
  }, [headers]);

  const openPlanModal = () => {
    setPlanOpen(true);
    setPlanPatientId("");
    setPlanEntries([]);
    setPlanExSearch("");
    setPlanError("");
    setPlanSuccess(false);
    fetchPatientsAndAdmin();
  };

  // ── Plan: toggle exercise ────────────────────────────
  const togglePlanExercise = (ex: Exercise) => {
    setPlanEntries((prev) => {
      const exists = prev.find((e) => e.exerciseId === ex.id);
      if (exists) return prev.filter((e) => e.exerciseId !== ex.id);
      return [...prev, { exerciseId: ex.id, days: [], specificNotes: "" }];
    });
  };

  const togglePlanDay = (exerciseId: number, day: string) => {
    setPlanEntries((prev) =>
      prev.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const days = e.days.includes(day)
          ? e.days.filter((d) => d !== day)
          : [...e.days, day];
        return { ...e, days };
      })
    );
  };

  const updatePlanNotes = (exerciseId: number, notes: string) => {
    setPlanEntries((prev) =>
      prev.map((e) => (e.exerciseId === exerciseId ? { ...e, specificNotes: notes } : e))
    );
  };

  // ── Plan: submit ─────────────────────────────────────
  const handleCreatePlan = async () => {
    if (!planPatientId) { setPlanError("Selecione um paciente."); return; }
    if (planEntries.length === 0) { setPlanError("Adicione pelo menos um exercício ao plano."); return; }
    const entriesWithoutDays = planEntries.filter((e) => e.days.length === 0);
    if (entriesWithoutDays.length > 0) { setPlanError("Selecione pelo menos um dia para cada exercício."); return; }
    if (adminId === null) { setPlanError("Erro ao identificar o admin. Tente novamente."); return; }

    setPlanError("");
    setPlanSubmitting(true);
    try {
      const body = {
        status: "ATIVO",
        patient: { id: planPatientId },
        admin: { id: adminId },
        planExercises: planEntries.map((e) => ({
          frequency: e.days.join(", "),
          specificNotes: e.specificNotes.trim() || null,
          exercise: { id: e.exerciseId },
        })),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plan`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Erro ao criar o plano.");
      setPlanSuccess(true);
    } catch (err: unknown) {
      setPlanError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPlanSubmitting(false);
    }
  };

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

  const planFilteredExercises = exercises.filter((ex) => {
    if (!planExSearch) return true;
    return ex.name.toLowerCase().includes(planExSearch.toLowerCase());
  });

  // ── Create exercise ───────────────────────────────────
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
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // ── Edit exercise ─────────────────────────────────────
  const openEdit = (ex: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    const firstYt = ex.mediaList?.[0]?.imageUrl ?? "";
    setEditTarget(ex);
    setEditForm({ name: ex.name, desc: ex.exerciseDescription, instructions: ex.instructions, youtube: firstYt });
    setEditError("");
    setEditOpen(true);
  };

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise/${editTarget.id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ name, exerciseDescription: desc, instructions, mediaList: editTarget.mediaList ?? [] }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar exercício.");
      const existingUrl = editTarget.mediaList?.[0]?.imageUrl ?? "";
      if (youtube.trim() && youtube.trim() !== existingUrl && editYtId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise/media`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ imageUrl: youtube.trim(), exercise: { id: editTarget.id } }),
        });
      }
      setEditOpen(false);
      setEditTarget(null);
      if (selected?.id === editTarget.id) setSelected(null);
      fetchExercises();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Delete exercise ───────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercise/${deleteTarget.id}`, {
        method: "DELETE", headers: headers(),
      });
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      fetchExercises();
    } catch { /* silent */ } finally {
      setDeleteLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════
  //  MANAGE PLANS
  // ══════════════════════════════════════════════════════

  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/plan?page=0&size=200`,
        { headers: headers() }
      );
      if (res.ok) {
        const data = await res.json();
        setPlans(data.content ?? []);
      }
    } catch { /* silent */ } finally {
      setPlansLoading(false);
    }
  }, [headers]);

  const openManageModal = () => {
    setManageOpen(true);
    setEditingPlan(null);
    setManagePlanSearch("");
    setDeletePlanTarget(null);
    fetchPlans();
    fetchPatientsAndAdmin();
  };

  const filteredPlans = plans.filter((p) => {
    if (!managePlanSearch) return true;
    const q = managePlanSearch.toLowerCase();
    return (
      p.patient.name.toLowerCase().includes(q) ||
      p.patient.email.toLowerCase().includes(q)
    );
  });

  // ── Start editing a plan ──────────────────────────────
  const startEditPlan = (plan: PlanDetail) => {
    setEditingPlan(plan);
    setEditPlanPatientId(plan.patient.id);
    setEditPlanStatus(plan.status);
    setEditPlanEntries(
      plan.planExercises.map((pe) => ({
        exerciseId: pe.exercise.id,
        days: pe.frequency ? pe.frequency.split(", ").filter(Boolean) : [],
        specificNotes: pe.specificNotes ?? "",
      }))
    );
    setEditPlanExSearch("");
    setEditPlanError("");
  };

  const editPlanFilteredExercises = exercises.filter((ex) => {
    if (!editPlanExSearch) return true;
    return ex.name.toLowerCase().includes(editPlanExSearch.toLowerCase());
  });

  // ── Edit plan: toggle exercise ────────────────────────
  const toggleEditPlanExercise = (ex: Exercise) => {
    setEditPlanEntries((prev) => {
      const exists = prev.find((e) => e.exerciseId === ex.id);
      if (exists) return prev.filter((e) => e.exerciseId !== ex.id);
      return [...prev, { exerciseId: ex.id, days: [], specificNotes: "" }];
    });
  };

  const toggleEditPlanDay = (exerciseId: number, day: string) => {
    setEditPlanEntries((prev) =>
      prev.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const days = e.days.includes(day)
          ? e.days.filter((d) => d !== day)
          : [...e.days, day];
        return { ...e, days };
      })
    );
  };

  const updateEditPlanNotes = (exerciseId: number, notes: string) => {
    setEditPlanEntries((prev) =>
      prev.map((e) => (e.exerciseId === exerciseId ? { ...e, specificNotes: notes } : e))
    );
  };

  // ── Save edited plan ──────────────────────────────────
  const handleSaveEditPlan = async () => {
    if (!editingPlan) return;
    if (!editPlanPatientId) { setEditPlanError("Selecione um paciente."); return; }
    if (editPlanEntries.length === 0) { setEditPlanError("Adicione pelo menos um exercício."); return; }
    const entriesWithoutDays = editPlanEntries.filter((e) => e.days.length === 0);
    if (entriesWithoutDays.length > 0) { setEditPlanError("Selecione pelo menos um dia para cada exercício."); return; }
    if (adminId === null) { setEditPlanError("Erro ao identificar o admin."); return; }

    setEditPlanError("");
    setEditPlanSubmitting(true);
    try {
      const body = {
        status: editPlanStatus,
        patient: { id: editPlanPatientId },
        admin: { id: adminId },
        planExercises: editPlanEntries.map((e) => ({
          frequency: e.days.join(", "),
          specificNotes: e.specificNotes.trim() || null,
          exercise: { id: e.exerciseId },
        })),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plan/${editingPlan.id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao atualizar o plano.");
      setEditingPlan(null);
      fetchPlans();
    } catch (err: unknown) {
      setEditPlanError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setEditPlanSubmitting(false);
    }
  };

  // ── Delete plan ───────────────────────────────────────
  const handleDeletePlan = async () => {
    if (!deletePlanTarget) return;
    setDeletePlanLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plan/${deletePlanTarget.id}`, {
        method: "DELETE",
        headers: headers(),
      });
      setDeletePlanTarget(null);
      if (editingPlan?.id === deletePlanTarget.id) setEditingPlan(null);
      fetchPlans();
    } catch { /* silent */ } finally {
      setDeletePlanLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────
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
        <div className={styles.headerActions}>
          <button className={styles.manageBtn} onClick={openManageModal}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Gerenciar Planos
          </button>
          <button className={styles.planBtn} onClick={openPlanModal}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              <polyline points="9 16 11 18 15 14" />
            </svg>
            Criar Plano
          </button>
          <button className={styles.newBtn} onClick={() => { setCreateForm(emptyForm()); setCreateError(""); setCreateOpen(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Exercício
          </button>
        </div>
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
            <button className={styles.filterClear} onClick={() => setSearch("")}>
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
          <p>{search ? "Nenhum exercício encontrado." : "Nenhum exercício cadastrado ainda."}</p>
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
            const thumb = firstMedia ? getYoutubeThumbnail(firstMedia.imageUrl) : null;
            const isYt  = firstMedia && !!extractYoutubeId(firstMedia.imageUrl);
            return (
              <div key={ex.id} className={styles.card} style={{ animationDelay: `${i * 40}ms` }} onClick={() => setSelected(ex)}>
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
                  <div className={styles.cardActions}>
                    <button className={`${styles.cardActionBtn} ${styles.cardActionEdit}`} onClick={(e) => openEdit(ex, e)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar
                    </button>
                    <button className={`${styles.cardActionBtn} ${styles.cardActionDelete}`} onClick={(e) => { e.stopPropagation(); setDeleteTarget(ex); }}>
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
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{ex.name}</h3>
                  <p className={styles.cardDesc}>{ex.exerciseDescription}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardMediaCount}>{ex.mediaList?.length ?? 0} mídia{(ex.mediaList?.length ?? 0) !== 1 ? "s" : ""}</span>
                    <button className={styles.cardViewBtn} onClick={(e) => { e.stopPropagation(); setSelected(ex); }}>Ver detalhes →</button>
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
              <button className={styles.drawerClose} onClick={() => setSelected(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className={styles.drawerTopActions}>
                <button className={styles.drawerActionBtn} onClick={(e) => { setSelected(null); openEdit(selected, e); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar
                </button>
                <button className={`${styles.drawerActionBtn} ${styles.drawerActionBtnDanger}`} onClick={() => { setDeleteTarget(selected); setSelected(null); }}>
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
                <iframe src={getYoutubeEmbed(selected.mediaList[0].imageUrl)} title={selected.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className={styles.drawerIframe} />
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
                      return tid ? <img key={i} src={`https://img.youtube.com/vi/${tid}/default.jpg`} alt="" className={styles.drawerThumb} /> : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create Exercise Modal ── */}
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

      {/* ── Edit Exercise Modal ── */}
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

      {/* ── Delete Exercise Confirmation ── */}
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
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? <><div className={styles.spinnerSm} /> Excluindo...</> : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          PLAN CREATION MODAL
          ══════════════════════════════════════════════════ */}
      {planOpen && (
        <div className={styles.overlay} onClick={() => !planSubmitting && setPlanOpen(false)}>
          <div className={styles.planModal} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className={styles.planModalHeader}>
              <div className={styles.planModalHeaderLeft}>
                <div className={styles.planModalIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    <polyline points="9 16 11 18 15 14" />
                  </svg>
                </div>
                <div>
                  <h2 className={styles.planModalTitle}>Criar Plano de Exercícios</h2>
                  <p className={styles.planModalSub}>Selecione o paciente, os exercícios e os dias de execução.</p>
                </div>
              </div>
              <button className={styles.drawerClose} onClick={() => setPlanOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {planSuccess ? (
              /* ── Success state ── */
              <div className={styles.planSuccess}>
                <div className={styles.planSuccessIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className={styles.planSuccessTitle}>Plano criado com sucesso!</h3>
                <p className={styles.planSuccessDesc}>
                  O plano foi atribuído ao paciente com {planEntries.length} exercício{planEntries.length !== 1 ? "s" : ""}.
                </p>
                <div className={styles.planSuccessActions}>
                  <button className={styles.cancelBtn} onClick={() => setPlanOpen(false)}>Fechar</button>
                  <button className={styles.submitBtn} onClick={() => { setPlanSuccess(false); setPlanEntries([]); setPlanPatientId(""); }}>
                    Criar outro plano
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Patient selector */}
                <div className={styles.planPatientRow}>
                  <label className={styles.planPatientLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    Paciente
                  </label>
                  {patientsLoading ? (
                    <div className={styles.planPatientLoading}>
                      <div className={styles.spinnerSm} style={{ borderTopColor: "var(--primary)" }} /> Carregando pacientes...
                    </div>
                  ) : (
                    <select
                      className={styles.planPatientSelect}
                      value={planPatientId}
                      onChange={(e) => setPlanPatientId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Selecione um paciente...</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — {p.email}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Body: exercise list + selected entries */}
                <div className={styles.planBody}>

                  {/* Left: exercise checklist */}
                  <div className={styles.planExercisePanel}>
                    <div className={styles.planPanelHeader}>
                      <span className={styles.planPanelTitle}>
                        Exercícios disponíveis
                        <span className={styles.planPanelCount}>{exercises.length}</span>
                      </span>
                    </div>
                    <div className={styles.planExSearchWrap}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        className={styles.planExSearch}
                        placeholder="Buscar exercício..."
                        value={planExSearch}
                        onChange={(e) => setPlanExSearch(e.target.value)}
                      />
                    </div>
                    <ul className={styles.planExList}>
                      {planFilteredExercises.length === 0 ? (
                        <li className={styles.planExEmpty}>Nenhum exercício encontrado.</li>
                      ) : planFilteredExercises.map((ex) => {
                        const isChecked = planEntries.some((e) => e.exerciseId === ex.id);
                        const thumb = ex.mediaList?.[0] ? getYoutubeThumbnail(ex.mediaList[0].imageUrl) : null;
                        return (
                          <li
                            key={ex.id}
                            className={`${styles.planExItem} ${isChecked ? styles.planExItemChecked : ""}`}
                            onClick={() => togglePlanExercise(ex)}
                          >
                            <div className={`${styles.planExCheckbox} ${isChecked ? styles.planExCheckboxChecked : ""}`}>
                              {isChecked && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            {thumb ? (
                              <img src={thumb} alt="" className={styles.planExThumb} />
                            ) : (
                              <div className={styles.planExThumbPlaceholder}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                </svg>
                              </div>
                            )}
                            <span className={styles.planExName}>{ex.name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Right: selected exercises with day pickers */}
                  <div className={styles.planConfigPanel}>
                    <div className={styles.planPanelHeader}>
                      <span className={styles.planPanelTitle}>
                        Plano configurado
                        <span className={styles.planPanelCount}>{planEntries.length}</span>
                      </span>
                      {planEntries.length > 0 && (
                        <button className={styles.planClearBtn} onClick={() => setPlanEntries([])}>
                          Limpar tudo
                        </button>
                      )}
                    </div>

                    {planEntries.length === 0 ? (
                      <div className={styles.planConfigEmpty}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <p>Selecione exercícios ao lado para adicioná-los ao plano.</p>
                      </div>
                    ) : (
                      <ul className={styles.planEntryList}>
                        {planEntries.map((entry) => {
                          const ex = exercises.find((e) => e.id === entry.exerciseId);
                          if (!ex) return null;
                          const thumb = ex.mediaList?.[0] ? getYoutubeThumbnail(ex.mediaList[0].imageUrl) : null;
                          return (
                            <li key={entry.exerciseId} className={styles.planEntryItem}>
                              {/* Exercise header */}
                              <div className={styles.planEntryHeader}>
                                {thumb ? (
                                  <img src={thumb} alt="" className={styles.planEntryThumb} />
                                ) : (
                                  <div className={styles.planEntryThumbPlaceholder}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                    </svg>
                                  </div>
                                )}
                                <span className={styles.planEntryName}>{ex.name}</span>
                                <button
                                  className={styles.planEntryRemove}
                                  onClick={() => togglePlanExercise(ex)}
                                  title="Remover do plano"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>

                              {/* Days picker */}
                              <div className={styles.planEntryDays}>
                                <span className={styles.planEntryDaysLabel}>
                                  Dias de execução{" "}
                                  {entry.days.length === 0 && (
                                    <span className={styles.planEntryDaysRequired}>— selecione ao menos 1</span>
                                  )}
                                </span>
                                <div className={styles.dayChips}>
                                  {DAYS.map((d) => {
                                    const active = entry.days.includes(d.key);
                                    return (
                                      <button
                                        key={d.key}
                                        className={`${styles.dayChip} ${active ? styles.dayChipActive : ""}`}
                                        onClick={() => togglePlanDay(entry.exerciseId, d.key)}
                                      >
                                        {d.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Optional notes */}
                              <div className={styles.planEntryNotesWrap}>
                                <input
                                  className={styles.planEntryNotes}
                                  placeholder="Observações específicas (opcional)..."
                                  value={entry.specificNotes}
                                  onChange={(e) => updatePlanNotes(entry.exerciseId, e.target.value)}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className={styles.planFooter}>
                  {planError && (
                    <div className={styles.planErrorBox}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {planError}
                    </div>
                  )}
                  <div className={styles.planFooterActions}>
                    <div className={styles.planFooterSummary}>
                      {planEntries.length > 0 && (
                        <span>{planEntries.length} exercício{planEntries.length !== 1 ? "s" : ""} · {planEntries.reduce((acc, e) => acc + e.days.length, 0)} sessão{planEntries.reduce((acc, e) => acc + e.days.length, 0) !== 1 ? "ões" : ""}/semana</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className={styles.cancelBtn} onClick={() => setPlanOpen(false)}>Cancelar</button>
                      <button
                        className={styles.submitBtn}
                        onClick={handleCreatePlan}
                        disabled={planSubmitting || planEntries.length === 0 || !planPatientId}
                      >
                        {planSubmitting ? (
                          <><div className={styles.spinnerSm} /> Criando plano...</>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Criar plano
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MANAGE PLANS MODAL
          ══════════════════════════════════════════════════ */}
      {manageOpen && (
        <div className={styles.overlay} onClick={() => { if (!editPlanSubmitting && !deletePlanLoading) setManageOpen(false); }}>
          <div className={styles.manageModal} onClick={(e) => e.stopPropagation()}>

            {/* ── Delete Plan Confirmation (inline) ── */}
            {deletePlanTarget && (
              <div className={styles.overlay} onClick={() => setDeletePlanTarget(null)}>
                <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.confirmIcon}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </div>
                  <h3 className={styles.confirmTitle}>Excluir plano?</h3>
                  <p className={styles.confirmDesc}>
                    Tem certeza que deseja excluir o plano de <strong>{deletePlanTarget.patient.name}</strong> com {deletePlanTarget.planExercises.length} exercício{deletePlanTarget.planExercises.length !== 1 ? "s" : ""}? Esta ação não pode ser desfeita.
                  </p>
                  <div className={styles.confirmActions}>
                    <button className={styles.cancelBtn} onClick={() => setDeletePlanTarget(null)}>Cancelar</button>
                    <button className={styles.deleteBtn} onClick={handleDeletePlan} disabled={deletePlanLoading}>
                      {deletePlanLoading ? <><div className={styles.spinnerSm} /> Excluindo...</> : "Sim, excluir"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {editingPlan === null ? (
              /* ══════════════════════════════════════════
                 LIST VIEW
                 ══════════════════════════════════════════ */
              <>
                {/* Header */}
                <div className={styles.manageHeader}>
                  <div className={styles.manageHeaderLeft}>
                    <div className={styles.manageIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={styles.manageTitle}>Gerenciar Planos</h2>
                      <p className={styles.manageSub}>
                        {plansLoading ? "Carregando..." : `${plans.length} plano${plans.length !== 1 ? "s" : ""} cadastrado${plans.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  <button className={styles.drawerClose} onClick={() => setManageOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Search */}
                <div className={styles.manageSearchWrap}>
                  <span className={styles.manageSearchIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    className={styles.manageSearchInput}
                    placeholder="Buscar por nome ou email do paciente..."
                    value={managePlanSearch}
                    onChange={(e) => setManagePlanSearch(e.target.value)}
                  />
                  {managePlanSearch && (
                    <button className={styles.filterClear} onClick={() => setManagePlanSearch("")}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className={styles.manageBody}>
                  {plansLoading ? (
                    <div className={styles.manageEmpty}>
                      <div className={styles.spinner} />
                      <p>Carregando planos...</p>
                    </div>
                  ) : filteredPlans.length === 0 ? (
                    <div className={styles.manageEmpty}>
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <p>{managePlanSearch ? "Nenhum plano encontrado." : "Nenhum plano cadastrado ainda."}</p>
                    </div>
                  ) : (
                    <div className={styles.manageList}>
                      {filteredPlans.map((plan) => (
                        <div key={plan.id} className={styles.manageCard}>
                          <div className={styles.manageCardTop}>
                            <div className={styles.manageCardAvatar}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                              </svg>
                            </div>
                            <div className={styles.manageCardInfo}>
                              <span className={styles.manageCardName}>{plan.patient.name}</span>
                              <span className={styles.manageCardEmail}>{plan.patient.email}</span>
                            </div>
                            <span className={`${styles.manageCardBadge} ${plan.status === "ATIVO" ? styles.manageCardBadgeActive : styles.manageCardBadgeInactive}`}>
                              {plan.status}
                            </span>
                          </div>
                          <div className={styles.manageCardBottom}>
                            <span className={styles.manageCardMeta}>
                              {plan.planExercises.length} exercício{plan.planExercises.length !== 1 ? "s" : ""} · Criado em {formatDate(plan.createdAt)}
                            </span>
                            <div className={styles.manageCardActions}>
                              <button className={styles.manageCardEditBtn} onClick={() => startEditPlan(plan)} title="Editar plano">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button className={styles.manageCardDeleteBtn} onClick={() => setDeletePlanTarget(plan)} title="Excluir plano">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ══════════════════════════════════════════
                 EDIT VIEW
                 ══════════════════════════════════════════ */
              <>
                {/* Header */}
                <div className={styles.manageEditHeader}>
                  <button className={styles.manageEditBackBtn} onClick={() => setEditingPlan(null)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>
                  <h2 className={styles.manageEditTitle}>Editar Plano #{editingPlan.id}</h2>
                  <button className={styles.drawerClose} onClick={() => setManageOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Selectors row */}
                <div className={styles.manageEditSelectors}>
                  <div className={styles.manageEditField}>
                    <label className={styles.manageEditLabel}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      Paciente
                    </label>
                    <select
                      className={styles.planPatientSelect}
                      value={editPlanPatientId}
                      onChange={(e) => setEditPlanPatientId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Selecione um paciente...</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — {p.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.manageEditField}>
                    <label className={styles.manageEditLabel}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Status
                    </label>
                    <select
                      className={styles.planPatientSelect}
                      value={editPlanStatus}
                      onChange={(e) => setEditPlanStatus(e.target.value)}
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Two-panel body (reuse plan CSS) */}
                <div className={styles.planBody}>

                  {/* Left: exercise checklist */}
                  <div className={styles.planExercisePanel}>
                    <div className={styles.planPanelHeader}>
                      <span className={styles.planPanelTitle}>
                        Exercícios disponíveis
                        <span className={styles.planPanelCount}>{exercises.length}</span>
                      </span>
                    </div>
                    <div className={styles.planExSearchWrap}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        className={styles.planExSearch}
                        placeholder="Buscar exercício..."
                        value={editPlanExSearch}
                        onChange={(e) => setEditPlanExSearch(e.target.value)}
                      />
                    </div>
                    <ul className={styles.planExList}>
                      {editPlanFilteredExercises.length === 0 ? (
                        <li className={styles.planExEmpty}>Nenhum exercício encontrado.</li>
                      ) : editPlanFilteredExercises.map((ex) => {
                        const isChecked = editPlanEntries.some((e) => e.exerciseId === ex.id);
                        const thumb = ex.mediaList?.[0] ? getYoutubeThumbnail(ex.mediaList[0].imageUrl) : null;
                        return (
                          <li
                            key={ex.id}
                            className={`${styles.planExItem} ${isChecked ? styles.planExItemChecked : ""}`}
                            onClick={() => toggleEditPlanExercise(ex)}
                          >
                            <div className={`${styles.planExCheckbox} ${isChecked ? styles.planExCheckboxChecked : ""}`}>
                              {isChecked && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            {thumb ? (
                              <img src={thumb} alt="" className={styles.planExThumb} />
                            ) : (
                              <div className={styles.planExThumbPlaceholder}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                </svg>
                              </div>
                            )}
                            <span className={styles.planExName}>{ex.name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Right: configured exercises */}
                  <div className={styles.planConfigPanel}>
                    <div className={styles.planPanelHeader}>
                      <span className={styles.planPanelTitle}>
                        Plano configurado
                        <span className={styles.planPanelCount}>{editPlanEntries.length}</span>
                      </span>
                      {editPlanEntries.length > 0 && (
                        <button className={styles.planClearBtn} onClick={() => setEditPlanEntries([])}>
                          Limpar tudo
                        </button>
                      )}
                    </div>

                    {editPlanEntries.length === 0 ? (
                      <div className={styles.planConfigEmpty}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <p>Selecione exercícios ao lado para adicioná-los ao plano.</p>
                      </div>
                    ) : (
                      <ul className={styles.planEntryList}>
                        {editPlanEntries.map((entry) => {
                          const ex = exercises.find((e) => e.id === entry.exerciseId);
                          if (!ex) return null;
                          const thumb = ex.mediaList?.[0] ? getYoutubeThumbnail(ex.mediaList[0].imageUrl) : null;
                          return (
                            <li key={entry.exerciseId} className={styles.planEntryItem}>
                              <div className={styles.planEntryHeader}>
                                {thumb ? (
                                  <img src={thumb} alt="" className={styles.planEntryThumb} />
                                ) : (
                                  <div className={styles.planEntryThumbPlaceholder}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                    </svg>
                                  </div>
                                )}
                                <span className={styles.planEntryName}>{ex.name}</span>
                                <button
                                  className={styles.planEntryRemove}
                                  onClick={() => toggleEditPlanExercise(ex)}
                                  title="Remover do plano"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>

                              <div className={styles.planEntryDays}>
                                <span className={styles.planEntryDaysLabel}>
                                  Dias de execução{" "}
                                  {entry.days.length === 0 && (
                                    <span className={styles.planEntryDaysRequired}>— selecione ao menos 1</span>
                                  )}
                                </span>
                                <div className={styles.dayChips}>
                                  {DAYS.map((d) => {
                                    const active = entry.days.includes(d.key);
                                    return (
                                      <button
                                        key={d.key}
                                        className={`${styles.dayChip} ${active ? styles.dayChipActive : ""}`}
                                        onClick={() => toggleEditPlanDay(entry.exerciseId, d.key)}
                                      >
                                        {d.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className={styles.planEntryNotesWrap}>
                                <input
                                  className={styles.planEntryNotes}
                                  placeholder="Observações específicas (opcional)..."
                                  value={entry.specificNotes}
                                  onChange={(e) => updateEditPlanNotes(entry.exerciseId, e.target.value)}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className={styles.planFooter}>
                  {editPlanError && (
                    <div className={styles.planErrorBox}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {editPlanError}
                    </div>
                  )}
                  <div className={styles.planFooterActions}>
                    <div className={styles.planFooterSummary}>
                      {editPlanEntries.length > 0 && (
                        <span>{editPlanEntries.length} exercício{editPlanEntries.length !== 1 ? "s" : ""} · {editPlanEntries.reduce((acc, e) => acc + e.days.length, 0)} sessão{editPlanEntries.reduce((acc, e) => acc + e.days.length, 0) !== 1 ? "ões" : ""}/semana</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className={styles.cancelBtn} onClick={() => setEditingPlan(null)}>Cancelar</button>
                      <button
                        className={styles.submitBtn}
                        onClick={handleSaveEditPlan}
                        disabled={editPlanSubmitting || editPlanEntries.length === 0 || !editPlanPatientId}
                      >
                        {editPlanSubmitting ? (
                          <><div className={styles.spinnerSm} /> Salvando...</>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Salvar alterações
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Exercise Form Modal (create & edit) ─────────────────
interface FormState { name: string; desc: string; instructions: string; youtube: string; }

function ExerciseFormModal({ title, form, ytId, error, submitting, submitLabel, onClose, onChange, onSubmit }: {
  title: string; form: FormState; ytId: string | null; error: string;
  submitting: boolean; submitLabel: string;
  onClose: () => void;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.drawerClose} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalForm}>
            <div className={styles.field}>
              <label className={styles.label}>Nome do exercício <span className={styles.required}>*</span></label>
              <input className={styles.input} placeholder="Ex: Rotação Cervical" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Descrição <span className={styles.required}>*</span></label>
              <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Breve descrição..." value={form.desc} onChange={(e) => onChange("desc", e.target.value)} rows={3} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Instruções <span className={styles.required}>*</span></label>
              <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Passo a passo..." value={form.instructions} onChange={(e) => onChange("instructions", e.target.value)} rows={4} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Link do YouTube <span className={styles.optional}>(opcional)</span></label>
              <input className={styles.input} placeholder="https://www.youtube.com/watch?v=..." value={form.youtube} onChange={(e) => onChange("youtube", e.target.value)} />
              {form.youtube && !ytId && <span className={styles.fieldHint} style={{ color: "#ef4444" }}>URL inválida.</span>}
            </div>
            {error && <p className={styles.formError}>{error}</p>}
          </div>
          <div className={styles.modalPreview}>
            <span className={styles.previewLabel}>Pré-visualização</span>
            {ytId ? (
              <div className={styles.previewVideo}>
                <iframe src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`} title="Preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className={styles.previewIframe} />
              </div>
            ) : (
              <div className={styles.previewEmpty}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><polygon points="8 21 16 21 12 17" />
                </svg>
                <p>Cole um link do YouTube para ver a prévia</p>
              </div>
            )}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.submitBtn} onClick={onSubmit} disabled={submitting}>
            {submitting ? <><div className={styles.spinnerSm} /> Salvando...</> : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
