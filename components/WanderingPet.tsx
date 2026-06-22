"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedPet } from "@/components/AnimatedPet";
import { seededRandom } from "@/lib/seededRandom";
import type { PetSpriteSheetKey } from "@/lib/sprites/petRegistry";
import { petSpriteSheets, getPetFrames } from "@/lib/sprites/petRegistry";

const SPEED_MIN = 0.4;
const SPEED_MAX = 0.9;
const DISPLAY_SCALE = 3;

interface WanderingPetProps {
  spriteKey: PetSpriteSheetKey;
  id: string;
}

export function WanderingPet({ spriteKey, id }: WanderingPetProps) {
  const rand = seededRandom(id);
  const frames = getPetFrames(spriteKey);
  const maxW = frames.length > 0 ? Math.max(...frames.map((f) => f.width)) * DISPLAY_SCALE : 48;

  const initialX = rand() * Math.max(0, (typeof window !== "undefined" ? window.innerWidth : 800) - maxW);
  const initialDir = rand() > 0.5 ? 1 : -1;
  const speed = SPEED_MIN + rand() * (SPEED_MAX - SPEED_MIN);

  const [x, setX] = useState(initialX);
  const dirRef = useRef(initialDir);
  const xRef = useRef(initialX);
  const boundaryRef = useRef((typeof window !== "undefined" ? window.innerWidth : 800) - maxW);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateBoundary = () => {
      boundaryRef.current = window.innerWidth - maxW;
    };
    window.addEventListener("resize", updateBoundary);
    updateBoundary();

    const step = () => {
      xRef.current += dirRef.current * speed;
      if (xRef.current >= boundaryRef.current) {
        xRef.current = boundaryRef.current;
        dirRef.current = -1;
      } else if (xRef.current <= 0) {
        xRef.current = 0;
        dirRef.current = 1;
      }
      setX(xRef.current);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", updateBoundary);
    };
  }, [speed, maxW]);

  if (!(spriteKey in petSpriteSheets)) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 8,
        left: x,
        pointerEvents: "none",
      }}
    >
      <AnimatedPet
        spriteKey={spriteKey}
        seed={id}
        displayScale={DISPLAY_SCALE}
        flipped={dirRef.current === -1}
      />
    </div>
  );
}
