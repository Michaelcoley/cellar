-- Cellar schema. Run in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  pour_oz numeric(4,2) not null default 1.5,
  created_at timestamptz not null default now()
);

-- Bottles (the heart of the app)
create table if not exists public.bottles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  upc text,
  name text not null,
  brand text,
  category text not null default 'whiskey',
  subtype text,
  proof numeric(5,2),
  age_years integer,
  size_ml integer not null default 750,
  distillery text,
  region text,
  mash_bill text,
  cask_type text,
  batch_no text,
  barrel_no text,
  cost numeric(10,2),
  currency text default 'USD',
  allocated boolean not null default false,
  status text not null default 'sealed' check (status in ('sealed','opened','in_use','finished')),
  fill_pct numeric(5,2) not null default 100,
  opened_at timestamptz,
  finished_at timestamptz,
  photo_url text,
  notes text,
  color_hex text,
  nose_chips text[] default '{}',
  palate_chips text[] default '{}',
  finish_chips text[] default '{}',
  rating_100 integer,
  rating_letter text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bottles_owner_idx on public.bottles(owner_id);
create index if not exists bottles_owner_created_idx on public.bottles(owner_id, created_at desc);
create index if not exists bottles_owner_category_idx on public.bottles(owner_id, category);
create index if not exists bottles_upc_idx on public.bottles(upc) where upc is not null;

-- Pour log
create table if not exists public.pours (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  bottle_id uuid not null references public.bottles(id) on delete cascade,
  oz numeric(5,2) not null default 1.5,
  note text,
  poured_at timestamptz not null default now()
);

create index if not exists pours_owner_idx on public.pours(owner_id, poured_at desc);
create index if not exists pours_bottle_idx on public.pours(bottle_id, poured_at desc);

-- Locations (cabinet, bar, garage, etc.)
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists locations_owner_idx on public.locations(owner_id);

-- Auto-create a profile row on signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists bottles_touch on public.bottles;
create trigger bottles_touch before update on public.bottles
  for each row execute function public.touch_updated_at();
