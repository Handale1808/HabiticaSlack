import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Purchase } from "@/types/store";

export function usePurchases(userId: string | null): {
  purchases: Purchase[];
  isLoading: boolean;
  refreshPurchases: () => void;
} {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userId) {
      setPurchases([]);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    const fetchPurchases = async () => {
      const { data: purchaseRows, error } = await supabase
        .from("Purchases")
        .select("id, user_id, item_id, cost_at_purchase, type, expires_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (!mounted) return;

      if (error || !purchaseRows) {
        setIsLoading(false);
        return;
      }

      const itemIds = [...new Set(purchaseRows.map((r) => r.item_id as string))];

      let spriteKeyMap: Record<string, string | null> = {};
      if (itemIds.length > 0) {
        const { data: itemRows } = await supabase
          .from("StoreItems")
          .select("id, sprite_key")
          .in("id", itemIds);

        if (itemRows) {
          for (const item of itemRows as { id: string; sprite_key: string | null }[]) {
            spriteKeyMap[item.id] = item.sprite_key;
          }
        }
      }

      if (!mounted) return;

      const mapped: Purchase[] = purchaseRows.map((row) => ({
        id: row.id as string,
        user_id: row.user_id as string,
        item_id: row.item_id as string,
        cost_at_purchase: row.cost_at_purchase as number,
        type: row.type as string,
        expires_at: row.expires_at as string | null,
        created_at: row.created_at as string,
        sprite_key: spriteKeyMap[row.item_id as string] ?? null,
      }));

      setPurchases(mapped);
      setIsLoading(false);
    };

    fetchPurchases();

    return () => {
      mounted = false;
    };
  }, [userId, tick]);

  const refreshPurchases = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  return { purchases, isLoading, refreshPurchases };
}
