import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { MaskedStoreItem, StoreItem } from "@/types/store";

function createRouteClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    },
  );
}

export async function GET(request: NextRequest) {
  const supabase = createRouteClient(request);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: statsRow } = await supabase
    .from("UserStats")
    .select("level")
    .eq("user_id", user.id)
    .single();

  const userLevel: number = statsRow?.level ?? 1;

  const { data: items, error: itemsError } = await supabase
    .from("StoreItems")
    .select("id, name, description, image_url, cost, type, min_level, created_at")
    .order("min_level", { ascending: true })
    .order("cost", { ascending: true });

  if (itemsError || !items) {
    return NextResponse.json({ error: "failed to fetch items" }, { status: 500 });
  }

  const masked: MaskedStoreItem[] = (items as StoreItem[]).map((item) => {
    if (item.min_level > userLevel) {
      return {
        id: item.id,
        name: null,
        description: null,
        image_url: null,
        cost: null,
        type: item.type,
        min_level: item.min_level,
        created_at: item.created_at,
      };
    }
    return item;
  });

  return NextResponse.json(masked);
}
