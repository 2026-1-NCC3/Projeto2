"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./style.module.css";
import logoMaya from "../../assets/logoMaya.png";
import Image from "next/image";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Etapa 1: enviar código ──────────────────────────
  const handleSendCode = async () => {
    if (!email.trim()) { setError("Informe seu e-mail."); return; }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject: "Recuperação de senha — Maya RPG" }),
      });
      if (!res.ok) throw new Error("E-mail não encontrado.");
      setSuccess("Código enviado! Verifique sua caixa de entrada.");
      setStep("code");
    } catch (err: any) {
      setError(err.message ?? "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Etapa 2: verificar código ───────────────────────
  const handleVerifyCode = async () => {
    if (code.length !== 6) { setError("O código deve ter 6 dígitos."); return; }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      });
      const isValid: boolean = await res.json();
      if (!isValid) throw new Error("Código inválido. Tente novamente.");
      setSuccess("Código verificado! Defina sua nova senha.");
      setStep("password");
    } catch (err: any) {
      setError(err.message ?? "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Etapa 3: redefinir senha ────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword.trim()) { setError("Informe a nova senha."); return; }
    if (newPassword !== confirmPassword) { setError("As senhas não coincidem."); return; }
    if (newPassword.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reset-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      if (!res.ok) throw new Error("Erro ao redefinir senha.");
      setSuccess("Senha redefinida com sucesso!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message ?? "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />
      <div className={styles.bgGrid} />

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoMark}>
            <Image src={logoMaya} alt="Logo Maya" width={50} height={50} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Maya Yamamoto</span>
            <span className={styles.logoSubtitle}>Fisioterapia · RPG</span>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>
            {step === "email" && "Recuperar Senha"}
            {step === "code" && "Verificar Código"}
            {step === "password" && "Nova Senha"}
          </span>
          <span className={styles.dividerLine} />
        </div>

        {/* Steps indicator */}
        <div className={styles.steps}>
          {["email", "code", "password"].map((s, i) => (
            <div key={s} className={styles.stepItem}>
              <div className={`${styles.stepDot} ${step === s ? styles.stepDotActive : (["email", "code", "password"].indexOf(step) > i ? styles.stepDotDone : "")}`}>
                {["email", "code", "password"].indexOf(step) > i ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : i + 1}
              </div>
              {i < 2 && <div className={`${styles.stepLine} ${["email", "code", "password"].indexOf(step) > i ? styles.stepLineDone : ""}`} />}
            </div>
          ))}
        </div>

        <div className={styles.form}>
          {/* Etapa 1: Email */}
          {step === "email" && (
            <>
              <p className={styles.stepDesc}>Informe o e-mail da sua conta para receber o código de recuperação.</p>
              <div className={styles.field}>
                <label className={styles.label}>E-mail</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </>
          )}

          {/* Etapa 2: Código */}
          {step === "code" && (
            <>
              <p className={styles.stepDesc}>Digite o código de 6 dígitos enviado para <strong>{email}</strong>.</p>
              <div className={styles.field}>
                <label className={styles.label}>Código de verificação</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.inputCode}`}
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button className={styles.resendLink} onClick={handleSendCode} disabled={isLoading}>
                Reenviar código
              </button>
            </>
          )}

          {/* Etapa 3: Nova senha */}
          {step === "password" && (
            <>
              <p className={styles.stepDesc}>Escolha uma nova senha para sua conta.</p>
              <div className={styles.field}>
                <label className={styles.label}>Nova senha</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button type="button" className={styles.eyeButton} onClick={() => setShowPassword((p) => !p)}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirmar senha</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </>
          )}

          {/* Erro e sucesso */}
          {error && (
            <div className={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {success}
            </div>
          )}

          {/* Botão principal */}
          <button
            className={styles.submitButton}
            disabled={isLoading}
            onClick={step === "email" ? handleSendCode : step === "code" ? handleVerifyCode : handleResetPassword}
          >
            {isLoading ? <span className={styles.spinner} /> : (
              <>
                {step === "email" && "Enviar código"}
                {step === "code" && "Verificar código"}
                {step === "password" && "Redefinir senha"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>

          {/* Voltar para login */}
          <a href="/login" className={styles.backLink}>
            ← Voltar para o login
          </a>
        </div>
      </div>

      <span className={styles.version}>v1.0.0</span>
    </main>
  );
}