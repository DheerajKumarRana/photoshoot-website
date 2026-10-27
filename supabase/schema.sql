-- =====================================================================
-- Vistaar Content — Supabase schema (Phase 1)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to run again: everything is "if not exists" / "or replace".
--
-- Tables mirror js/content.js:
--   site_settings  CONFIG (contact), TEAM, HERO, PRINTS   (key → JSON value)
--   categories     CATS + CAT_PAGES
--   photos         PHOTOS
--   films          FILMS.highlights + FILMS.reels
--   gallery        GALLERY (polaroid line)
--   enquiries      new: every enquiry form submission
--   admins         who may edit (rows link to Supabase Auth users)
-- Images: `img` is an Unsplash photo ID (stand-ins); `src` is a full URL,
-- e.g. a file in the public "media" storage bucket. `src` wins when set.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Admins ----------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- True when the signed-in user is listed in admins. security definer so
-- policies can call it without exposing the admins table itself.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Content ---------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id          text primary key,                 -- slug: weddings, kids, ...
  title       text not null,
  short       text not null,
  line        text not null default '',
  subs        text[] not null default '{}',
  img         text,                             -- cover (Unsplash ID)
  src         text,                             -- cover (full URL), wins over img
  page_lead   text not null default '',
  page_accent text not null default '',
  page_tail   text not null default '',
  page_text   text not null default '',
  sort        int  not null default 0,
  published   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  category_id text not null references public.categories(id) on update cascade on delete restrict,
  moment      text not null default '',
  ratio       numeric not null default 1.5,     -- width / height
  img         text,
  src         text,
  sort        int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists photos_category_sort on public.photos (category_id, sort);

create table if not exists public.films (
  id          uuid primary key default gen_random_uuid(),
  category_id text not null references public.categories(id) on update cascade on delete restrict,
  kind        text not null check (kind in ('highlight','reel')),
  title       text not null,
  src         text,                             -- video file URL (.mp4)
  poster      text,                             -- poster image URL
  img         text,                             -- poster stand-in (Unsplash ID)
  sort        int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists films_category_sort on public.films (category_id, sort);

create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  category_id text references public.categories(id) on update cascade on delete set null,
  title       text not null default '',
  caption     text not null default '',
  img         text,
  src         text,
  sort        int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Enquiries -------------------------------------------------
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 120),
  phone       text not null check (char_length(phone) between 5 and 30),
  occasion    text check (char_length(occasion) <= 80),
  event_date  date,
  city        text check (char_length(city) <= 160),
  message     text check (char_length(message) <= 2000),
  status      text not null default 'new' check (status in ('new','contacted','booked','closed'))
);

-- ---------- Row Level Security -----------------------------------------
alter table public.admins        enable row level security;
alter table public.site_settings enable row level security;
alter table public.categories    enable row level security;
alter table public.photos        enable row level security;
alter table public.films         enable row level security;
alter table public.gallery       enable row level security;
alter table public.enquiries     enable row level security;

-- Visitors read published content; admins read and change everything.
do $$
declare t text;
begin
  foreach t in array array['categories','photos','films','gallery'] loop
    execute format('drop policy if exists "public reads published" on public.%I', t);
    execute format('create policy "public reads published" on public.%I for select using (published or public.is_admin())', t);
    execute format('drop policy if exists "admins manage" on public.%I', t);
    execute format('create policy "admins manage" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public reads settings" on public.site_settings;
create policy "public reads settings" on public.site_settings for select using (true);
drop policy if exists "admins manage" on public.site_settings;
create policy "admins manage" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Anyone can send an enquiry; only admins can read or update them.
drop policy if exists "anyone sends" on public.enquiries;
create policy "anyone sends" on public.enquiries for insert to anon, authenticated with check (status = 'new');
drop policy if exists "admins manage" on public.enquiries;
create policy "admins manage" on public.enquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admins can see who else is an admin; nobody edits this table from the site.
drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select to authenticated using (public.is_admin());

-- Table privileges (RLS above still decides which rows).
grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.categories, public.photos, public.films, public.gallery to anon, authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, insert, update, delete on public.site_settings, public.categories, public.photos, public.films, public.gallery, public.enquiries to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Storage: one public bucket for photos, posters and films ----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 104857600,   -- 100 MB per file
        array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
