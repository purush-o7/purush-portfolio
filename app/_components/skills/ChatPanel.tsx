"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence }     from "framer-motion"
import { ACCENT, MONO, CHAT_INITIAL, CHAT_OPTIONS, CHAT_CLOSING } from "./data"
import { ClaudeIcon } from "./ClaudeIcon"

const TYPING_MS   = 700
const MSG_SPRING  = { type: "spring", stiffness: 320, damping: 28 } as const
const PILL_SPRING = { type: "spring", stiffness: 380, damping: 32 } as const

interface Message {
  role:   "agent" | "user"
  text:   string
  optId?: string   // used for layoutId shared-element transition
}

// ── Avatars ───────────────────────────────────────────────────────────────────
function AgentAvatar({ compact }: { compact: boolean }) {
  const sz = compact ? 20 : 24
  return (
    <div style={{
      width: sz, height: sz, borderRadius: "50%", flexShrink: 0,
      alignSelf: "flex-end", marginBottom: 2,
      background: "rgba(217,119,6,0.10)", border: "1px solid rgba(217,119,6,0.28)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <ClaudeIcon size={compact ? 11 : 13} />
    </div>
  )
}

function UserAvatar({ compact }: { compact: boolean }) {
  const sz = compact ? 20 : 24
  return (
    <div style={{
      width: sz, height: sz, borderRadius: "50%", flexShrink: 0,
      alignSelf: "flex-end", marginBottom: 2,
      background: "linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(139,92,246,0.08) 100%)",
      border: "1px solid rgba(167,139,250,0.35)",
      boxShadow: "0 0 8px rgba(167,139,250,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width={compact ? 11 : 13} height={compact ? 11 : 13} viewBox="0 0 14 14" fill="none">
        <text
          x="1" y="11"
          fontFamily="var(--font-geist-mono)"
          fontSize="10"
          fontWeight="600"
          fill="rgba(167,139,250,0.9)"
        >{"{}"}</text>
      </svg>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props { active: boolean; clearTrigger?: number; onClear?: () => void; compact?: boolean }

export function ChatPanel({ active, clearTrigger = 0, onClear, compact = false }: Props) {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [usedIds,   setUsedIds]   = useState<Set<string>>(new Set())
  const [isTyping,  setIsTyping]  = useState(false)
  const [closed,    setClosed]    = useState(false)
  const scrollRef                 = useRef<HTMLDivElement>(null)
  const initRef                   = useRef(false)
  const clearRef                  = useRef(clearTrigger)

  // Reset on clear
  useEffect(() => {
    if (clearTrigger === clearRef.current) return
    clearRef.current = clearTrigger
    setMessages([]); setUsedIds(new Set())
    setIsTyping(false); setClosed(false)
    initRef.current = false
    if (active) {
      setTimeout(() => {
        setMessages([{ role: "agent", text: CHAT_INITIAL }])
        initRef.current = true
      }, 350)
    }
  }, [clearTrigger, active])

  useEffect(() => {
    if (!active) {
      setMessages([]); setUsedIds(new Set())
      setIsTyping(false); setClosed(false)
      initRef.current = false
      return
    }
    if (initRef.current) return
    initRef.current = true
    setTimeout(() => setMessages([{ role: "agent", text: CHAT_INITIAL }]), 400)
  }, [active])

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isTyping])

  function handleOption(id: string, question: string, answer: string) {
    if (isTyping || closed) return
    // User message carries optId — this is the target of the pill's layoutId
    setMessages(m => [...m, { role: "user", text: question, optId: id }])
    const next = new Set([...usedIds, id])
    setUsedIds(next)
    setIsTyping(true)
    setTimeout(() => {
      setMessages(m => [...m, { role: "agent", text: answer }])
      setIsTyping(false)
      if (next.size >= CHAT_OPTIONS.length)
        setTimeout(() => {
          setMessages(m => [...m, { role: "agent", text: CHAT_CLOSING }])
          setClosed(true)
        }, 450)
    }, TYPING_MS)
  }

  const remaining = CHAT_OPTIONS.filter(o => !usedIds.has(o.id))
  const fs   = compact ? 10 : 11
  const bpad = compact ? "7px 10px" : "9px 13px"

  return (
    <div style={{ height: "100%", background: "#06060f", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        padding: compact ? "8px 12px" : "10px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ delay: 0.2, ...PILL_SPRING }}
          style={{
            width: compact ? 26 : 30, height: compact ? 26 : 30, borderRadius: "50%",
            background: "rgba(217,119,6,0.10)", border: "1px solid rgba(217,119,6,0.30)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ClaudeIcon size={compact ? 13 : 15} />
        </motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: MONO, fontSize: compact ? 10 : 11, color: "rgba(255,255,255,0.8)", letterSpacing: "0.05em" }}>
            claude-agent
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: ACCENT, opacity: 0.55, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Skills Analyst · Online
          </div>
        </div>

        {/* Clear button — desktop only (mobile has it in the tab bar) */}
        {!compact && onClear && (
          <button
            onClick={onClear}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 10px",
              fontFamily: MONO, fontSize: 9,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 4, cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.color = "rgba(255,255,255,0.55)"
              b.style.borderColor = "rgba(255,255,255,0.18)"
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.color = "rgba(255,255,255,0.22)"
              b.style.borderColor = "rgba(255,255,255,0.07)"
            }}
          >
            <span style={{ fontSize: 12, lineHeight: 1 }}>↺</span>
            clear
          </button>
        )}
      </div>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <div ref={scrollRef} data-scroll-passthrough style={{
        flex: 1, overflow: "auto",
        overscrollBehavior: "contain",
        padding: compact ? "10px 10px 6px" : "14px 14px 8px",
        display: "flex", flexDirection: "column", gap: compact ? 8 : 10,
      }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              transition={MSG_SPRING}
              style={{
                display: "flex", alignItems: "flex-end", gap: compact ? 5 : 7,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "agent" && <AgentAvatar compact={compact} />}

              {/* Bubble — user bubbles use layoutId to receive the travelling pill */}
              <motion.div
                layoutId={msg.optId ? `pill-${msg.optId}` : undefined}
                layout
                style={{
                  maxWidth: "80%",
                  background: msg.role === "user" ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.04)",
                  border: msg.role === "user" ? "1px solid rgba(167,139,250,0.28)" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: msg.role === "user" ? "10px 4px 10px 10px" : "4px 10px 10px 10px",
                  padding: bpad,
                  fontFamily: MONO, fontSize: fs,
                  color: msg.role === "user" ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.72)",
                  lineHeight: 1.75, letterSpacing: "0.02em", whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </motion.div>

              {msg.role === "user" && <UserAvatar compact={compact} />}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "flex-end", gap: compact ? 5 : 7, overflow: "hidden" }}
            >
              <AgentAvatar compact={compact} />
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "4px 10px 10px 10px",
                padding: "10px 14px",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.65, delay: i * 0.14, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT, opacity: 0.5 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Option pills ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!closed && remaining.length > 0 && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{   opacity: 0, y: 8  }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              padding: compact ? "6px 10px 10px" : "8px 14px 14px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex", flexWrap: "wrap", gap: compact ? 5 : 6,
              flexShrink: 0,
            }}
          >
            <AnimatePresence mode="popLayout">
              {remaining.map((opt, i) => (
                <motion.button
                  key={opt.id}
                  layoutId={`pill-${opt.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1    }}
                  exit={{   opacity: 0, scale: 0.82  }}
                  transition={{ ...PILL_SPRING, delay: i * 0.055 }}
                  whileHover={!isTyping ? { scale: 1.06 } : {}}
                  whileTap={!isTyping   ? { scale: 0.93 } : {}}
                  onClick={() => handleOption(opt.id, opt.question, opt.answer)}
                  style={{
                    fontFamily: MONO, fontSize: compact ? 9 : 10,
                    letterSpacing: "0.04em", color: "rgba(167,139,250,0.9)",
                    background: "rgba(167,139,250,0.07)",
                    border: "1px solid rgba(167,139,250,0.25)",
                    borderRadius: 20,
                    padding: compact ? "4px 10px" : "5px 12px",
                    cursor: isTyping ? "default" : "pointer",
                    outline: "none",
                    opacity: isTyping ? 0.35 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {opt.question}
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
