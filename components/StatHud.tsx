import { getSpriteBackgroundStyle } from "@/lib/sprites/getSpriteBackgroundStyle";
import { spriteSheets } from "@/lib/sprites/registry";
import { AcornCount } from "@/components/AcornCount";
import { CustomStatBars } from "@/components/CustomStatBars";

interface StatHudProps {
  acorns: number;
  wonder: number;
  maxWonder: number;
  magic: number;
  maxMagic: number;
}

const SPRITE_58 = { x: 1, y: 35, width: 77, height: 25 };
const DISPLAY_SCALE = 3;

export function StatHud({
  acorns,
  wonder,
  maxWonder,
  magic,
  maxMagic,
}: StatHudProps) {
  const panelStyle = getSpriteBackgroundStyle(spriteSheets.medival, SPRITE_58);

  return (
    <div
      className="relative"
      style={{
        width: SPRITE_58.width * DISPLAY_SCALE,
        height: SPRITE_58.height * DISPLAY_SCALE,
        ...panelStyle,
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-center gap-3 ml-20 ">
        <CustomStatBars
          wonder={wonder}
          maxWonder={maxWonder}
          magic={magic}
          maxMagic={maxMagic}
          showLabel={false}
        />
        <AcornCount acorns={acorns} />
      </div>
    </div>
  );
}
