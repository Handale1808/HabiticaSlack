import { ReactNode } from "react";
import { SpriteNineSlice } from "@/components/ui/SpriteNineSlice";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <SpriteNineSlice sheetKey="medival" spriteId={37} className={className}>
      <div className="p-6">{children}</div>
    </SpriteNineSlice>
  );
}
