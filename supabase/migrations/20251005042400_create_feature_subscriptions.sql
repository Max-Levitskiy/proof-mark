-- migration: create feature_subscriptions table
-- purpose:
--   track emails and optional user_id for users who want to be notified
--   about new features (starting with deep_research_mode).
-- affected objects:
--   - table: public.feature_subscriptions
--   - indexes: email, user_id
--   - unique constraint: (email, feature_name)
--   - rls + policies for anon/authenticated/service_role
--   - trigger: updated_at via public.handle_updated_at()
-- considerations:
--   - email is text and not case-insensitive; the app should normalize to lowercase on insert/check
--   - service_role bypasses rls in supabase, but explicit policies are provided for clarity

-- create table
create table if not exists public.feature_subscriptions (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  user_id uuid references public.users(id) on delete set null,
  feature_name text not null default 'deep_research_mode',
  subscribed_at timestamp with time zone not null default timezone('utc'::text, now()),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

comment on table public.feature_subscriptions is
  'Stores feature notification subscriptions by email and optional user_id.';

comment on column public.feature_subscriptions.email is
  'Subscriber email (application normalizes to lowercase).';

comment on column public.feature_subscriptions.user_id is
  'Optional FK to public.users (null for anonymous subscribers).';

comment on column public.feature_subscriptions.feature_name is
  'Target feature name; defaults to deep_research_mode.';

-- unique constraint to prevent duplicate subscriptions for the same feature
alter table public.feature_subscriptions
  add constraint feature_subscriptions_email_feature_unique
  unique (email, feature_name);

-- enable row level security
alter table public.feature_subscriptions enable row level security;

-- rls policies
-- anyone (anon) can select to allow checking if an email is subscribed
create policy "anon can select feature_subscriptions"
  on public.feature_subscriptions
  for select
  to anon
  using (true);

-- authenticated users can also select
create policy "authenticated can select feature_subscriptions"
  on public.feature_subscriptions
  for select
  to authenticated
  using (true);

-- anyone (anon) can insert to subscribe with an email address
create policy "anon can insert feature_subscriptions"
  on public.feature_subscriptions
  for insert
  to anon
  with check (true);

-- authenticated users can insert to subscribe and optionally attach their user_id
create policy "authenticated can insert feature_subscriptions"
  on public.feature_subscriptions
  for insert
  to authenticated
  with check (true);

-- service_role has full access (explicit policies for clarity; service_role bypasses RLS by default)
create policy "service_role can select feature_subscriptions"
  on public.feature_subscriptions
  for select
  to service_role
  using (true);

create policy "service_role can insert feature_subscriptions"
  on public.feature_subscriptions
  for insert
  to service_role
  with check (true);

create policy "service_role can update feature_subscriptions"
  on public.feature_subscriptions
  for update
  to service_role
  using (true)
  with check (true);

create policy "service_role can delete feature_subscriptions"
  on public.feature_subscriptions
  for delete
  to service_role
  using (true);

-- indexes for common lookup patterns
create index if not exists feature_subscriptions_email_idx
  on public.feature_subscriptions (email);

create index if not exists feature_subscriptions_user_id_idx
  on public.feature_subscriptions (user_id);

-- note: the unique constraint implicitly creates a unique index on (email, feature_name)

-- updated_at trigger (reuses existing handle_updated_at() function)
create trigger on_feature_subscription_updated
  before update on public.feature_subscriptions
  for each row execute procedure public.handle_updated_at();
