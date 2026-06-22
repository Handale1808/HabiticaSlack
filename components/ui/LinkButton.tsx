import { ReactNode } from "react";
import Link from "next/link";
import { getSprite, spriteSheets } from "@/lib/sprites/registry";
import { getSpriteBackgroundStyle } from "@/lib/sprites/getSpriteBackgroundStyle";

type LinkButtonVariant = "shiny";

interface LinkButtonProps {
  href: string;
  variant?: LinkButtonVariant;
  scale?: number;
  children: ReactNode;
  className?: string;
}

const SPRITE_ID = 52;
const sprite = getSprite("forest", SPRITE_ID);
const spriteStyle = getSpriteBackgroundStyle(spriteSheets.forest, sprite);

export function LinkButton({
  href,
  scale = 1.5,
  children,
  className = "",
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`relative inline-flex items-center justify-center text-sm font-semibold tracking-wide text-parchment transition-all duration-150 ${className}`}
      style={{ width: sprite.width * scale, height: sprite.height * scale }}
    >
      <div
        className="absolute inset-0 transition-[filter] duration-150 hover:brightness-125"
        style={spriteStyle}
      />
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
