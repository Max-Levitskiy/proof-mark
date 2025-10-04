import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { Database } from '@/types/supabase'

type ReactionType = Database['public']['Enums']['reaction_type']

interface ReactionButtonsProps {
  likeCount: number
  dislikeCount: number
  userReaction: ReactionType | null
  onReaction: (type: ReactionType) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function ReactionButtons({
  likeCount,
  dislikeCount,
  userReaction,
  onReaction,
  disabled = false,
  size = 'md',
}: ReactionButtonsProps) {
  const isSmall = size === 'sm'
  const buttonSize = isSmall ? 'sm' : 'default'
  const iconSize = isSmall ? 'w-3 h-3' : 'w-4 h-4'
  
  // Disable all buttons if user has already reacted (reactions are permanent)
  const isDisabled = disabled || userReaction !== null

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userReaction === 'like' ? 'default' : 'outline'}
        size={buttonSize}
        onClick={() => onReaction('like')}
        disabled={isDisabled}
        className={
          userReaction === 'like'
            ? 'bg-green-600 hover:bg-green-600 text-white border-green-600 cursor-default'
            : 'border-gray-700 hover:bg-gray-800/50 hover:border-gray-600'
        }
      >
        <ThumbsUp className={`${iconSize} mr-1.5`} />
        <span className={isSmall ? 'text-xs' : 'text-sm'}>{likeCount}</span>
      </Button>

      <Button
        variant={userReaction === 'dislike' ? 'default' : 'outline'}
        size={buttonSize}
        onClick={() => onReaction('dislike')}
        disabled={isDisabled}
        className={
          userReaction === 'dislike'
            ? 'bg-red-600 hover:bg-red-600 text-white border-red-600 cursor-default'
            : 'border-gray-700 hover:bg-gray-800/50 hover:border-gray-600'
        }
      >
        <ThumbsDown className={`${iconSize} mr-1.5`} />
        <span className={isSmall ? 'text-xs' : 'text-sm'}>{dislikeCount}</span>
      </Button>
    </div>
  )
}
