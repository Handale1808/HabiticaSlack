"use client";

import { useUser } from "@/context/UserContext";
import { WanderingPet } from "@/components/WanderingPet";

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
      {purchases.map((purchase) => (
        <WanderingPet
          key={purchase.id}
          id={purchase.id}
          imageUrl={purchase.image_url}
        />
      ))}
    </div>
  );
}
