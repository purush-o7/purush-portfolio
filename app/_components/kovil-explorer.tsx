"use client"

import dynamic        from "next/dynamic"
import { useRouter }  from "next/navigation"

// ssr:false is only allowed in Client Components (Next docs: lazy-loading) — this is one.
const TempleViewer = dynamic(
  () => import("./temple-viewer").then(m => m.TempleViewer),
  {
    ssr: false,
    loading: () => (
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase" }}>
        Loading temple…
      </div>
    ),
  },
)

/** Full-space 3D page. Back returns to the KovilLens section of the home page. */
export function KovilExplorer() {
  const router = useRouter()

  function goBack() {
    // Arrived from the home page (it leaves a restore note) → pop that history entry so
    // the browser stack stays clean. Opened directly → just go home.
    let fromHome = false
    try { fromHome = sessionStorage.getItem("snap:restore") !== null } catch { /* ignore */ }
    if (fromHome && window.history.length > 1) router.back()
    else router.push("/")
  }

  return (
    <main style={{ position: "fixed", inset: 0, background: "#07070f", overflow: "hidden" }}>
      <TempleViewer standalone />

      <header style={{
        position: "absolute", left: 0, right: 0, top: 0, zIndex: 60, pointerEvents: "none",
        padding: "max(14px, env(safe-area-inset-top, 14px)) 14px 0", display: "flex", alignItems: "center", gap: 14,
      }}>
        <button
          onClick={goBack}
          aria-label="Back to the portfolio"
          style={{
            pointerEvents: "auto", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 16px",
            fontFamily: "var(--font-geist-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)", background: "rgba(7,7,15,0.82)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6, backdropFilter: "blur(8px)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7.5 2 3.5 6l4 4" />
          </svg>
          Back
        </button>
        <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 12px #000" }}>
          KovilLens <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>· 3D explorer</span>
        </h1>
      </header>
    </main>
  )
}
