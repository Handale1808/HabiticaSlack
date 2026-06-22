"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { StoreItemCard } from "@/components/StoreItemCard";
import type { MaskedStoreItem } from "@/types/store";

export default function StorePage() {
  const { authUser, isRehydrating, userStats, setUserStats, purchases, refreshPurchases } = useUser();
  const router = useRouter();

  const [items, setItems] = useState<MaskedStoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isRehydrating && !authUser) {
      router.push("/login");
    }
  }, [isRehydrating, authUser, router]);

  useEffect(() => {
    if (!authUser) return;

    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/store/items");
      if (!res.ok) {
        setError("could not load the store right now");
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      setItems(data);
      setIsLoading(false);
    };

    fetchItems();
  }, [authUser]);

  if (isRehydrating) return null;
  if (!authUser) return null;

  const ownedItemIds = new Set(purchases.map((p) => p.item_id));

  const handleBuy = async (itemId: string) => {
    if (purchasingId) return;
    setPurchasingId(itemId);
    setError(null);

    const res = await fetch("/api/store/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "purchase failed");
      setPurchasingId(null);
      return;
    }

    if (userStats) {
      setUserStats({ ...userStats, acorns: data.newAcornBalance });
    }
    refreshPurchases();
    setPurchasingId(null);
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="font-display text-4xl text-bark">the store</h1>
          {userStats && (
            <p className="text-sm text-bark/70">
              {userStats.acorns} acorns
            </p>
          )}
        </div>

        {error && (
          <p className="mb-6 text-sm text-berry">{error}</p>
        )}

        {isLoading ? (
          <p className="text-sm text-bark/60">loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item, index) => (
              <StoreItemCard
                key={item.id}
                item={item}
                index={index}
                isOwned={ownedItemIds.has(item.id)}
                canAfford={item.cost !== null && (userStats?.acorns ?? 0) >= item.cost}
                isPurchasing={purchasingId === item.id}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
