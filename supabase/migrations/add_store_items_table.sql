-- StoreItems table
create table if not exists "StoreItems" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image_url text not null,
  cost integer not null,
  type text not null default 'pet',
  min_level integer not null default 1,
  created_at timestamptz not null default now()
);

alter table "StoreItems" enable row level security;

create policy "authenticated users can read store items"
  on "StoreItems"
  for select
  to authenticated
  using (true);

-- Seed data: 5 pets spanning levels 1-3
insert into "StoreItems" (name, description, image_url, cost, type, min_level) values
  ('Acorn Mouse', 'A tiny mouse who collects acorns just like you. Always cheerful, always hungry.', '/pets/placeholder.svg', 10, 'pet', 1),
  ('Moss Toad', 'Found sitting on the same mossy log every morning. Seems content.', '/pets/placeholder.svg', 20, 'pet', 1),
  ('Bramble Fox', 'Quick and clever. Leaves small footprints in the mud near your door.', '/pets/placeholder.svg', 35, 'pet', 2),
  ('Fern Owl', 'Watches everything. Judges nothing. Occasionally blinks.', '/pets/placeholder.svg', 50, 'pet', 2),
  ('Storm Elk', 'Ancient and proud. Arrived one morning and has not left.', '/pets/placeholder.svg', 80, 'pet', 3);
