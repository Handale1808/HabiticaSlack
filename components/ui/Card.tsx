import { ReactNode } from "react";
import { getSprite, spriteSheets } from "@/lib/sprites/registry";
import { getSpriteBackgroundStyle } from "@/lib/sprites/getSpriteBackgroundStyle";

const cardSprite = getSprite("medival", 3);
const cardBackgroundStyle = getSpriteBackgroundStyle(
  spriteSheets.medival,
  cardSprite,
);

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`p-6 ${className}`} style={cardBackgroundStyle}>
      {children}
    </div>
  );
}