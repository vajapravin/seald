-- 1. Clear test rows (they have no user_id and would block the not-null constraint)
delete from public.sites;

-- 2. Add the column
alter table public.sites
  add column user_id uuid references auth.users(id) on delete cascade;

-- 3. Enforce presence + index
alter table public.sites
  alter column user_id set not null;

create index if not exists sites_user_id_idx on public.sites (user_id);

-- 4. RLS policies (RLS itself was enabled in your first migration)
create policy "Users can view their own sites"
  on public.sites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sites"
  on public.sites for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sites"
  on public.sites for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own sites"
  on public.sites for delete
  using (auth.uid() = user_id);