export function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      stroke="var(--contract)"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Euclides"
    >
      <g strokeWidth="3.4" strokeDasharray="6 5" opacity="0.62">
        <circle cx="36" cy="50" r="26" />
        <circle cx="64" cy="50" r="26" />
      </g>
      <path d="M36 50 L64 50 L50 28.09 Z" strokeWidth="5" />
      <circle cx="36" cy="50" r="3" fill="var(--contract)" stroke="none" />
      <circle cx="64" cy="50" r="3" fill="var(--contract)" stroke="none" />
    </svg>
  )
}
