import type { CSSProperties } from "react";

export interface SpriteSheetDimensions {
  src: string;
  width: number;
  height: number;
}

export interface SpriteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getSpriteBackgroundStyle(
  sheet: SpriteSheetDimensions,
  sprite: SpriteRect,
): CSSProperties {
  const { src, width: sheetW, height: sheetH } = sheet;
  const { x, y, width, height } = sprite;

  if (width <= 0 || height <= 0 || width > sheetW || height > sheetH) {
    throw new Error(
      `getSpriteBackgroundStyle: sprite rect ${JSON.stringify(sprite)} is invalid for a ${sheetW}x${sheetH} sheet.`,
    );
  }

  const sizeX = (sheetW / width) * 100;
  const sizeY = (sheetH / height) * 100;

  const posX = sheetW === width ? 0 : (x / (sheetW - width)) * 100;
  const posY = sheetH === height ? 0 : (y / (sheetH - height)) * 100;

  return {
    backgroundImage: `url(${src})`,
    backgroundSize: `${sizeX}% ${sizeY}%`,
    backgroundPosition: `${posX}% ${posY}%`,
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
  };
}