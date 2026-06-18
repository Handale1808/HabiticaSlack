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
      <span className="text-[10px] uppercase tracking-wide text-gray-500 w-6">
        {label}
      </span>
      <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClassName}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-400 tabular-nums">
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
      <span className="text-xs font-semibold text-gray-300">Lv {lvl}</span>
      <div className="flex flex-col gap-1">
        <StatBar label="HP" value={hp} max={maxHealth} colorClassName="bg-red-500" />
        <StatBar label="MP" value={mp} max={maxMP} colorClassName="bg-blue-500" />
        <StatBar label="XP" value={exp} max={toNextLevel} colorClassName="bg-yellow-500" />
      </div>
    </div>
  )
}