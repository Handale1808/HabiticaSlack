import { MysteryCard } from "@/components/MysteryCard";
import { Button } from "@/components/ui/Button";
import type { MaskedStoreItem } from "@/types/store";

interface StoreItemCardProps {
  item: MaskedStoreItem;
  index: number;
  isOwned: boolean;
  canAfford: boolean;
  isPurchasing: boolean;
  onBuy: (itemId: string) => void;
}

export function StoreItemCard({
  item,
  index,
  isOwned,
  canAfford,
  isPurchasing,
  onBuy,
}: StoreItemCardProps) {
  if (item.name === null) {
    return <MysteryCard index={index} />;
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-bark/30 bg-parchment/60 p-5 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <img
          src={item.image_url ?? "/pets/placeholder.svg"}
          alt={item.name}
          width={48}
          height={48}
          style={{ imageRendering: "pixelated" }}
        />
        {isOwned && (
          <span className="absolute -right-1 -top-1 rounded-full bg-moss px-1.5 py-0.5 text-[10px] font-semibold text-parchment">
            owned
          </span>
        )}
      </div>
      <p className="font-display text-lg text-bark">{item.name}</p>
      <p className="text-xs text-bark/70">{item.description}</p>
      <p className="text-sm font-semibold text-bark">{item.cost} acorns</p>
      <Button
        variant="primary"
        disabled={!canAfford || isPurchasing}
        isLoading={isPurchasing}
        onClick={() => onBuy(item.id)}
      >
        {canAfford ? "buy" : "not enough acorns"}
      </Button>
    </div>
  );
}
