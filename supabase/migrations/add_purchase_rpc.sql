-- purchase_item RPC: atomically deducts acorns and records a purchase
-- Run after add_purchases_table.sql
create or replace function purchase_item(p_user_id uuid, p_item_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_cost integer;
  v_current_acorns integer;
  v_new_acorns integer;
  v_item_type text;
  v_purchase_id uuid;
begin
  select cost, type into v_cost, v_item_type
  from "StoreItems"
  where id = p_item_id;

  if not found then
    raise exception 'item_not_found';
  end if;

  select acorns into v_current_acorns
  from "UserStats"
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'user_stats_not_found';
  end if;

  if v_current_acorns < v_cost then
    raise exception 'insufficient_acorns';
  end if;

  v_new_acorns := v_current_acorns - v_cost;

  update "UserStats"
  set acorns = v_new_acorns
  where user_id = p_user_id;

  insert into "Purchases" (user_id, item_id, cost_at_purchase, type)
  values (p_user_id, p_item_id, v_cost, v_item_type)
  returning id into v_purchase_id;

  return json_build_object(
    'new_acorn_balance', v_new_acorns,
    'purchase_id', v_purchase_id
  );
end;
$$;

grant execute on function purchase_item(uuid, uuid) to authenticated;
