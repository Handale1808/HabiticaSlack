-- Purchases table (run after add_store_items_table.sql)
create table if not exists "Purchases" (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references "StoreItems"(id) on delete restrict,
  cost_at_purchase integer not null,
  type text not null default 'pet',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table "Purchases" enable row level security;

create policy "users can read own purchases"
  on "Purchases"
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own purchases"
  on "Purchases"
  for insert
  to authenticated
  with check (auth.uid() = user_id);
