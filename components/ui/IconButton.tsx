import { CSSProperties, ReactNode } from "react";
import { getSpriteBackgroundStyle } from "@/lib/sprites/getSpriteBackgroundStyle";
import { getSprite, spriteSheets } from "@/lib/sprites/registry";

interface IconButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

const spriteStyle: CSSProperties = getSpriteBackgroundStyle(
  spriteSheets["forest"],
  getSprite("forest", 100),
);

export function IconButton({
  onClick,
  disabled = false,
  type = "button",
  children,
  className = "",
  "aria-label": ariaLabel,
}: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={spriteStyle}
      className={`relative inline-flex items-center justify-center w-7 h-7 text-bark/70 transition-[filter,color] duration-150 hover:brightness-125 hover:text-bark disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
