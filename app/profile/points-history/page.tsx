"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/context/UserContext";
import { Card } from "@/components/ui/Card";

type LedgerEntry = {
  id: string;
  stat_type: string;
  amount: number;
  reason: string;
  created_at: string;
};

type GroupedDay = {
  date: string;
  entries: LedgerEntry[];
};

function parseReason(reason: string): string {
  const parts = reason.split(":");
  if (parts[0] === "daily-award" && parts.length >= 3) {
    return parts.slice(2).join(":").replace(/-/g, " ");
  }
  if (parts[0] === "purchase" && parts.length >= 2) {
    return `bought ${parts.slice(1).join(":")}`;
  }
  return reason;
}

function groupByDate(entries: LedgerEntry[]): GroupedDay[] {
  const map = new Map<string, LedgerEntry[]>();
  for (const entry of entries) {
    const date = entry.created_at.slice(0, 10);
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(entry);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({ date, entries }));
}

export default function PointsHistoryPage() {
  const { authUser, isRehydrating } = useUser();
  const router = useRouter();
  const [days, setDays] = useState<GroupedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isRehydrating && !authUser) {
      router.push("/login");
    }
  }, [isRehydrating, authUser, router]);

  useEffect(() => {
    if (!authUser) return;

    async function load() {
      const { data, error } = await supabase
        .from("StatLedger")
        .select("id, stat_type, amount, reason, created_at")
        .eq("user_id", authUser!.id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        setError(error.message.toLowerCase());
      } else {
        setDays(groupByDate(data ?? []));
      }
      setLoading(false);
    }

    load();
  }, [authUser]);

  if (isRehydrating || !authUser) return null;

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <div className="flex w-full max-w-lg items-center gap-4">
        <Link href="/profile" className="text-sm text-bark/60 hover:text-bark transition-colors">
          back to profile
        </Link>
        <h1 className="font-display text-4xl text-bark">points history</h1>
      </div>

      {loading && <p className="text-bark/60 text-sm">loading...</p>}
      {error && <p className="text-sm text-berry">{error}</p>}

      {!loading && days.length === 0 && (
        <p className="text-bark/60 text-sm">no points awarded yet</p>
      )}

      <div className="flex w-full max-w-lg flex-col gap-4">
        {days.map(({ date, entries }) => {
          const totals: Record<string, number> = {};
          for (const e of entries) {
            totals[e.stat_type] = (totals[e.stat_type] ?? 0) + e.amount;
          }

          return (
            <Card key={date} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg text-bark">{date}</h2>
                <span className="text-xs text-bark/50">
                  {Object.entries(totals)
                    .map(([type, total]) => `${total >= 0 ? "+" : ""}${total} ${type}`)
                    .join(" · ")}
                </span>
              </div>

              <ul className="flex flex-col gap-1">
                {entries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between text-sm">
                    <span className="text-bark/80 capitalize">{parseReason(entry.reason)}</span>
                    <span className="text-bark font-medium">
                      {entry.amount >= 0 ? "+" : ""}{entry.amount} {entry.stat_type}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
