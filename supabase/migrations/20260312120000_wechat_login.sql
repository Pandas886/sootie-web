create extension if not exists pgcrypto;

create table if not exists public.wechat_accounts (
  id uuid primary key default gen_random_uuid(),
  openid text not null unique,
  unionid text,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  login_email text not null unique,
  nickname text,
  avatar_path text,
  avatar_url text,
  avatar_source_url text,
  subscribed boolean not null default true,
  subscribed_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wechat_login_intents (
  id uuid primary key default gen_random_uuid(),
  scene_str text not null unique,
  browser_nonce text not null,
  status text not null default 'pending'
    check (status in ('pending', 'scanned', 'approved', 'consumed', 'expired')),
  openid text,
  login_email text,
  nickname text,
  avatar_url text,
  ticket text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wechat_runtime_cache (
  key text primary key,
  value text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_wechat_accounts_updated_at on public.wechat_accounts;
create trigger set_wechat_accounts_updated_at
before update on public.wechat_accounts
for each row
execute function public.set_updated_at();

drop trigger if exists set_wechat_login_intents_updated_at on public.wechat_login_intents;
create trigger set_wechat_login_intents_updated_at
before update on public.wechat_login_intents
for each row
execute function public.set_updated_at();

drop trigger if exists set_wechat_runtime_cache_updated_at on public.wechat_runtime_cache;
create trigger set_wechat_runtime_cache_updated_at
before update on public.wechat_runtime_cache
for each row
execute function public.set_updated_at();

alter table public.wechat_accounts enable row level security;
alter table public.wechat_login_intents enable row level security;
alter table public.wechat_runtime_cache enable row level security;

drop policy if exists "Users can read own wechat account" on public.wechat_accounts;
create policy "Users can read own wechat account"
on public.wechat_accounts
for select
to authenticated
using (auth.uid() = auth_user_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('wechat-avatars', 'wechat-avatars', true, 2097152)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;
