// Anthropic / Claude brand mark — three ascending columns forming the "A" shape

interface Props {
  size?:  number
  color?: string
}

export function ClaudeIcon({ size = 16, color = "#D97706" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left bar */}
      <rect x="2"  y="10" width="4" height="10" rx="1.5" fill={color} opacity="0.75" />
      {/* Middle bar — tallest */}
      <rect x="10" y="4"  width="4" height="16" rx="1.5" fill={color} />
      {/* Right bar */}
      <rect x="18" y="7"  width="4" height="13" rx="1.5" fill={color} opacity="0.85" />
    </svg>
  )
}
