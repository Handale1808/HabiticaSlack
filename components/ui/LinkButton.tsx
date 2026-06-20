import { ReactNode } from "react";
import Link from "next/link";

type LinkButtonVariant = "shiny";

interface LinkButtonProps {
  href: string;
  variant?: LinkButtonVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<LinkButtonVariant, string> = {
  shiny:
    "text-parchment border-2 border-moss-dark/50 bg-[image:linear-gradient(to_bottom,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_45%,rgba(0,0,0,0.05)_100%),linear-gradient(to_bottom,var(--color-moss),var(--color-moss-dark))] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_3px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.2)] hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_3px_rgba(0,0,0,0.18),0_2px_4px_rgba(0,0,0,0.25)] active:translate-y-px active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]",
};

export function LinkButton({
  href,
  variant = "shiny",
  children,
  className = "",
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold tracking-wide transition-all duration-150 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
