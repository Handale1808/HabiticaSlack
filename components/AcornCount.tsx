interface AcornCountProps {
  acorns: number;
}

export function AcornCount({ acorns }: AcornCountProps) {
  return (
    <div className="flex items-center gap-1">
      <svg
        width="12"
        height="14"
        viewBox="0 0 12 14"
        fill="currentColor"
        className="text-parchment shrink-0"
        aria-hidden="true"
      >
        <ellipse cx="6" cy="9.5" rx="4.5" ry="4.5" />
        <rect x="3.5" y="3" width="5" height="3" rx="0.5" />
        <rect x="4" y="1" width="4" height="2.5" rx="1" />
        <line x1="6" y1="1" x2="6" y2="0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-xs text-parchment tabular-nums">{acorns}</span>
    </div>
  );
}
