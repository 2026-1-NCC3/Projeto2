"use client";

import { useState } from "react";
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

 //substituir por fetch da API quando backend estiver integrado
const MOCK_PATIENTS: Patient[] = [
  { id: 1, name: "Ana Paula Costa", email: "ana@email.com", phoneNumber: "11999990001", status: "ATIVO", birthDate: "1990-03-15" },
  { id: 2, name: "Bruno Ferreira", email: "bruno@email.com", phoneNumber: "11999990002", status: "ATIVO", birthDate: "1985-07-22" },
  { id: 3, name: "Elena Rodrigues", email: "elena@email.com", phoneNumber: "11999990003", status: "ATIVO", birthDate: "1995-11-08" },
  { id: 4, name: "Diego Lima", email: "diego@email.com", phoneNumber: "11999990004", status: "INATIVO", birthDate: "1988-01-30" },
  { id: 5, name: "Gabriela Oliveira", email: "gabriela@email.com", phoneNumber: "11999990005", status: "ATIVO", birthDate: "2000-05-19" },
];

const MOCK_RECORDS: Record<number, MedicalRecord[]> = {
  1: [
    { id: 1, patientDescription: "Paciente relata dor lombar há 2 semanas.", recordedAt: "2026-04-01T10:00:00" },
    { id: 2, patientDescription: "Melhora significativa após sessões de RPG.", recordedAt: "2026-04-15T10:00:00" },
  ],
  2: [
    { id: 3, patientDescription: "Queixa de tensão cervical e dores de cabeça frequentes.", recordedAt: "2026-03-20T09:00:00" },
  ],
  3: [],
  4: [
    { id: 4, patientDescription: "Paciente em reabilitação pós-cirurgia no joelho.", recordedAt: "2026-02-10T14:00:00" },
  ],
  5: [],
};

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const handleSelectPatient = (patient: Patient) => {
    setSelected(patient);
    setRecords(MOCK_RECORDS[patient.id] ?? []);
  };

  const filtered = MOCK_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className={styles.statValue}>{MOCK_PATIENTS.length}</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Lista de Pacientes</h2>
          <div className={styles.searchBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <ul className={styles.patientList}>
          {filtered.map((p) => (
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
      </div>

      {/* ── prontuário que abre ao clicar no paciente ── */}
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
                <span className={styles.drawerSectionLabel}>Prontuário</span>
                {records.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Nenhum registro encontrado.</p>
                  </div>
                ) : (
                  <ul className={styles.recordList}>
                    {records.map((r) => (
                      <li key={r.id} className={styles.recordItem}>
                        <span className={styles.recordDate}>
                          {new Date(r.recordedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </span>
                        <p className={styles.recordText}>{r.patientDescription}</p>
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