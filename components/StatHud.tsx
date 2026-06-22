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
  avatarUrl?: string | null;
}

const SPRITE_58 = { x: 1, y: 35, width: 77, height: 25 };
const DISPLAY_SCALE = 3;
const PANEL_H = SPRITE_58.height * DISPLAY_SCALE;

export function StatHud({
  acorns,
  wonder,
  maxWonder,
  magic,
  maxMagic,
  avatarUrl,
}: StatHudProps) {
  const panelStyle = getSpriteBackgroundStyle(spriteSheets.medival, SPRITE_58);

  return (
    <div
      className="relative flex items-center"
      style={{
        width: SPRITE_58.width * DISPLAY_SCALE,
        height: PANEL_H,
        ...panelStyle,
      }}
    >
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="avatar"
          className="shrink-0 object-cover ml-1.5 mb-2"
          style={{ width: PANEL_H * 0.9, height: PANEL_H * 0.9 }}
        />
      )}
      <div className="flex flex-col justify-center gap-4 px-2 flex-1">
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
