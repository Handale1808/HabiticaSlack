import { ReactNode } from "react";

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
  primary:
    "bg-linear-to-b from-bark-light to-bark text-parchment border-2 border-parchment-dark/40 shadow-md hover:brightness-110 hover:shadow-lg active:translate-y-px",
  secondary:
    "bg-parchment text-bark border-2 border-bark/30 shadow-sm hover:bg-parchment-dark hover:border-bark/50",
  ghost:
    "bg-transparent text-bark border-2 border-transparent hover:text-moss-dark hover:underline underline-offset-4",
  shiny:
    "text-parchment border-2 border-moss-dark/50 bg-[image:linear-gradient(to_bottom,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_45%,rgba(0,0,0,0.05)_100%),linear-gradient(to_bottom,var(--color-moss),var(--color-moss-dark))] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_3px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.2)] hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_3px_rgba(0,0,0,0.18),0_2px_4px_rgba(0,0,0,0.25)] active:translate-y-px active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]",
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

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${className}`}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin lowercase rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span>{children}</span>
    </button>
  );
}
