-- Remove UPDATE and DELETE policies for comments (read + create only)
drop policy if exists "Users can update their own comments" on public.article_comments;
drop policy if exists "Users can delete their own comments" on public.article_comments;

-- Remove the update trigger (no longer needed since comments can't be updated)
drop trigger if exists on_article_comment_updated on public.article_comments;

