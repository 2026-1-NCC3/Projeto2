"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./style.module.css";
import { getToken } from "../../login/auth";

interface Patient {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  birthDate: string;
}

interface MedicalRecord {
  id: number;
  patientDescription: string;
  recordedAt: string;
}

interface CreatePatientForm {
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  status: "ATIVO" | "INATIVO";
  passwordHash: string;
}

interface EditPatientForm {
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  status: "ATIVO" | "INATIVO";
}

const STATUS_LABEL: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

function generateRandomPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;

  // Garante pelo menos um de cada tipo
  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digits[Math.floor(Math.random() * digits.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Embaralha
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState(0);
  const [adminId, setAdminId] = useState<number | null>(null);

  // Drawer
  const [selected, setSelected] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Prontuário
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editText, setEditText] = useState("");

  // Editar paciente
  const [editingPatient, setEditingPatient] = useState(false);
  const [editPatientForm, setEditPatientForm] = useState<EditPatientForm>({
    name: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    status: "ATIVO",
  });
  const [savingPatient, setSavingPatient] = useState(false);

  // Criar paciente
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePatientForm>({
    name: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    status: "ATIVO",
    passwordHash: generateRandomPassword(),
  });
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [createError, setCreateError] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Deletar / desativar
  const [deletingPatient, setDeletingPatient] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    }),
    []
  );

  // ── Fetch admin logado ───────────────────────────────
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, {
          headers: authHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        // DecodedJWT retorna subject como string (id do admin)
        setAdminId(Number(data.subject));
      } catch (err) {
        console.error("Erro ao buscar admin:", err);
      }
    };
    fetchMe();
  }, [authHeaders]);

  // ── Fetch pacientes ──────────────────────────────────
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients?page=0&size=100`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Erro ao buscar pacientes");
      const data = await res.json();
      setPatients(data.content ?? []);
      setTotalPatients(data.totalElements ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // ── Fetch prontuário ─────────────────────────────────
  const fetchRecords = useCallback(
    async (patientId: number) => {
      setRecordsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/medical-records/patient/${patientId}`,
          { headers: authHeaders() }
        );
        if (!res.ok) throw new Error("Erro ao buscar prontuário");
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setRecordsLoading(false);
      }
    },
    [authHeaders]
  );

  const handleSelectPatient = (patient: Patient) => {
    setSelected(patient);
    setShowAddNote(false);
    setNewNote("");
    setEditingRecord(null);
    setEditingPatient(false);
    setShowDeleteConfirm(false);
    setEditPatientForm({
      name: patient.name,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      birthDate: patient.birthDate,
      status: patient.status as "ATIVO" | "INATIVO",
    });
    fetchRecords(patient.id);
  };

  const closeDrawer = () => {
    setSelected(null);
    setEditingPatient(false);
    setShowDeleteConfirm(false);
  };

  // ── Criar paciente ───────────────────────────────────
  const handleOpenCreateModal = () => {
    setCreateForm({
      name: "",
      email: "",
      phoneNumber: "",
      birthDate: "",
      status: "ATIVO",
      passwordHash: generateRandomPassword(),
    });
    setCreateError("");
    setPasswordCopied(false);
    setShowCreateModal(true);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(createForm.passwordHash);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleRegeneratePassword = () => {
    setCreateForm((f) => ({ ...f, passwordHash: generateRandomPassword() }));
  };

  const handleCreatePatient = async () => {
    if (
      !createForm.name.trim() ||
      !createForm.email.trim() ||
      !createForm.phoneNumber.trim() ||
      !createForm.birthDate
    ) {
      setCreateError("Preencha todos os campos obrigatórios.");
      return;
    }
    setCreatingPatient(true);
    setCreateError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: createForm.name.trim(),
          email: createForm.email.trim(),
          phoneNumber: createForm.phoneNumber.trim(),
          birthDate: createForm.birthDate,
          status: createForm.status,
          passwordHash: createForm.passwordHash,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Erro ao criar paciente");
      }
      setShowCreateModal(false);
      fetchPatients();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar paciente");
    } finally {
      setCreatingPatient(false);
    }
  };

  // ── Editar paciente ──────────────────────────────────
  const handleSavePatient = async () => {
    if (!selected) return;
    setSavingPatient(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/${selected.id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(editPatientForm),
        }
      );
      if (!res.ok) throw new Error("Erro ao atualizar paciente");
      const updated: Patient = await res.json();
      setSelected(updated);
      setPatients((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setEditingPatient(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPatient(false);
    }
  };

  // ── Toggle status ────────────────────────────────────
  const handleToggleStatus = async () => {
    if (!selected) return;
    setTogglingStatus(true);
    const newStatus = selected.status === "ATIVO" ? "INATIVO" : "ATIVO";
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/${selected.id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            name: selected.name,
            email: selected.email,
            phoneNumber: selected.phoneNumber,
            birthDate: selected.birthDate,
            status: newStatus,
          }),
        }
      );
      if (!res.ok) throw new Error("Erro ao atualizar status");
      const updated: Patient = await res.json();
      setSelected(updated);
      setPatients((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingStatus(false);
    }
  };

  // ── Deletar paciente ─────────────────────────────────
  const handleDeletePatient = async () => {
    if (!selected) return;
    setDeletingPatient(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/${selected.id}`,
        { method: "DELETE", headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Erro ao deletar paciente");
      setPatients((prev) => prev.filter((p) => p.id !== selected.id));
      setTotalPatients((n) => n - 1);
      closeDrawer();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingPatient(false);
      setShowDeleteConfirm(false);
    }
  };

  // ── Adicionar anotação ───────────────────────────────
  const handleAddNote = async () => {
    if (!newNote.trim() || !selected || adminId === null) return;
    setAddingNote(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-records`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            patientDescription: newNote.trim(),
            patient: { id: selected.id },
            admin: { id: adminId },
          }),
        }
      );
      if (!res.ok) throw new Error("Erro ao adicionar anotação");
      setNewNote("");
      setShowAddNote(false);
      fetchRecords(selected.id);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  // ── Editar anotação ──────────────────────────────────
  const handleEditSave = async () => {
    if (!editingRecord || !editText.trim() || !selected || adminId === null)
      return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-records/${editingRecord.id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            patientDescription: editText.trim(),
            patient: { id: selected.id },
            admin: { id: adminId },
          }),
        }
      );
      if (!res.ok) throw new Error("Erro ao editar anotação");
      setEditingRecord(null);
      setEditText("");
      fetchRecords(selected.id);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Deletar anotação ─────────────────────────────────
  const handleDeleteRecord = async (recordId: number) => {
    if (!selected) return;
    if (!confirm("Deseja deletar esta anotação?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-records/${recordId}`,
        { method: "DELETE", headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Erro ao deletar anotação");
      fetchRecords(selected.id);
    } catch (err) {
      console.error(err);
    }
  };

  const activeCount = patients.filter((p) => p.status === "ATIVO").length;
  const inactiveCount = patients.filter((p) => p.status === "INATIVO").length;

  return (
    <>
      {/* ── Cabeçalho ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Pacientes</h1>
          <p className={styles.pageSubtitle}>
            Gerencie e visualize o prontuário de cada paciente.
          </p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={handleOpenCreateModal}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Paciente
        </button>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>TOTAL</span>
            <div className={styles.statIconWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{totalPatients}</div>
          <span className={styles.statDesc}>Pacientes cadastrados</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>ATIVOS</span>
            <div className={`${styles.statIconWrap} ${styles.statIconGreen}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{activeCount}</div>
          <span className={styles.statDesc}>Em acompanhamento</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>INATIVOS</span>
            <div className={`${styles.statIconWrap} ${styles.statIconRed}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </div>
          <div className={styles.statValue}>{inactiveCount}</div>
          <span className={styles.statDesc}>Sem acompanhamento</span>
        </div>
      </div>

      {/* ── Lista ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Lista de Pacientes</h2>
          <span className={styles.cardCount}>{totalPatients} no total</span>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <p>Carregando pacientes...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <p>Nenhum paciente cadastrado.</p>
            <button className={styles.btnPrimarySmall} onClick={handleOpenCreateModal}>
              Cadastrar primeiro paciente
            </button>
          </div>
        ) : (
          <ul className={styles.patientList}>
            {patients.map((p) => (
              <li
                key={p.id}
                className={styles.patientRow}
                onClick={() => handleSelectPatient(p)}
              >
                <div className={`${styles.patientAvatar} ${p.status === "INATIVO" ? styles.patientAvatarInactive : ""}`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.patientInfo}>
                  <span className={styles.patientName}>{p.name}</span>
                  <span className={styles.patientEmail}>{p.email}</span>
                </div>
                <span className={styles.patientPhone}>{p.phoneNumber}</span>
                <span
                  className={`${styles.badge} ${
                    p.status === "ATIVO" ? styles.badgeAtivo : styles.badgeInativo
                  }`}
                >
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          DRAWER — prontuário do paciente
      ══════════════════════════════════════════════════ */}
      {selected && (
        <div className={styles.overlay} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>

            {/* Cabeçalho do drawer */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerPatientHeader}>
                <div className={`${styles.drawerAvatar} ${selected.status === "INATIVO" ? styles.drawerAvatarInactive : ""}`}>
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.drawerHeaderInfo}>
                  <h2 className={styles.drawerTitle}>{selected.name}</h2>
                  <p className={styles.drawerSub}>{selected.email}</p>
                </div>
              </div>

              <div className={styles.drawerHeaderActions}>
                {/* Ativar / Desativar */}
                <button
                  className={`${styles.drawerActionBtn} ${selected.status === "ATIVO" ? styles.drawerActionBtnWarn : styles.drawerActionBtnGreen}`}
                  onClick={handleToggleStatus}
                  disabled={togglingStatus}
                  title={selected.status === "ATIVO" ? "Desativar paciente" : "Ativar paciente"}
                >
                  {togglingStatus ? (
                    <span className={styles.drawerActionSpinner} />
                  ) : selected.status === "ATIVO" ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                      Desativar
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Ativar
                    </>
                  )}
                </button>

                {/* Editar */}
                <button
                  className={`${styles.drawerActionBtn} ${styles.drawerActionBtnNeutral}`}
                  onClick={() => { setEditingPatient(!editingPatient); setShowDeleteConfirm(false); }}
                  title="Editar dados do paciente"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar
                </button>

                {/* Deletar */}
                <button
                  className={`${styles.drawerActionBtn} ${styles.drawerActionBtnDanger}`}
                  onClick={() => { setShowDeleteConfirm(true); setEditingPatient(false); }}
                  title="Remover paciente"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Remover
                </button>

                {/* Fechar */}
                <button className={styles.drawerClose} onClick={closeDrawer}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.drawerBody}>

              {/* ── Confirmação de delete ── */}
              {showDeleteConfirm && (
                <div className={styles.deleteConfirmBox}>
                  <div className={styles.deleteConfirmIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className={styles.deleteConfirmContent}>
                    <p className={styles.deleteConfirmTitle}>Remover paciente?</p>
                    <p className={styles.deleteConfirmText}>
                      Esta ação é permanente e removerá todos os dados de{" "}
                      <strong>{selected.name}</strong>.
                    </p>
                    <div className={styles.deleteConfirmActions}>
                      <button
                        className={styles.cancelNoteBtn}
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        className={styles.btnDanger}
                        onClick={handleDeletePatient}
                        disabled={deletingPatient}
                      >
                        {deletingPatient ? "Removendo..." : "Sim, remover"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Formulário de edição do paciente ── */}
              {editingPatient && !showDeleteConfirm && (
                <div className={styles.editPatientSection}>
                  <p className={styles.sectionLabel}>Editar dados</p>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Nome completo</label>
                      <input
                        className={styles.formInput}
                        value={editPatientForm.name}
                        onChange={(e) =>
                          setEditPatientForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="Nome do paciente"
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>E-mail</label>
                      <input
                        className={styles.formInput}
                        type="email"
                        value={editPatientForm.email}
                        onChange={(e) =>
                          setEditPatientForm((f) => ({ ...f, email: e.target.value }))
                        }
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Telefone</label>
                      <input
                        className={styles.formInput}
                        value={editPatientForm.phoneNumber}
                        onChange={(e) =>
                          setEditPatientForm((f) => ({ ...f, phoneNumber: e.target.value }))
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Data de nascimento</label>
                      <input
                        className={styles.formInput}
                        type="date"
                        value={editPatientForm.birthDate}
                        onChange={(e) =>
                          setEditPatientForm((f) => ({ ...f, birthDate: e.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Status</label>
                      <select
                        className={styles.formInput}
                        value={editPatientForm.status}
                        onChange={(e) =>
                          setEditPatientForm((f) => ({
                            ...f,
                            status: e.target.value as "ATIVO" | "INATIVO",
                          }))
                        }
                      >
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.editActions}>
                    <button
                      className={styles.cancelNoteBtn}
                      onClick={() => setEditingPatient(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className={styles.saveNoteBtn}
                      onClick={handleSavePatient}
                      disabled={savingPatient}
                    >
                      {savingPatient ? "Salvando..." : "Salvar alterações"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Info resumida do paciente ── */}
              {!editingPatient && !showDeleteConfirm && (
                <div className={styles.drawerMeta}>
                  <div className={styles.drawerMetaItem}>
                    <span className={styles.drawerMetaLabel}>Telefone</span>
                    <span className={styles.drawerMetaValue}>{selected.phoneNumber}</span>
                  </div>
                  <div className={styles.drawerMetaItem}>
                    <span className={styles.drawerMetaLabel}>Nascimento</span>
                    <span className={styles.drawerMetaValue}>
                      {new Date(selected.birthDate + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className={styles.drawerMetaItem}>
                    <span className={styles.drawerMetaLabel}>Status</span>
                    <span
                      className={`${styles.badge} ${
                        selected.status === "ATIVO" ? styles.badgeAtivo : styles.badgeInativo
                      }`}
                    >
                      {STATUS_LABEL[selected.status] ?? selected.status}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Prontuário ── */}
              {!editingPatient && !showDeleteConfirm && (
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionHeader}>
                    <span className={styles.sectionLabel}>Prontuário</span>
                    <button
                      className={styles.addNoteBtn}
                      onClick={() => {
                        setShowAddNote(!showAddNote);
                        setEditingRecord(null);
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Nova anotação
                    </button>
                  </div>

                  {/* Form nova anotação */}
                  {showAddNote && (
                    <div className={styles.noteForm}>
                      <textarea
                        className={styles.noteTextarea}
                        placeholder="Descreva a anotação clínica..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div className={styles.noteFormActions}>
                        <button
                          className={styles.cancelNoteBtn}
                          onClick={() => {
                            setShowAddNote(false);
                            setNewNote("");
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          className={styles.saveNoteBtn}
                          onClick={handleAddNote}
                          disabled={addingNote || !newNote.trim()}
                        >
                          {addingNote ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                    </div>
                  )}

                  {recordsLoading ? (
                    <div className={styles.loadingState}>
                      <div className={styles.loadingSpinner} />
                      <p>Carregando prontuário...</p>
                    </div>
                  ) : records.length === 0 ? (
                    <div className={styles.emptyState}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <p>Nenhum registro clínico.</p>
                    </div>
                  ) : (
                    <ul className={styles.recordList}>
                      {records.map((r) => (
                        <li key={r.id} className={styles.recordItem}>
                          {editingRecord?.id === r.id ? (
                            <>
                              <textarea
                                className={styles.noteTextarea}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                                autoFocus
                              />
                              <div className={styles.noteFormActions}>
                                <button
                                  className={styles.cancelNoteBtn}
                                  onClick={() => setEditingRecord(null)}
                                >
                                  Cancelar
                                </button>
                                <button
                                  className={styles.saveNoteBtn}
                                  onClick={handleEditSave}
                                  disabled={!editText.trim()}
                                >
                                  Salvar
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className={styles.recordHeader}>
                                <span className={styles.recordDate}>
                                  {new Date(r.recordedAt).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <div className={styles.recordActions}>
                                  <button
                                    className={styles.recordActionBtn}
                                    onClick={() => {
                                      setEditingRecord(r);
                                      setEditText(r.patientDescription);
                                      setShowAddNote(false);
                                    }}
                                    title="Editar"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    className={`${styles.recordActionBtn} ${styles.recordActionBtnDanger}`}
                                    onClick={() => handleDeleteRecord(r.id)}
                                    title="Deletar"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                      <path d="M10 11v6" /><path d="M14 11v6" />
                                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <p className={styles.recordText}>{r.patientDescription}</p>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL — criar paciente
      ══════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Novo Paciente</h2>
                <p className={styles.modalSub}>
                  Preencha os dados para cadastrar um novo paciente.
                </p>
              </div>
              <button
                className={styles.drawerClose}
                onClick={() => setShowCreateModal(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalFormGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Nome completo <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    placeholder="Ex: Maria da Silva"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    E-mail <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="email"
                    placeholder="maria@email.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Telefone <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    placeholder="(11) 99999-9999"
                    value={createForm.phoneNumber}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        phoneNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Data de nascimento <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="date"
                    value={createForm.birthDate}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        birthDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Status inicial</label>
                  <select
                    className={styles.formInput}
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        status: e.target.value as "ATIVO" | "INATIVO",
                      }))
                    }
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Senha gerada */}
              <div className={styles.passwordBox}>
                <div className={styles.passwordBoxHeader}>
                  <div>
                    <p className={styles.passwordBoxTitle}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Senha provisória gerada
                    </p>
                    <p className={styles.passwordBoxSub}>
                      Compartilhe com o paciente. Ele poderá alterar depois.
                    </p>
                  </div>
                  <button
                    className={styles.regenBtn}
                    onClick={handleRegeneratePassword}
                    title="Gerar nova senha"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Gerar nova
                  </button>
                </div>
                <div className={styles.passwordDisplay}>
                  <code className={styles.passwordCode}>{createForm.passwordHash}</code>
                  <button
                    className={styles.copyBtn}
                    onClick={handleCopyPassword}
                    title="Copiar senha"
                  >
                    {passwordCopied ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copiado!
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {createError && (
                <div className={styles.errorBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {createError}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelNoteBtn}
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleCreatePatient}
                disabled={creatingPatient}
              >
                {creatingPatient ? "Cadastrando..." : "Cadastrar paciente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}