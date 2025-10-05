-- Add confidence_level column with default 0 and set trust_score default to 50

-- 1) Add confidence_level column with default 0 and NOT NULL
alter table public.news_articles
  add column if not exists confidence_level integer not null default 0;

-- 2) Add 0-100 check constraint for confidence_level (idempotent)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'news_articles_confidence_level_range'
  ) then
    alter table public.news_articles
      add constraint news_articles_confidence_level_range
      check (confidence_level >= 0 and confidence_level <= 100);
  end if;
end $$;

-- 3) Set default value of 50 for existing trust_score column
alter table public.news_articles
  alter column trust_score set default 50;

-- 4) Backfill existing rows with NULL trust_score to 50
update public.news_articles
  set trust_score = 50
  where trust_score is null;

-- 5) Optional index for performance on confidence_level
create index if not exists news_articles_confidence_level_idx
  on public.news_articles (confidence_level);
