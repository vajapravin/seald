create table public.sites (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  username text not null,
  password text not null,      -- Fernet ciphertext, never plaintext
  note text not null default '',
  backup_code text not null default '',  -- Fernet ciphertext
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Locked by default: RLS on with no policies means the anon key can read
-- nothing. The backend uses the service-role key, which bypasses RLS.
-- User-scoped policies arrive with the auth milestone.
alter table public.sites enable row level security;