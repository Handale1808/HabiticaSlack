import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

export async function POST(request: NextRequest) {
  const supabase = createRouteClient(request);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const itemId: unknown = body.itemId;

  if (!itemId || typeof itemId !== "string") {
    return NextResponse.json({ error: "missing itemId" }, { status: 400 });
  }

  // Verify the user's level allows purchasing this item
  const { data: itemRow } = await supabase
    .from("StoreItems")
    .select("min_level")
    .eq("id", itemId)
    .single();

  if (!itemRow) {
    return NextResponse.json({ error: "item not found" }, { status: 404 });
  }

  const { data: statsRow } = await supabase
    .from("UserStats")
    .select("level")
    .eq("user_id", user.id)
    .single();

  const userLevel: number = statsRow?.level ?? 1;

  if (itemRow.min_level > userLevel) {
    return NextResponse.json({ error: "item locked" }, { status: 403 });
  }

  const { data: rpcResult, error: rpcError } = await supabase.rpc("purchase_item", {
    p_user_id: user.id,
    p_item_id: itemId,
  });

  if (rpcError) {
    const msg = rpcError.message ?? "";
    if (msg.includes("insufficient_acorns")) {
      return NextResponse.json({ error: "not enough acorns" }, { status: 402 });
    }
    if (msg.includes("item_not_found")) {
      return NextResponse.json({ error: "item not found" }, { status: 404 });
    }
    return NextResponse.json({ error: msg || "purchase failed" }, { status: 500 });
  }

  const result = rpcResult as { new_acorn_balance: number; purchase_id: string };

  return NextResponse.json({
    newAcornBalance: result.new_acorn_balance,
    purchaseId: result.purchase_id,
  });
}
