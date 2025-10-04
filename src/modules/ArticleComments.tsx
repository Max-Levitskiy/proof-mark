import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactionButtons } from '@/components/ReactionButtons'
import { CommentItem } from '@/components/CommentItem'
import { Loader } from '@/components/Loader'
import { MessageSquarePlus } from 'lucide-react'
import {
  useArticleComments,
  useCreateComment,
} from '@/api/comments'
import {
  useArticleReactions,
  useToggleArticleReaction,
} from '@/api/reactions'
import type { Database } from '@/types/supabase'

type ReactionType = Database['public']['Enums']['reaction_type']

interface ArticleCommentsProps {
  articleId: string
  userId?: string
}

export function ArticleComments({ articleId, userId }: ArticleCommentsProps) {
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentContent, setCommentContent] = useState('')

  // Fetch data
  const { data: comments, isLoading: commentsLoading } =
    useArticleComments(articleId)
  const { data: reactions, isLoading: reactionsLoading } = useArticleReactions(
    articleId,
    userId
  )

  // Check if user already commented on this article
  const userHasCommented = comments?.some(
    (comment) => comment.userId === userId && !comment.parentCommentId
  )

  // Mutations
  const createComment = useCreateComment(articleId)
  const toggleReaction = useToggleArticleReaction(articleId)

  const handleReaction = (type: ReactionType) => {
    if (!userId) return
    toggleReaction.mutate({ userId, reactionType: type })
  }

  const handleCommentSubmit = () => {
    if (!userId || !commentContent.trim()) return

    createComment.mutate(
      {
        userId,
        content: commentContent,
      },
      {
        onSuccess: () => {
          setCommentContent('')
          setShowCommentForm(false)
        },
      }
    )
  }

  const handleReply = (parentId: string, content: string) => {
    if (!userId) return
    createComment.mutate({
      userId,
      content,
      parentCommentId: parentId,
    })
  }

  const isLoading = commentsLoading || reactionsLoading

  return (
    <div className="mt-8 pt-8 border-t border-gray-800">
      <Card className="bg-card border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Community Discussion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Article Reactions */}
          {userId && (
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-400">
                Rate this article
              </h3>
              <div className="flex items-center gap-3">
                <ReactionButtons
                  likeCount={reactions?.likeCount || 0}
                  dislikeCount={reactions?.dislikeCount || 0}
                  userReaction={reactions?.userReaction || null}
                  onReaction={handleReaction}
                  disabled={false}
                />
                
                {/* Proof Button - only show if reacted and haven't commented yet */}
                {reactions?.userReaction && !userHasCommented && !showCommentForm && (
                  <Button
                    onClick={() => setShowCommentForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    I have a proof
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Comment Form */}
          {showCommentForm && !userHasCommented && (
            <div className="space-y-3">
              <Textarea
                placeholder="Share your proof or perspective..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="min-h-[120px] bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCommentSubmit}
                  disabled={!commentContent.trim() || createComment.isPending}
                >
                  {createComment.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCommentForm(false)
                    setCommentContent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div>
            <h3 className="text-sm font-medium mb-4 text-gray-400">
              {comments && comments.length > 0
                ? `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}`
                : 'No comments yet'}
            </h3>

            {isLoading ? (
              <div className="py-8">
                <Loader />
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={userId}
                    onReply={handleReply}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
