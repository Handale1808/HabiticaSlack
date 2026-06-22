"use client";

import { useEffect, useState } from "react";
import { getPetFrames, petSpriteSheets, type PetSpriteSheetKey } from "@/lib/sprites/petRegistry";
import { getSpriteBackgroundStyle } from "@/lib/sprites/getSpriteBackgroundStyle";
import { seededRandom } from "@/lib/seededRandom";

const FRAME_INTERVAL_MIN = 80;
const FRAME_INTERVAL_MAX = 200;

interface AnimatedPetProps {
  spriteKey: PetSpriteSheetKey;
  seed: string;
  displayScale?: number;
  flipped?: boolean;
  frameIndex?: number;
}

export function AnimatedPet({
  spriteKey,
  seed,
  displayScale = 3,
  flipped = false,
  frameIndex,
}: AnimatedPetProps) {
  const frames = getPetFrames(spriteKey);

  if (frames.length === 0) return null;

  const rand = seededRandom(seed);
  const interval = Math.round(FRAME_INTERVAL_MIN + rand() * (FRAME_INTERVAL_MAX - FRAME_INTERVAL_MIN));

  const maxW = Math.max(...frames.map((f) => f.width));
  const maxH = Math.max(...frames.map((f) => f.height));
  const displayW = maxW * displayScale;
  const displayH = maxH * displayScale;

  const isStatic = frameIndex !== undefined;

  return (
    <AnimatedPetInner
      spriteKey={spriteKey}
      frames={frames}
      interval={interval}
      displayW={displayW}
      displayH={displayH}
      flipped={flipped}
      staticFrameIndex={isStatic ? frameIndex : undefined}
    />
  );
}

interface InnerProps {
  spriteKey: PetSpriteSheetKey;
  frames: ReturnType<typeof getPetFrames>;
  interval: number;
  displayW: number;
  displayH: number;
  flipped: boolean;
  staticFrameIndex: number | undefined;
}

function AnimatedPetInner({
  spriteKey,
  frames,
  interval,
  displayW,
  displayH,
  flipped,
  staticFrameIndex,
}: InnerProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  useEffect(() => {
    if (staticFrameIndex !== undefined) return;

    const id = setInterval(() => {
      setCurrentFrameIndex((i) => (i + 1) % frames.length);
    }, interval);

    return () => clearInterval(id);
  }, [frames.length, interval, staticFrameIndex]);

  const frameIdx = staticFrameIndex ?? currentFrameIndex;
  const frame = frames[frameIdx];
  const sheet = petSpriteSheets[spriteKey];

  const bgStyle = getSpriteBackgroundStyle(sheet, frame);

  return (
    <div
      style={{
        width: displayW,
        height: displayH,
        transform: flipped ? "scaleX(-1)" : undefined,
        imageRendering: "pixelated",
        flexShrink: 0,
        ...bgStyle,
      }}
    />
  );
}
