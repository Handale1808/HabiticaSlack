import type { SpriteSheetKey } from "./registry";

export interface NineSliceInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const sliceInsets: Partial<
  Record<SpriteSheetKey, Record<number, NineSliceInsets>>
> = {
  medival: {
    37: { top: 8, right: 8, bottom: 8, left: 8 },
    20: { top: 10, right: 10, bottom: 10, left: 10 },
  },
};

export function getSliceInsets(
  sheetKey: SpriteSheetKey,
  spriteId: number,
): NineSliceInsets {
  const insets = sliceInsets[sheetKey]?.[spriteId];

  if (!insets) {
    return { top: 4, right: 4, bottom: 4, left: 4 };
  }

  return insets;
}
