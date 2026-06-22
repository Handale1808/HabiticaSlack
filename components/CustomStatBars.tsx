import { getSpriteBackgroundStyle } from "@/lib/sprites/getSpriteBackgroundStyle";
import { spriteSheets } from "@/lib/sprites/registry";

interface CustomStatBarsProps {
  wonder: number;
  maxWonder: number;
  magic: number;
  maxMagic: number;
}

const SPRITE_58 = { x: 1, y: 35, width: 77, height: 25 };
const BAR_DISPLAY_W = 64;
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
}: {
  label: string;
  value: number;
  max: number;
  fillClass: string;
}) {
  const percent = clampPercent(value, max);
  const barStyle = getSpriteBackgroundStyle(spriteSheets.medival, SPRITE_58);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] lowercase tracking-wide text-parchment/60 w-6">
        {label}
      </span>
      <div
        className="relative overflow-hidden shrink-0"
        style={{ width: BAR_DISPLAY_W, height: BAR_DISPLAY_H, ...barStyle }}
      >
        <div
          className={`absolute inset-y-0 left-0 ${fillClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[10px] lowercase text-parchment/50 tabular-nums">
        {Math.round(value)}/{Math.round(max)}
      </span>
    </div>
  );
}

export function CustomStatBars({
  wonder,
  maxWonder,
  magic,
  maxMagic,
}: CustomStatBarsProps) {
  return (
    <div className="flex flex-col gap-1">
      <StatBar label="wnd" value={wonder} max={maxWonder} fillClass="bg-honey/70" />
      <StatBar label="mgc" value={magic} max={maxMagic} fillClass="bg-berry/70" />
    </div>
  );
}
