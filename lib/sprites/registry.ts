import medivalManifest from "../../public/ui/medival.json";
import forestManifest from "../../public/ui/forest.json";

export interface SpriteManifestEntry {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteSheetEntry {
  src: string;
  width: number;
  height: number;
  sprites: SpriteManifestEntry[];
}

export const spriteSheets = {
  medival: {
    src: "/ui/medival.png",
    width: 1024,
    height: 1024,
    sprites: medivalManifest.sprites,
  },
  forest: {
    src: "/ui/forest.png",
    width: 1024,
    height: 512,
    sprites: forestManifest.sprites,
  },
} satisfies Record<string, SpriteSheetEntry>;

export type SpriteSheetKey = keyof typeof spriteSheets;

export function getSprite(
  sheetKey: SpriteSheetKey,
  spriteId: number,
): SpriteManifestEntry {
  const sheet = spriteSheets[sheetKey];
  const sprite = sheet.sprites.find((s) => s.id === spriteId);

  if (!sprite) {
    throw new Error(
      `getSprite: sprite id ${spriteId} not found on sheet "${sheetKey}".`,
    );
  }

  return sprite;
}