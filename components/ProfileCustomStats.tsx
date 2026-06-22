import { Card } from "@/components/ui/Card";
import { AcornCount } from "@/components/AcornCount";
import { CustomStatBars } from "@/components/CustomStatBars";

interface ProfileCustomStatsProps {
  level: number;
  acorns: number;
  wonder: number;
  maxWonder: number;
  magic: number;
  maxMagic: number;
}

export function ProfileCustomStats({
  level,
  acorns,
  wonder,
  maxWonder,
  magic,
  maxMagic,
}: ProfileCustomStatsProps) {
  return (
    <Card className="w-full max-w-sm flex flex-col gap-3">
      <span className="text-xs uppercase tracking-widest text-bark/50">your stats</span>
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-parchment">lv {level}</span>
        <AcornCount acorns={acorns} />
      </div>
      <CustomStatBars
        wonder={wonder}
        maxWonder={maxWonder}
        magic={magic}
        maxMagic={maxMagic}
      />
    </Card>
  );
}
