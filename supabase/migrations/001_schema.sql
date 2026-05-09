-- SOY_CARD_PRO — Schema completo v1.0
-- Habilitar extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- TABLA: user_profiles (datos de la cuenta)
-- ─────────────────────────────────────────
create table if not exists public.user_accounts (
  id          uuid primary key default uuid_generate_v4(),
  auth_id     uuid unique references auth.users(id) on delete cascade,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  plan        text default 'free' check (plan in ('free','pro','team')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- TABLA: profiles (tarjetas de visita)
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.user_accounts(id) on delete cascade,
  slug         text not null,
  display_name text not null,
  title        text,
  company      text,
  bio          text,
  phone        text,
  email        text,
  website      text,
  avatar_url   text,
  cover_color  text default '#C9A84C',
  social_links jsonb default '[]'::jsonb,
  custom_links jsonb default '[]'::jsonb,
  is_active    boolean default true,
  sort_order   int default 0,
  views_count  int default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(user_id, slug)
);

-- ─────────────────────────────────────────
-- TABLA: scan_events (cada escaneo recibido)
-- ─────────────────────────────────────────
create table if not exists public.scan_events (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  ip_hash       text,
  country       text,
  city          text,
  device_type   text,   -- mobile | desktop | tablet
  os            text,   -- Android | iOS | Windows | macOS
  browser       text,
  referrer_type text check (referrer_type in ('nfc','qr','wallet','link','direct','email')),
  user_agent    text,
  is_unique     boolean default true,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- TABLA: leads (contactos capturados)
-- ─────────────────────────────────────────
create table if not exists public.leads (
  id             uuid primary key default uuid_generate_v4(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  scan_event_id  uuid references public.scan_events(id) on delete set null,
  name           text,
  email          text,
  phone          text,
  company        text,
  notes          text,
  tag            text default 'nuevo' check (tag in ('nuevo','interesado','cliente','seguimiento','descartado')),
  consent        boolean default false,
  saved_by_owner boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─────────────────────────────────────────
-- TABLA: share_sessions (multi-perfil temporal)
-- ─────────────────────────────────────────
create table if not exists public.share_sessions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.user_accounts(id) on delete cascade,
  selected_profile_ids uuid[] not null,
  token               text unique not null default encode(gen_random_bytes(16), 'hex'),
  expires_at          timestamptz default (now() + interval '7 days'),
  created_at          timestamptz default now()
);

-- ─────────────────────────────────────────
-- ÍNDICES
-- ─────────────────────────────────────────
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_slug on public.profiles(slug);
create index if not exists idx_scan_events_profile_id on public.scan_events(profile_id);
create index if not exists idx_scan_events_created_at on public.scan_events(created_at desc);
create index if not exists idx_leads_profile_id on public.leads(profile_id);
create index if not exists idx_share_sessions_token on public.share_sessions(token);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table public.user_accounts enable row level security;
alter table public.profiles enable row level security;
alter table public.scan_events enable row level security;
alter table public.leads enable row level security;
alter table public.share_sessions enable row level security;

-- user_accounts: solo tu propia cuenta
create policy "user_accounts_own" on public.user_accounts
  for all using (auth_id = auth.uid());

-- profiles: dueño puede todo; visitantes pueden leer perfiles activos
create policy "profiles_owner" on public.profiles
  for all using (
    user_id = (select id from public.user_accounts where auth_id = auth.uid())
  );

create policy "profiles_public_read" on public.profiles
  for select using (is_active = true);

-- scan_events: dueño del perfil puede leer; API puede insertar (service role)
create policy "scan_events_owner_read" on public.scan_events
  for select using (
    profile_id in (
      select id from public.profiles
      where user_id = (select id from public.user_accounts where auth_id = auth.uid())
    )
  );

-- leads: solo el dueño del perfil
create policy "leads_owner" on public.leads
  for all using (
    profile_id in (
      select id from public.profiles
      where user_id = (select id from public.user_accounts where auth_id = auth.uid())
    )
  );

-- share_sessions: solo el dueño
create policy "share_sessions_owner" on public.share_sessions
  for all using (
    user_id = (select id from public.user_accounts where auth_id = auth.uid())
  );

-- ─────────────────────────────────────────
-- FUNCIÓN: auto-crear user_account al registrarse
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    '[^a-z0-9]', '', 'g'
  ));
  final_username := base_username;
  loop
    exit when not exists (select 1 from public.user_accounts where username = final_username);
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;
  insert into public.user_accounts (auth_id, username, full_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- FUNCIÓN: updated_at automático
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_leads_updated_at before update on public.leads
  for each row execute procedure public.set_updated_at();
