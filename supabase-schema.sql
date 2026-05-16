-- הריצי את הקוד הזה ב-Supabase SQL Editor

create table recipes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null check (category in ('salads', 'starters', 'mains', 'desserts')),
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]',
  servings integer not null default 4,
  source_url text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

-- מאפשר גישה חופשית (לשימוש אישי)
alter table recipes enable row level security;
create policy "allow all" on recipes for all using (true) with check (true);
