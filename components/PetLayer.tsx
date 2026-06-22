"use client";

import { useUser } from "@/context/UserContext";
import { WanderingPet } from "@/components/WanderingPet";
import { petSpriteSheets, type PetSpriteSheetKey } from "@/lib/sprites/petRegistry";

export function PetLayer() {
  const { purchases } = useUser();

  if (purchases.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 64,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {purchases.map((purchase) => {
        if (!purchase.sprite_key || !(purchase.sprite_key in petSpriteSheets)) return null;
        return (
          <WanderingPet
            key={purchase.id}
            id={purchase.id}
            spriteKey={purchase.sprite_key as PetSpriteSheetKey}
          />
        );
      })}
    </div>
  );
}
