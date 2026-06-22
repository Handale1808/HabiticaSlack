const FLAVOUR_STRINGS = [
  "something stirs deep in the forest...",
  "a shadow moves between the trees at dusk.",
  "old tracks in the mud. not yours.",
  "the lantern flickered, then steadied.",
  "a sound, just once, then silence.",
  "something is watching from the undergrowth.",
];

interface MysteryCardProps {
  index: number;
}

export function MysteryCard({ index }: MysteryCardProps) {
  const flavour = FLAVOUR_STRINGS[index % FLAVOUR_STRINGS.length];

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-bark/20 bg-bark/10 p-5 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <img
          src="/pets/placeholder.svg"
          alt=""
          aria-hidden="true"
          width={48}
          height={48}
          className="opacity-80"
          style={{ filter: "brightness(0)" }}
        />
      </div>
      <p className="font-display text-lg text-bark/40">???</p>
      <p className="text-xs italic text-bark/50">{flavour}</p>
      <p className="text-sm text-bark/40">??? acorns</p>
    </div>
  );
}
