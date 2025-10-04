import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ReactionButtons } from '@/components/ReactionButtons'
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import type { Comment } from '@/api/comments'
import type { Database } from '@/types/supabase'
import { useToggleCommentReaction } from '@/api/reactions'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

type ReactionType = Database['public']['Enums']['reaction_type']

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onReply: (parentId: string, content: string) => void
  depth?: number
}

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  const toggleReaction = useToggleCommentReaction(comment.id)
  const isOwnComment = currentUserId === comment.userId

  // Fetch user's reaction to this comment
  const { data: userReaction } = useQuery({
    queryKey: ['comment-reaction', comment.id, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null
      const { data } = await supabase
        .from('comment_reactions')
        .select('reaction_type')
        .eq('comment_id', comment.id)
        .eq('user_id', currentUserId)
        .maybeSingle()
      return data?.reaction_type || null
    },
    enabled: !!currentUserId && !isOwnComment,
  })

  // Check if user already replied to this comment
  const { data: hasReplied } = useQuery({
    queryKey: ['has-replied', comment.id, currentUserId],
    queryFn: async () => {
      if (!currentUserId) return false
      const { data } = await supabase
        .from('article_comments')
        .select('id')
        .eq('parent_comment_id', comment.id)
        .eq('user_id', currentUserId)
        .maybeSingle()
      return !!data
    },
    enabled: !!currentUserId && !isOwnComment,
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const handleReaction = (type: ReactionType) => {
    if (!currentUserId) return
    toggleReaction.mutate({ userId: currentUserId, reactionType: type })
  }

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent)
      setReplyContent('')
      setIsReplying(false)
    }
  }

  const getUserInitials = () => {
    const name = comment.user?.full_name || comment.user?.email || 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const maxDepth = 5
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className={depth > 0 ? 'ml-8 mt-4' : 'mt-4'}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={comment.user?.avatar_url} />
          <AvatarFallback className="bg-gray-700 text-gray-200 text-xs">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-200">
              {comment.user?.full_name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-2">
            {!isOwnComment && (
              <ReactionButtons
                likeCount={comment.likeCount}
                dislikeCount={comment.dislikeCount}
                userReaction={userReaction || null}
                onReaction={handleReaction}
                disabled={!currentUserId}
                size="sm"
              />
            )}

            {depth < maxDepth && currentUserId && !isOwnComment && userReaction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                disabled={hasReplied}
                className={
                  hasReplied
                    ? 'text-gray-500 h-7 px-2 cursor-default'
                    : 'text-gray-400 hover:text-gray-200 h-7 px-2'
                }
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                {hasReplied ? 'Replied' : 'Reply'}
              </Button>
            )}

            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-gray-200 h-7 px-2"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Show {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Hide
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 mb-4">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleReplySubmit}>
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyContent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {hasReplies && !isCollapsed && (
            <div className="mt-2">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
