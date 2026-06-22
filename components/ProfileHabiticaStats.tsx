import type { HabiticaClass } from "@/hooks/useHabiticaStats";
import { HabiticaClassIcon } from "@/components/HabiticaClassIcon";
import { HabiticaStatBars } from "@/components/HabiticaStatBars";
import { Card } from "@/components/ui/Card";

interface ProfileHabiticaStatsProps {
  characterClass: HabiticaClass;
  lvl: number;
  hp: number;
  maxHealth: number;
  mp: number;
  maxMP: number;
  exp: number;
  toNextLevel: number;
}

export function ProfileHabiticaStats({
  characterClass,
  lvl,
  hp,
  maxHealth,
  mp,
  maxMP,
  exp,
  toNextLevel,
}: ProfileHabiticaStatsProps) {
  return (
    <Card className="w-full max-w-sm flex flex-col gap-3">
      <span className="text-xs uppercase tracking-widest text-bark/50">habitica</span>
      <div className="flex items-center gap-3 text-parchment">
        <HabiticaClassIcon characterClass={characterClass} className="w-6 h-6" />
        <HabiticaStatBars
          lvl={lvl}
          hp={hp}
          maxHealth={maxHealth}
          mp={mp}
          maxMP={maxMP}
          exp={exp}
          toNextLevel={toNextLevel}
        />
      </div>
    </Card>
  );
}
