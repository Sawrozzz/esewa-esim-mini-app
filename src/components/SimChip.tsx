type Props = {
  className?: string
  stroke?: string
  strokeWidth?: number
}

/**
 * The contact pad of a SIM card, drawn as line art. This is the motif the whole
 * mini app hangs on: it marks the hero, every package row, and the eSIM artwork
 * on the review screen.
 */
const SimChip = ({ className, stroke = 'currentColor', strokeWidth = 1.5 }: Props) => (
  <svg
    viewBox="0 0 44 36"
    fill="none"
    aria-hidden="true"
    className={className}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
  >
    <rect x="0.75" y="0.75" width="42.5" height="34.5" rx="5.5" />
    <path d="M15 0.75V11H0.75M15 35.25V25H0.75M29 0.75V11H43.25M29 35.25V25H43.25M15 11h14M15 25h14M22 11v14" />
  </svg>
)

export default SimChip
