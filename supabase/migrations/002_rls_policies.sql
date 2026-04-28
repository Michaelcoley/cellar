-- Row-level security: every user only sees their own data.

alter table public.profiles enable row level security;
alter table public.bottles enable row level security;
alter table public.pours enable row level security;
alter table public.locations enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- bottles
drop policy if exists "bottles_select_own" on public.bottles;
create policy "bottles_select_own" on public.bottles
  for select using (auth.uid() = owner_id);

drop policy if exists "bottles_insert_own" on public.bottles;
create policy "bottles_insert_own" on public.bottles
  for insert with check (auth.uid() = owner_id);

drop policy if exists "bottles_update_own" on public.bottles;
create policy "bottles_update_own" on public.bottles
  for update using (auth.uid() = owner_id);

drop policy if exists "bottles_delete_own" on public.bottles;
create policy "bottles_delete_own" on public.bottles
  for delete using (auth.uid() = owner_id);

-- pours
drop policy if exists "pours_select_own" on public.pours;
create policy "pours_select_own" on public.pours
  for select using (auth.uid() = owner_id);

drop policy if exists "pours_insert_own" on public.pours;
create policy "pours_insert_own" on public.pours
  for insert with check (auth.uid() = owner_id);

drop policy if exists "pours_delete_own" on public.pours;
create policy "pours_delete_own" on public.pours
  for delete using (auth.uid() = owner_id);

-- locations
drop policy if exists "locations_all_own" on public.locations;
create policy "locations_all_own" on public.locations
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
