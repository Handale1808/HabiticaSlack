// components/HabiticaStatBars.tsx

interface HabiticaStatBarsProps {
  lvl: number
  hp: number
  maxHealth: number
  mp: number
  maxMP: number
  exp: number
  toNextLevel: number
}

interface StatBarProps {
  label: string
  value: number
  max: number
  colorClassName: string
}

function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

function StatBar({ label, value, max, colorClassName }: StatBarProps) {
  const percent = clampPercent(value, max)

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] lowercase tracking-wide text-parchment/60 w-6">
        {label}
      </span>
      <div className="w-16 h-1.5 rounded-full bg-parchment/15 overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClassName.toLowerCase()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[10px] lowercase text-parchment/50 tabular-nums">
        {Math.round(value)}/{Math.round(max)}
      </span>
    </div>
  )
}

export function HabiticaStatBars({
  lvl,
  hp,
  maxHealth,
  mp,
  maxMP,
  exp,
  toNextLevel,
}: HabiticaStatBarsProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-parchment">lv {lvl}</span>
      <div className="flex flex-col gap-1">
        <StatBar label="hp" value={hp} max={maxHealth} colorClassName="bg-moss" />
        <StatBar label="mp" value={mp} max={maxMP} colorClassName="bg-honey" />
        <StatBar label="xp" value={exp} max={toNextLevel} colorClassName="bg-berry" />
      </div>
    </div>
  )
}