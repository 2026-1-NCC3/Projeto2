"use client";

import { useState, useEffect } from "react";
import styles from "./style.module.css";
import { getToken } from "../../login/auth";

// ─── Tipos ───────────────────────────────────────────────
interface Admin {
  id: number;
  name: string;
  email: string;
  status: "ATIVO" | "INATIVO";
}

// ─── Helpers ─────────────────────────────────────────────
function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const AVATAR_COLORS = ["#31A5BF","#228fa8","#0ea5e9","#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#ef4444"];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

export default function SettingsPage() {

  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal: Novo Admin
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formStatus, setFormStatus] = useState<"ATIVO" | "INATIVO">("ATIVO");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Modal: Redefinir Senha
  const [resetModal, setResetModal] = useState<Admin | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [showResetPwd, setShowResetPwd] = useState(false);

  // Confirmar exclusão
  const [deleteConfirm, setDeleteConfirm] = useState<Admin | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3400);
  };

  const authHeaders = () => ({
    "Authorization": `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  // ── Fetch ────────────────────────────────────────────
  const fetchCurrentAdmin = async () => {
    try {
      const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, { headers: authHeaders() });
      if (!meRes.ok) return;
      const me = await meRes.json();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/${me.subject}`, { headers: authHeaders() });
      if (res.ok) setCurrentAdmin(await res.json());
    } catch { /* silent */ }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin?page=0&size=100`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.content ?? []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCurrentAdmin(); fetchAdmins(); }, []);

  // ── Criar admin ──────────────────────────────────────
  const handleCreate = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError("Preencha todos os campos obrigatórios."); return;
    }
    if (formPassword.length < 6) { setFormError("A senha deve ter pelo menos 6 caracteres."); return; }
    setFormError(""); setFormSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: formName, email: formEmail, passwordHash: formPassword, status: formStatus }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message ?? "Erro ao criar."); }
      closeNewModal();
      showToast("Administrador criado com sucesso!");
      fetchAdmins();
    } catch (e: any) { setFormError(e.message); }
    finally { setFormSubmitting(false); }
  };

  // ── Excluir admin ────────────────────────────────────
  const handleDelete = async (admin: Admin) => {
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/${admin.id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      setDeleteConfirm(null);
      showToast(`Administrador "${admin.name}" removido.`);
      fetchAdmins();
    } catch { showToast("Erro ao remover administrador.", "error"); }
    finally { setDeleteSubmitting(false); }
  };

  // ── Redefinir senha ──────────────────────────────────
  const handleResetPassword = async () => {
    if (!resetPassword.trim() || resetPassword.length < 6) { setResetError("A senha deve ter pelo menos 6 caracteres."); return; }
    setResetError(""); setResetSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/${resetModal!.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ name: resetModal!.name, email: resetModal!.email, passwordHash: resetPassword, status: resetModal!.status }),
      });
      if (!res.ok) throw new Error("Erro ao redefinir.");
      setResetModal(null); setResetPassword("");
      showToast("Senha redefinida com sucesso!");
    } catch (e: any) { setResetError(e.message); }
    finally { setResetSubmitting(false); }
  };

  const closeNewModal = () => {
    setModalOpen(false); setFormName(""); setFormEmail(""); setFormPassword("");
    setFormStatus("ATIVO"); setFormError(""); setShowPassword(false);
  };

  const initials = currentAdmin ? getInitials(currentAdmin.name) : "A";
  const displayName = currentAdmin?.name ?? "Admin";


  return (
    <>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Configurações e Conta</h1>
              <p className={styles.pageSubtitle}>Gerencie administradores e permissões da clínica.</p>
            </div>
          </div>

          {/* Barra da seção */}
          <div className={styles.sectionBar}>
            <div className={styles.sectionBarLeft}>
              <div className={styles.sectionIcon}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <span className={styles.sectionTitle}>Administradores</span>
              {!loading && (
                <span className={styles.sectionCount}>
                  {admins.length} usuário{admins.length !== 1 ? "s" : ""} no sistema
                </span>
              )}
            </div>
            <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Novo Admin
            </button>
          </div>

          {/* Lista */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>Carregando administradores...</span>
            </div>
          ) : admins.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
              <p>Nenhum administrador encontrado.</p>
              <button className={styles.newBtn} onClick={() => setModalOpen(true)}>+ Criar primeiro admin</button>
            </div>
          ) : (
            <div className={styles.adminList}>
              {admins.map((admin, i) => {
                const isMe = currentAdmin?.id === admin.id;
                return (
                  <div key={admin.id} className={styles.adminCard} style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={styles.adminAvatar} style={{ background: avatarColor(admin.id) }}>
                      {getInitials(admin.name)}
                    </div>

                    <div className={styles.adminInfo}>
                      <div className={styles.adminNameRow}>
                        <span className={styles.adminName}>{admin.name}</span>
                        {isMe && <span className={styles.badgeRole}>Proprietário / Fisioterapeuta</span>}
                        <span className={`${styles.badgeStatus} ${admin.status === "ATIVO" ? styles.badgeAtivo : styles.badgeInativo}`}>
                          {admin.status === "ATIVO" ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <span className={styles.adminEmail}>{admin.email}</span>
                      <div className={styles.adminPerms}>
                        {isMe ? (
                          <span className={styles.permTagHighlight}>Todas as permissões</span>
                        ) : (
                          <>
                            {["Pacientes","Exercícios","Agenda","Mensagens"].map((p) => (
                              <span key={p} className={styles.permTag}>{p}</span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    <div className={styles.adminActions}>
                      <button
                        className={styles.resetBtn}
                        onClick={() => { setResetModal(admin); setResetPassword(""); setResetError(""); setShowResetPwd(false); }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93A10 10 0 1 0 21 12" /><polyline points="21 3 21 9 15 9" /></svg>
                        Redefinir Senha
                      </button>
                      {!isMe && (
                        <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(admin)} aria-label="Remover">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

      {/* ─── Modal: Novo Admin ─── */}
      {modalOpen && (
        <div className={styles.overlay} onClick={closeNewModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconWrap}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                </div>
                <div>
                  <h2 className={styles.modalTitle}>Novo Administrador</h2>
                  <p className={styles.modalSubtitle}>Preencha os dados para criar uma nova conta.</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={closeNewModal}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Nome completo <span className={styles.required}>*</span></label>
                <input className={styles.input} placeholder="Ex: Lucas Pereira" value={formName} onChange={(e) => setFormName(e.target.value)} autoFocus />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>E-mail <span className={styles.required}>*</span></label>
                <input className={styles.input} type="email" placeholder="lucas@clinica.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Senha <span className={styles.required}>*</span></label>
                <div className={styles.passwordWrap}>
                  <input className={styles.input} type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                    {showPassword
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
                {formPassword && formPassword.length < 6 && <span className={styles.fieldHint}>Mínimo 6 caracteres.</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <div className={styles.statusToggle}>
                  <button type="button" className={`${styles.statusOpt} ${formStatus === "ATIVO" ? styles.statusOptAtivo : ""}`} onClick={() => setFormStatus("ATIVO")}>
                    <span className={styles.statusDot} style={{ background: formStatus === "ATIVO" ? "#22c55e" : "#c4d0d8" }} />
                    Ativo
                  </button>
                  <button type="button" className={`${styles.statusOpt} ${formStatus === "INATIVO" ? styles.statusOptInativo : ""}`} onClick={() => setFormStatus("INATIVO")}>
                    <span className={styles.statusDot} style={{ background: formStatus === "INATIVO" ? "#ef4444" : "#c4d0d8" }} />
                    Inativo
                  </button>
                </div>
              </div>
              {formError && (
                <div className={styles.errorBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {formError}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeNewModal}>Cancelar</button>
              <button className={styles.submitBtn} onClick={handleCreate} disabled={formSubmitting}>
                {formSubmitting
                  ? <><div className={styles.spinnerSm} />Criando...</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Criar Administrador</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Redefinir Senha ─── */}
      {resetModal && (
        <div className={styles.overlay} onClick={() => setResetModal(null)}>
          <div className={styles.modalSm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconWrap}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <div>
                  <h2 className={styles.modalTitle}>Redefinir Senha</h2>
                  <p className={styles.modalSubtitle}>{resetModal.name}</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setResetModal(null)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Nova senha <span className={styles.required}>*</span></label>
                <div className={styles.passwordWrap}>
                  <input className={styles.input} type={showResetPwd ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} autoFocus />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowResetPwd((v) => !v)} tabIndex={-1}>
                    {showResetPwd
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              </div>
              {resetError && (
                <div className={styles.errorBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {resetError}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setResetModal(null)}>Cancelar</button>
              <button className={styles.submitBtn} onClick={handleResetPassword} disabled={resetSubmitting}>
                {resetSubmitting ? <><div className={styles.spinnerSm} />Salvando...</> : "Salvar nova senha"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Confirmar exclusão ─── */}
      {deleteConfirm && (
        <div className={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modalSm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconWrapRed}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                </div>
                <div>
                  <h2 className={styles.modalTitle}>Remover Administrador</h2>
                  <p className={styles.modalSubtitle}>Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setDeleteConfirm(null)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteMessage}>
                Tem certeza que deseja remover <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email}) do sistema?
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className={styles.dangerBtn} onClick={() => handleDelete(deleteConfirm)} disabled={deleteSubmitting}>
                {deleteSubmitting ? <><div className={styles.spinnerSm} />Removendo...</> : "Sim, remover"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === "success"
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /></svg>
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}
