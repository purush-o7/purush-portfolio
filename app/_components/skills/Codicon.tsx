"use client"

import "@vscode/codicons/dist/codicon.css"

/** A real VS Code icon (the codicons set, MIT) — see https://microsoft.github.io/vscode-codicons/dist/codicon.html */
export function Codicon({ name, size = 16, color, style }: { name: string; size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <i
      aria-hidden
      className={`codicon codicon-${name}`}
      style={{ fontSize: size, lineHeight: 1, color, display: "inline-flex", alignItems: "center", justifyContent: "center", ...style }}
    />
  )
}

/** Small file-type glyphs for editor tabs (Python / JSON), in the spirit of VS Code's file icon themes. */
export function FileIcon({ kind, size = 14 }: { kind: "py" | "json"; size?: number }) {
  if (kind === "json") {
    return (
      <span aria-hidden style={{ fontFamily: "var(--font-geist-mono)", fontSize: size - 1, fontWeight: 700, color: "#FBBF24", lineHeight: 1, letterSpacing: "-0.08em" }}>
        {"{}"}
      </span>
    )
  }
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M7.9 1C5 1 5.2 2.3 5.2 2.3V3.7h2.8v.4H4.1S2 3.9 2 7s1.8 3 1.8 3h1.1V8.6s-.1-1.8 1.8-1.8h2.8s1.7 0 1.7-1.7V2.7S11.5 1 7.9 1Zm-1.5.9a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1Z" fill="#3B82F6" />
      <path d="M8.1 15c2.900 0 2.700-1.300 2.700-1.300v-1.400H8v-.4h3.900S14 12.100 14 9s-1.800-3-1.800-3h-1.100v1.400s.1 1.800-1.800 1.800H6.500s-1.700 0-1.700 1.700v2.400S4.500 15 8.100 15Zm1.500-.9a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z" fill="#FBBF24" />
    </svg>
  )
}
