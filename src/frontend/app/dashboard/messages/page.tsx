"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./style.module.css";
import { getToken } from "../../login/auth";

// ─── Types ────────────────────────────────────────────────
interface Patient {
  id: number;
  name: string;
  email: string;
  status: "ATIVO" | "INATIVO";
}

interface Message {
  id: number;
  senderType: "PATIENT" | "ADMIN";
  message: string;
  sentAt: string;
  patient: { id: number; name?: string };
  admin: { id: number };
}

// Cache: patientId → mensagens ordenadas por sentAt
type MessagesByPatient = Record<number, Message[]>;

type TabType = "chat" | "notes";

// ─── Helpers ──────────────────────────────────────────────
function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const AVATAR_COLORS = [
  "#31A5BF", "#7c6ff7", "#f97316", "#22c55e",
  "#e879a0", "#3b82f6", "#14b8a6", "#a855f7",
];

function avatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function formatTime(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoje";
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function groupByDate(messages: Message[]): { date: string; items: Message[] }[] {
  const groups: Record<string, Message[]> = {};
  messages.forEach((msg) => {
    const key = new Date(msg.sentAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
  });
  return Object.entries(groups).map(([, items]) => ({
    date: formatDateLabel(items[0].sentAt),
    items,
  }));
}

function sidebarTime(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// ─── Component ────────────────────────────────────────────
export default function MessagesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Cache global: uma única chamada GET /messages agrupa tudo no cliente
  const [messagesByPatient, setMessagesByPatient] = useState<MessagesByPatient>({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adminIdRef = useRef<number | null>(null);

  // ── Auth helpers ──────────────────────────────────────
  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    }),
    []
  );

  // ── Fetch admin ID ────────────────────────────────────
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const meRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/me`,
          { headers: authHeaders() }
        );
        if (!meRes.ok) return;
        const me = await meRes.json();
        adminIdRef.current = Number(me.subject);
      } catch { /* silent */ }
    };
    fetchAdmin();
  }, [authHeaders]);

  // ── Busca todas as mensagens e agrupa por patientId ───
  // O MessagesController expõe GET /messages?page=0&size=N (paginado).
  // Como não há endpoint /messages/patient/{id}, buscamos tudo de uma vez
  // e filtramos no cliente. Funciona bem para clínicas de pequeno porte.
  const fetchAllMessages = useCallback(
    async (silent = false) => {
      if (!silent) setLoadingMessages(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/messages?page=0&size=1000`,
          { headers: authHeaders() }
        );
        if (!res.ok) return;

        const data = await res.json();
        const all: Message[] = data.content ?? [];

        // Agrupa por patient.id
        const grouped: MessagesByPatient = {};
        all.forEach((msg) => {
          const pid = msg.patient?.id;
          if (pid == null) return;
          if (!grouped[pid]) grouped[pid] = [];
          grouped[pid].push(msg);
        });

        // Ordena cada conversa por sentAt (mais antigo → mais novo)
        Object.keys(grouped).forEach((pid) => {
          grouped[Number(pid)].sort(
            (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
          );
        });

        setMessagesByPatient(grouped);
      } catch { /* silent */ }
      finally { if (!silent) setLoadingMessages(false); }
    },
    [authHeaders]
  );

  // ── Fetch inicial: pacientes + mensagens ──────────────
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/patients?page=0&size=200`,
          { headers: authHeaders() }
        );
        if (!res.ok) return;
        const data = await res.json();
        const list: Patient[] = data.content ?? [];
        setPatients(list);
        setFilteredPatients(list);
      } catch { /* silent */ }
    };
    fetchPatients();
    fetchAllMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search filter ─────────────────────────────────────
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    setFilteredPatients(
      !q
        ? patients
        : patients.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.email?.toLowerCase().includes(q)
          )
    );
  }, [searchQuery, patients]);

  // ── Select patient ────────────────────────────────────
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab("chat");
    setInputValue("");
  };

  // ── Polling a cada 5s enquanto há conversa aberta ─────
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedPatient) return;
    pollRef.current = setInterval(() => fetchAllMessages(true), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedPatient, fetchAllMessages]);

  // ── Auto-scroll ao receber novas mensagens ────────────
  const currentMessages = selectedPatient
    ? (messagesByPatient[selectedPatient.id] ?? [])
    : [];

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [currentMessages.length]);

  // ── Auto-resize textarea ──────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  // ── Send message via POST /messages ───────────────────
  // Body esperado pelo MessagesController: { senderType, message, patient: {id}, admin: {id} }
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || !selectedPatient || sending) return;

    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          senderType: "ADMIN",
          message: text,
          patient: { id: selectedPatient.id },
          admin: { id: adminIdRef.current },
        }),
      });

      if (res.ok) {
        setInputValue("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        await fetchAllMessages(true);
      }
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  // ── Enter envia, Shift+Enter quebra linha ─────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Ordena sidebar: conversa mais recente no topo ─────
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const msgsA = messagesByPatient[a.id];
    const msgsB = messagesByPatient[b.id];
    const lastA = msgsA?.[msgsA.length - 1];
    const lastB = msgsB?.[msgsB.length - 1];
    if (!lastA && !lastB) return 0;
    if (!lastA) return 1;
    if (!lastB) return -1;
    return new Date(lastB.sentAt).getTime() - new Date(lastA.sentAt).getTime();
  });

  const grouped = groupByDate(currentMessages);

  return (
    <div className={styles.container}>
      {/* ── Left: Patient list ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <p className={styles.sidebarTitle}>Mensagens</p>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar pacientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.conversationList}>
          {sortedPatients.length === 0 ? (
            <div className={styles.emptyList}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              <span>Nenhum paciente encontrado</span>
            </div>
          ) : (
            sortedPatients.map((patient) => {
              const msgs = messagesByPatient[patient.id] ?? [];
              const last = msgs[msgs.length - 1];
              const isActive = selectedPatient?.id === patient.id;

              return (
                <button
                  key={patient.id}
                  className={`${styles.conversationItem} ${isActive ? styles.conversationItemActive : ""}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div
                    className={styles.convAvatar}
                    style={{ background: avatarColor(patient.id) }}
                  >
                    {getInitials(patient.name)}
                  </div>
                  <div className={styles.convInfo}>
                    <div className={styles.convTop}>
                      <span className={styles.convName}>{patient.name}</span>
                      {last && (
                        <span className={styles.convTime}>{sidebarTime(last.sentAt)}</span>
                      )}
                    </div>
                    <span className={styles.convPreview}>
                      {last
                        ? (last.senderType === "ADMIN" ? "Você: " : "") + last.message
                        : patient.email}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Right: Chat area ── */}
      {!selectedPatient ? (
        <div className={styles.chatArea}>
          <div className={styles.noChatSelected}>
            <div className={styles.noChatIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className={styles.noChatTitle}>Selecione uma conversa</p>
            <p className={styles.noChatSub}>Escolha um paciente para ver o histórico de mensagens</p>
          </div>
        </div>
      ) : (
        <div className={styles.chatArea}>
          {/* Chat header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <div
                className={styles.chatAvatar}
                style={{ background: avatarColor(selectedPatient.id) }}
              >
                {getInitials(selectedPatient.name)}
              </div>
              <div>
                <p className={styles.chatPatientName}>{selectedPatient.name}</p>
                <span
                  className={`${styles.chatPatientStatus} ${
                    selectedPatient.status !== "ATIVO" ? styles.chatStatusInactive : ""
                  }`}
                >
                  {selectedPatient.status === "ATIVO" ? "Paciente ativo" : "Paciente inativo"}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabGroup}>
              <button
                className={`${styles.tabBtn} ${activeTab === "chat" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("chat")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Chat
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "notes" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Notas Internas
              </button>
            </div>
          </div>

          {/* Messages feed */}
          {loadingMessages ? (
            <div className={styles.loadingMessages}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <div className={styles.messagesFeed} ref={feedRef}>
              {currentMessages.length === 0 ? (
                <div className={styles.noChatSelected} style={{ flex: 1 }}>
                  <div className={styles.noChatIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p className={styles.noChatTitle}>Nenhuma mensagem ainda</p>
                  <p className={styles.noChatSub}>Envie a primeira mensagem para {selectedPatient.name}</p>
                </div>
              ) : (
                grouped.map((group, gi) => (
                  <div key={gi}>
                    <div className={styles.dateDivider}>
                      <div className={styles.dateDividerLine} />
                      <span className={styles.dateDividerLabel}>{group.date}</span>
                      <div className={styles.dateDividerLine} />
                    </div>

                    {group.items.map((msg) => {
                      const isAdmin = msg.senderType === "ADMIN";
                      return (
                        <div
                          key={msg.id}
                          className={`${styles.msgRow} ${isAdmin ? styles.msgRowAdmin : styles.msgRowPatient}`}
                        >
                          {!isAdmin && (
                            <div
                              className={styles.msgAvatar}
                              style={{ background: avatarColor(selectedPatient.id) }}
                            >
                              {getInitials(selectedPatient.name)}
                            </div>
                          )}
                          <div style={{ display: "flex", flexDirection: "column", maxWidth: "100%" }}>
                            <div
                              className={`${styles.msgBubble} ${
                                isAdmin ? styles.msgBubbleAdmin : styles.msgBubblePatient
                              }`}
                            >
                              {msg.message}
                            </div>
                            <span className={`${styles.msgTime} ${isAdmin ? styles.msgTimeAdmin : ""}`}>
                              {formatTime(msg.sentAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Input bar */}
          <div className={`${styles.inputBar} ${activeTab === "notes" ? styles.noteInputBar : ""}`}>
            <textarea
              ref={textareaRef}
              className={styles.messageInput}
              placeholder={
                activeTab === "chat"
                  ? `Mensagem para ${selectedPatient.name}...`
                  : "Escrever nota interna (visível apenas para a equipe)..."
              }
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className={`${styles.sendBtn} ${activeTab === "notes" ? styles.sendBtnNote : ""}`}
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
              aria-label="Enviar"
            >
              {sending ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin .7s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}