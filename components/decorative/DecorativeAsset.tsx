import Image from "next/image";
import { assetMap } from "./assetMap";

interface DecorativeAssetProps {
  slot: string;
  aspectRatio?: string;
  className?: string;
}

export function DecorativeAsset({
  slot,
  aspectRatio = "1 / 1",
  className = "",
}: DecorativeAssetProps) {
  const entry = assetMap[slot];

  return (
    <div
      aria-hidden="true"
      style={{ position: "relative", aspectRatio }}
      className={`overflow-hidden rounded-xl ${className}`}
    >
      {entry ? (
        <Image
          src={entry.src}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          style={{ objectFit: "contain" }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-bark/30 bg-parchment-dark/40 px-2 text-center text-xs text-bark/50">
          {slot}
        </div>
      )}
    </div>
  );
}