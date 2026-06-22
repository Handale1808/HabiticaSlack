interface CustomStatBarsProps {
  wonder: number;
  maxWonder: number;
  magic: number;
  maxMagic: number;
  showLabel?: boolean;
}

const BAR_DISPLAY_W = 145;
const BAR_DISPLAY_H = 10;

function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

function StatBar({
  label,
  value,
  max,
  fillClass,
  showLabel = true,
}: {
  label: string;
  value: number;
  max: number;
  fillClass: string;
  showLabel?: boolean;
}) {
  const percent = clampPercent(value, max);

  return (
    <div className="flex items-center gap-1.5">
      {showLabel && (
        <span className="text-[10px] lowercase tracking-wide text-bark/60 w-6">
          {label}
        </span>
      )}
      <div
        className="relative overflow-hidden shrink-0 bg-bark/30"
        style={{ width: BAR_DISPLAY_W, height: BAR_DISPLAY_H }}
      >
        <div
          className={`absolute inset-y-0 left-0 ${fillClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] lowercase text-bark/50 tabular-nums">
          {Math.round(value)}/{Math.round(max)}
        </span>
      )}
    </div>
  );
}

export function CustomStatBars({
  wonder,
  maxWonder,
  magic,
  maxMagic,
  showLabel = true,
}: CustomStatBarsProps) {
  return (
    <div className="flex flex-col gap-1 text-bark">
      <StatBar
        label="wnd"
        value={wonder}
        max={maxWonder}
        fillClass="bg-honey"
        showLabel={showLabel}
      />
      <StatBar
        label="mgc"
        value={magic}
        max={maxMagic}
        fillClass="bg-berry"
        showLabel={showLabel}
      />
    </div>
  );
}
