import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type ReactionType = Database['public']['Enums']['reaction_type']

// Article Reactions
export interface ArticleReactionCounts {
  likeCount: number
  dislikeCount: number
  userReaction: ReactionType | null
}

export async function getArticleReactions(
  articleId: string,
  userId?: string
): Promise<ArticleReactionCounts> {
  const { data, error } = await supabase
    .from('article_reactions')
    .select('reaction_type, user_id')
    .eq('article_id', articleId)

  if (error) {
    console.error('Error fetching article reactions:', error)
    return { likeCount: 0, dislikeCount: 0, userReaction: null }
  }

  const likeCount = data.filter((r) => r.reaction_type === 'true').length
  const dislikeCount = data.filter((r) => r.reaction_type === 'fake').length
  const userReaction =
    userId && data.find((r) => r.user_id === userId)?.reaction_type

  return {
    likeCount,
    dislikeCount,
    userReaction: userReaction || null,
  }
}

export async function toggleArticleReaction(
  articleId: string,
  userId: string,
  reactionType: ReactionType
): Promise<void> {
  // Check if user already has a reaction
  const { data: existing } = await supabase
    .from('article_reactions')
    .select('reaction_type')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    // User already reacted - cannot change or remove reaction
    return
  }

  // Create new reaction
  const { error } = await supabase.from('article_reactions').insert({
    article_id: articleId,
    user_id: userId,
    reaction_type: reactionType,
  })

  if (error) throw error
}

// Comment Reactions
export interface CommentReactionCounts {
  likeCount: number
  dislikeCount: number
  userReaction: ReactionType | null
}

export async function getCommentReaction(
  commentId: string,
  userId?: string
): Promise<CommentReactionCounts> {
  // Get cached counts from comment
  const { data: comment } = await supabase
    .from('article_comments')
    .select('like_count, dislike_count')
    .eq('id', commentId)
    .single()

  // Get user's reaction
  let userReaction: ReactionType | null = null
  if (userId) {
    const { data } = await supabase
      .from('comment_reactions')
      .select('reaction_type')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle()

    userReaction = data?.reaction_type || null
  }

  return {
    likeCount: comment?.like_count || 0,
    dislikeCount: comment?.dislike_count || 0,
    userReaction,
  }
}

export async function toggleCommentReaction(
  commentId: string,
  userId: string,
  reactionType: ReactionType
): Promise<void> {
  // Check if user already has a reaction
  const { data: existing } = await supabase
    .from('comment_reactions')
    .select('reaction_type')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    // User already reacted - cannot change or remove reaction
    return
  }

  // Create new reaction
  const { error } = await supabase.from('comment_reactions').insert({
    comment_id: commentId,
    user_id: userId,
    reaction_type: reactionType,
  })

  if (error) throw error
}

// TanStack Query Hooks
export function useArticleReactions(articleId: string, userId?: string) {
  return useQuery({
    queryKey: ['article-reactions', articleId, userId],
    queryFn: () => getArticleReactions(articleId, userId),
    enabled: !!articleId,
  })
}

export function useToggleArticleReaction(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      reactionType,
    }: {
      userId: string
      reactionType: ReactionType
    }) => toggleArticleReaction(articleId, userId, reactionType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['article-reactions', articleId],
      })
    },
  })
}

export function useToggleCommentReaction(commentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      reactionType,
    }: {
      userId: string
      reactionType: ReactionType
    }) => toggleCommentReaction(commentId, userId, reactionType),
    onSuccess: () => {
      // Invalidate both the comment reactions and the article comments
      queryClient.invalidateQueries({
        queryKey: ['comment-reaction', commentId],
      })
      queryClient.invalidateQueries({ queryKey: ['article-comments'] })
    },
  })
}
