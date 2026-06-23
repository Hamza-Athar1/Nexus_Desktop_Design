/**
 * NexusLogo — shared brand mark used across all pages.
 * Renders a hexagonal wireframe icon.
 *
 * Props:
 *   size    — pixel size of the SVG (default 38)
 *   variant — 'light' (white strokes, for dark bg) | 'dark' (green strokes, for light bg)
 */
export default function NexusLogo({ size = 38, variant = 'light' }) {
  const stroke = variant === 'dark' ? '#1e5c1e' : '#ffffff';
  const fill   = variant === 'dark' ? 'rgba(30,92,30,0.12)' : 'rgba(255,255,255,0.18)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Trust Nexus logo"
      role="img"
    >
      <rect width="40" height="40" rx="8" fill={fill} />
      <path
        d="M20 6L32 13V27L20 34L8 27V13L20 6Z"
        stroke={stroke}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M20 6L20 34M8 13L32 27M32 13L8 27"
        stroke={stroke}
        strokeWidth="1.4"
        strokeOpacity="0.55"
      />
    </svg>
  );
}
