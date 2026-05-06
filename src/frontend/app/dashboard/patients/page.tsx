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

const STATUS_LABEL: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState(0);

  const [selected, setSelected] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);


  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editText, setEditText] = useState("");

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  }), []);

  // ── fetch pacientes ──────────────────────────────────
  useEffect(() => {
    const fetchPatients = async () => {
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
    };
    fetchPatients();
  }, [authHeaders]);

  // ── fetch prontuário ─────────────────────────────────
  const fetchRecords = useCallback(async (patientId: number) => {
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
  }, [authHeaders]);

  const handleSelectPatient = (patient: Patient) => {
    setSelected(patient);
    setShowAddNote(false);
    setNewNote("");
    setEditingRecord(null);
    fetchRecords(patient.id);
  };

  // ── adicionar anotação ───────────────────────────────
  const handleAddNote = async () => {
    if (!newNote.trim() || !selected) return;
    setAddingNote(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-records`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          patientDescription: newNote.trim(),
          patient: { id: selected.id },
        }),
      });
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

  // ── editar anotação ──────────────────────────────────
  const handleEditSave = async () => {
    if (!editingRecord || !editText.trim() || !selected) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-records/${editingRecord.id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            patientDescription: editText.trim(),
            patient: { id: selected.id },
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

  // ── deletar anotação ─────────────────────────────────
  const handleDelete = async (recordId: number) => {
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

  return (
    <>
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>Pacientes</h1>
        <p className={styles.greetingSubtitle}>
          Gerencie e visualize o prontuário de cada paciente.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>TOTAL DE PACIENTES</span>
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
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Lista de Pacientes</h2>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <p>Carregando pacientes...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhum paciente encontrado.</p>
          </div>
        ) : (
          <ul className={styles.patientList}>
            {patients.map((p) => (
              <li key={p.id} className={styles.patientRow} onClick={() => handleSelectPatient(p)}>
                <div className={styles.patientAvatar}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.patientInfo}>
                  <span className={styles.patientName}>{p.name}</span>
                  <span className={styles.patientEmail}>{p.email}</span>
                </div>
                <span className={styles.patientPhone}>{p.phoneNumber}</span>
                <span className={`${styles.badge} ${styles[`badge_${p.status}`]}`}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── drawer prontuário ── */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.drawerClose} onClick={() => setSelected(null)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className={styles.drawerContent}>
              <div className={styles.drawerPatientHeader}>
                <div className={styles.drawerAvatar}>
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className={styles.drawerTitle}>{selected.name}</h2>
                  <p className={styles.drawerSub}>{selected.email}</p>
                </div>
              </div>

              <div className={styles.drawerMeta}>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.drawerMetaLabel}>Telefone</span>
                  <span className={styles.drawerMetaValue}>{selected.phoneNumber}</span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.drawerMetaLabel}>Nascimento</span>
                  <span className={styles.drawerMetaValue}>
                    {new Date(selected.birthDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.drawerMetaLabel}>Status</span>
                  <span className={`${styles.badge} ${styles[`badge_${selected.status}`]}`}>
                    {STATUS_LABEL[selected.status] ?? selected.status}
                  </span>
                </div>
              </div>

              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionHeader}>
                  <span className={styles.drawerSectionLabel}>Prontuário</span>
                  <button
                    className={styles.addNoteBtn}
                    onClick={() => { setShowAddNote(!showAddNote); setEditingRecord(null); }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nova anotação
                  </button>
                </div>

                {/* Form nova anotação */}
                {showAddNote && (
                  <div className={styles.noteForm}>
                    <textarea
                      className={styles.noteTextarea}
                      placeholder="Descreva a anotação..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <div className={styles.noteFormActions}>
                      <button className={styles.cancelNoteBtn} onClick={() => { setShowAddNote(false); setNewNote(""); }}>
                        Cancelar
                      </button>
                      <button className={styles.saveNoteBtn} onClick={handleAddNote} disabled={addingNote}>
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
                    <p>Nenhum registro encontrado.</p>
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
                            />
                            <div className={styles.noteFormActions}>
                              <button className={styles.cancelNoteBtn} onClick={() => setEditingRecord(null)}>Cancelar</button>
                              <button className={styles.saveNoteBtn} onClick={handleEditSave}>Salvar</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={styles.recordHeader}>
                              <span className={styles.recordDate}>
                                {new Date(r.recordedAt).toLocaleDateString("pt-BR", {
                                  day: "2-digit", month: "short", year: "numeric"
                                })}
                              </span>
                              <div className={styles.recordActions}>
                                <button
                                  className={styles.recordActionBtn}
                                  onClick={() => { setEditingRecord(r); setEditText(r.patientDescription); setShowAddNote(false); }}
                                  title="Editar"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  className={`${styles.recordActionBtn} ${styles.recordActionBtnDanger}`}
                                  onClick={() => handleDelete(r.id)}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}