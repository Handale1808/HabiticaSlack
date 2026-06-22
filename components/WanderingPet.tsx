"use client";

import { useEffect, useRef, useState } from "react";

interface WanderingPetProps {
  imageUrl: string;
  id: string;
}

const PET_SIZE = 48;
const SPEED_MIN = 0.4;
const SPEED_MAX = 0.9;

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (Math.imul(16807, h)) | 0;
    return ((h >>> 0) / 0xffffffff);
  };
}

export function WanderingPet({ imageUrl, id }: WanderingPetProps) {
  const rand = seededRandom(id);
  const initialX = rand() * Math.max(0, (typeof window !== "undefined" ? window.innerWidth : 800) - PET_SIZE);
  const initialDir = rand() > 0.5 ? 1 : -1;
  const speed = SPEED_MIN + rand() * (SPEED_MAX - SPEED_MIN);

  const [x, setX] = useState(initialX);
  const dirRef = useRef(initialDir);
  const xRef = useRef(initialX);
  const boundaryRef = useRef((typeof window !== "undefined" ? window.innerWidth : 800) - PET_SIZE);
  const rafRef = useRef<number | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const updateBoundary = () => {
      boundaryRef.current = window.innerWidth - PET_SIZE;
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
  }, [speed]);

  if (hidden) return null;

  return (
    <img
      src={imageUrl}
      alt=""
      aria-hidden="true"
      width={PET_SIZE}
      height={PET_SIZE}
      onError={() => setHidden(true)}
      style={{
        position: "absolute",
        bottom: 8,
        left: x,
        width: PET_SIZE,
        height: PET_SIZE,
        transform: `scaleX(${dirRef.current})`,
        imageRendering: "pixelated",
        pointerEvents: "none",
      }}
    />
  );
}
