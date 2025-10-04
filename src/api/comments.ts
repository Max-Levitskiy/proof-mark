import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'
import type { User } from '@/types/user'

type CommentRow = Tables<'article_comments'>

export interface Comment {
  id: string
  articleId: string
  userId: string
  parentCommentId: string | null
  content: string
  likeCount: number
  dislikeCount: number
  createdAt: string
  updatedAt: string
  user?: User
  replies?: Comment[]
}

// Transform database row to Comment type
function transformComment(row: CommentRow, user?: User): Comment {
  return {
    id: row.id,
    articleId: row.article_id,
    userId: row.user_id,
    parentCommentId: row.parent_comment_id,
    content: row.content,
    likeCount: row.like_count,
    dislikeCount: row.dislike_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user,
    replies: [],
  }
}

// Build nested comment tree
function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // First pass: create map of all comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: build tree structure
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId)
      if (parent) {
        parent.replies!.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return rootComments
}

// Fetch all comments for an article with nested structure
export async function fetchArticleComments(
  articleId: string
): Promise<Comment[]> {
  const { data: comments, error: commentsError } = await supabase
    .from('article_comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true })

  if (commentsError) {
    console.error('Error fetching comments:', commentsError)
    return []
  }

  if (!comments || comments.length === 0) {
    return []
  }

  // Fetch user data for all comments
  const userIds = [...new Set(comments.map((c) => c.user_id))]
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds)

  const userMap = new Map<string, User>(
    users?.map((u) => [
      u.id,
      {
        id: u.id,
        email: u.email,
        full_name: u.full_name || undefined,
        avatar_url: u.avatar_url || undefined,
        created_at: u.created_at,
        updated_at: u.updated_at,
      },
    ]) || []
  )

  const transformedComments = comments.map((c) =>
    transformComment(c, userMap.get(c.user_id))
  )

  return buildCommentTree(transformedComments)
}

// Create a new comment
export async function createComment(
  articleId: string,
  userId: string,
  content: string,
  parentCommentId?: string
): Promise<Comment> {
  // Check if user already has a comment for this entity
  if (parentCommentId) {
    // For replies: check if user already replied to this comment
    const { data: existingReply } = await supabase
      .from('article_comments')
      .select('id')
      .eq('parent_comment_id', parentCommentId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingReply) {
      throw new Error('You have already replied to this comment')
    }

    // Check if user reacted to the parent comment
    const { data: commentReaction } = await supabase
      .from('comment_reactions')
      .select('id')
      .eq('comment_id', parentCommentId)
      .eq('user_id', userId)
      .maybeSingle()

    if (!commentReaction) {
      throw new Error('You must react to the comment before replying')
    }
  } else {
    // For top-level comments: check if user already commented on article
    const { data: existingComment } = await supabase
      .from('article_comments')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .is('parent_comment_id', null)
      .maybeSingle()

    if (existingComment) {
      throw new Error('You have already commented on this article')
    }

    // Check if user reacted to the article
    const { data: articleReaction } = await supabase
      .from('article_reactions')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .maybeSingle()

    if (!articleReaction) {
      throw new Error('You must react to the article before commenting')
    }
  }

  const { data, error } = await supabase
    .from('article_comments')
    .insert({
      article_id: articleId,
      user_id: userId,
      content,
      parent_comment_id: parentCommentId || null,
    })
    .select()
    .single()

  if (error) throw error

  // Fetch user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return transformComment(
    data,
    user
      ? {
          id: user.id,
          email: user.email,
          full_name: user.full_name || undefined,
          avatar_url: user.avatar_url || undefined,
          created_at: user.created_at,
          updated_at: user.updated_at,
        }
      : undefined
  )
}

// TanStack Query Hooks
export function useArticleComments(articleId: string) {
  return useQuery({
    queryKey: ['article-comments', articleId],
    queryFn: () => fetchArticleComments(articleId),
    enabled: !!articleId,
  })
}

export function useCreateComment(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      content,
      parentCommentId,
    }: {
      userId: string
      content: string
      parentCommentId?: string
    }) => createComment(articleId, userId, content, parentCommentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['article-comments', articleId],
      })
    },
  })
}
