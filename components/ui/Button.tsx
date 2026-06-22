import { ReactNode } from "react";
import { SpriteNineSlice } from "@/components/ui/SpriteNineSlice";

type ButtonVariant = "primary" | "secondary" | "ghost" | "shiny";

interface ButtonProps {
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "text-moss-light hover:text-parchment transition-colors duration-150",
  secondary: "text-moss-light hover:text-parchment transition-colors duration-150",
  ghost:
    "bg-transparent text-bark border-2 border-transparent hover:text-moss-dark hover:underline underline-offset-4",
  shiny: "text-parchment",
};

const spriteVariants: Partial<Record<ButtonVariant, number>> = {
  primary: 24,
  secondary: 24,
  shiny: 25,
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled = false,
  onClick,
  type = "button",
  children,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const spriteId = spriteVariants[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-wide disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${className}`}
    >
      {spriteId !== undefined && (
        <SpriteNineSlice
          sheetKey="forest"
          spriteId={spriteId}
          className="absolute inset-0 w-full h-full transition-[filter] duration-150 group-hover:brightness-125"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">
        {isLoading && (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin lowercase rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </span>
    </button>
  );
}
