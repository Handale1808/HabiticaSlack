import catRunBlackManifest from "../../public/pets/cat_run_black.json";
import catRunBatmanManifest from "../../public/pets/cat_run_batman.json";
import chickenWalkingWhiteManifest from "../../public/pets/chicken_walking_white.json";
import type { SpriteManifestEntry, SpriteSheetEntry } from "./registry";

export const petSpriteSheets = {
  cat_run_black: {
    src: "/pets/cat_run_black.png",
    width: catRunBlackManifest.image_width,
    height: catRunBlackManifest.image_height,
    sprites: catRunBlackManifest.sprites,
  },
  cat_run_batman: {
    src: "/pets/cat_run_batman.png",
    width: catRunBatmanManifest.image_width,
    height: catRunBatmanManifest.image_height,
    sprites: catRunBatmanManifest.sprites,
  },
  chicken_walking_white: {
    src: "/pets/chicken_walking_white.png",
    width: chickenWalkingWhiteManifest.image_width,
    height: chickenWalkingWhiteManifest.image_height,
    sprites: chickenWalkingWhiteManifest.sprites,
  },
} satisfies Record<string, SpriteSheetEntry>;

export type PetSpriteSheetKey = keyof typeof petSpriteSheets;

export function getPetFrames(key: PetSpriteSheetKey): SpriteManifestEntry[] {
  const sheet = petSpriteSheets[key];
  return [...sheet.sprites].sort((a, b) => a.x - b.x || a.y - b.y);
}
