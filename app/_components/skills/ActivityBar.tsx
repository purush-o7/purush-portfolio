// VS Code-style activity bar — decorative left icon strip

const ICONS = [
  {
    title: "Explorer",
    active: true,
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h7l4 4v12H4V4z"/>
        <path d="M11 4v4h4"/>
      </svg>
    ),
  },
  {
    title: "Search",
    active: false,
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="10.5" cy="10.5" r="6.5"/>
        <path d="M15.5 15.5L21 21"/>
      </svg>
    ),
  },
  {
    title: "Source Control",
    active: false,
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="7"  cy="5"  r="2" fill="currentColor" stroke="none"/>
        <circle cx="7"  cy="19" r="2" fill="currentColor" stroke="none"/>
        <circle cx="17" cy="8"  r="2" fill="currentColor" stroke="none"/>
        <path d="M7 7v10"/>
        <path d="M7 7c0 0 10-1 10 1s-10 6-10 6"/>
      </svg>
    ),
  },
  {
    title: "Extensions",
    active: false,
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3"  y="3"  width="7" height="7" rx="1"/>
        <rect x="14" y="3"  width="7" height="7" rx="1"/>
        <rect x="3"  y="14" width="7" height="7" rx="1"/>
        <path d="M14 17.5h3.5V14M14 14h3.5v3.5"/>
      </svg>
    ),
  },
]

export function ActivityBar() {
  return (
    <div style={{
      width: 44, flexShrink: 0,
      background: "#03030c",
      borderRight: "1px solid rgba(255,255,255,0.04)",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      paddingTop: 6,
      gap: 2,
    }}>
      {ICONS.map(icon => (
        <div
          key={icon.title}
          title={icon.title}
          style={{
            width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: icon.active ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.28)",
            borderLeft: icon.active ? "2px solid #00FFFF" : "2px solid transparent",
            cursor: "default",
            position: "relative",
          }}
        >
          {icon.svg}
        </div>
      ))}
    </div>
  )
}
