import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import type { Database } from '@/types/supabase'

type ReactionType = Database['public']['Enums']['reaction_type']

interface ReactionButtonsProps {
  likeCount: number // Will represent "True" count
  dislikeCount: number // Will represent "Fake" count
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
        variant={userReaction === 'true' ? 'default' : 'outline'}
        size={buttonSize}
        onClick={() => onReaction('true')}
        disabled={isDisabled}
        className={
          userReaction === 'true'
            ? 'bg-green-600 hover:bg-green-600 text-white border-green-600 cursor-default disabled:pointer-events-none'
            : 'border-gray-700 hover:bg-gray-800/50 hover:border-gray-600 disabled:hover:bg-transparent disabled:hover:border-gray-700 disabled:cursor-not-allowed'
        }
      >
        <CheckCircle className={`${iconSize} mr-1.5`} />
        <span className={isSmall ? 'text-xs' : 'text-sm'}>True {likeCount > 0 && `(${likeCount})`}</span>
      </Button>

      <Button
        variant={userReaction === 'fake' ? 'default' : 'outline'}
        size={buttonSize}
        onClick={() => onReaction('fake')}
        disabled={isDisabled}
        className={
          userReaction === 'fake'
            ? 'bg-red-600 hover:bg-red-600 text-white border-red-600 cursor-default disabled:pointer-events-none'
            : 'border-gray-700 hover:bg-gray-800/50 hover:border-gray-600 disabled:hover:bg-transparent disabled:hover:border-gray-700 disabled:cursor-not-allowed'
        }
      >
        <AlertTriangle className={`${iconSize} mr-1.5`} />
        <span className={isSmall ? 'text-xs' : 'text-sm'}>Fake {dislikeCount > 0 && `(${dislikeCount})`}</span>
      </Button>
    </div>
  )
}
