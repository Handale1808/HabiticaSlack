import type { CSSProperties, ReactNode } from "react";
import {
  getSprite,
  spriteSheets,
  type SpriteSheetKey,
} from "@/lib/sprites/registry";
import { getSliceInsets } from "@/lib/sprites/sliceInsets";
import { getSpriteBackgroundStyle } from "@/lib/sprites/getSpriteBackgroundStyle";

interface SpriteNineSliceProps {
  sheetKey: SpriteSheetKey;
  spriteId: number;
  className?: string;
  children?: ReactNode;
}

export function SpriteNineSlice({
  sheetKey,
  spriteId,
  className = "",
  children,
}: SpriteNineSliceProps) {
  const sheet = spriteSheets[sheetKey];
  const sprite = getSprite(sheetKey, spriteId);
  const insets = getSliceInsets(sheetKey, spriteId);

  const { x, y, width, height } = sprite;
  const { top, right, bottom, left } = insets;

  const centerWidth = width - left - right;
  const centerHeight = height - top - bottom;

  if (centerWidth <= 0 || centerHeight <= 0) {
    throw new Error(
      `SpriteNineSlice: insets ${JSON.stringify(insets)} leave no room for a center on sprite id ${spriteId} (sheet "${sheetKey}", size ${width}x${height}).`,
    );
  }

  const cellStyle = (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): CSSProperties => getSpriteBackgroundStyle(sheet, rect);

  const cells = [
    { x, y, width: left, height: top }, // top-left
    { x: x + left, y, width: centerWidth, height: top }, // top-center
    { x: x + width - right, y, width: right, height: top }, // top-right
    { x, y: y + top, width: left, height: centerHeight }, // middle-left
    { x: x + left, y: y + top, width: centerWidth, height: centerHeight }, // middle-center
    { x: x + width - right, y: y + top, width: right, height: centerHeight }, // middle-right
    { x, y: y + height - bottom, width: left, height: bottom }, // bottom-left
    { x: x + left, y: y + height - bottom, width: centerWidth, height: bottom }, // bottom-center
    {
      x: x + width - right,
      y: y + height - bottom,
      width: right,
      height: bottom,
    }, // bottom-right
  ];

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `${left}px 1fr ${right}px`,
        gridTemplateRows: `${top}px 1fr ${bottom}px`,
        gap: 0,
      }}
    >
      {cells.map((rect, index) => {
        const isCenter = index === 4;
        return (
          <div key={index} className="w-full h-full" style={cellStyle(rect)}>
            {isCenter ? children : null}
          </div>
        );
      })}
    </div>
  );
}
