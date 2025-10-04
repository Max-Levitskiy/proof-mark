-- Function to validate user has reacted before commenting
create or replace function public.validate_comment_reaction()
returns trigger as $$
begin
  -- Check if this is a reply (has parent_comment_id)
  if new.parent_comment_id is not null then
    -- For replies: check if user has reacted to the parent comment
    if not exists (
      select 1
      from public.comment_reactions
      where comment_id = new.parent_comment_id
        and user_id = new.user_id
    ) then
      raise exception 'You must react to the comment before replying';
    end if;
  else
    -- For top-level comments: check if user has reacted to the article
    if not exists (
      select 1
      from public.article_reactions
      where article_id = new.article_id
        and user_id = new.user_id
    ) then
      raise exception 'You must react to the article before commenting';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to enforce reaction requirement before inserting comments
create trigger enforce_comment_reaction_requirement
  before insert on public.article_comments
  for each row execute procedure public.validate_comment_reaction();

