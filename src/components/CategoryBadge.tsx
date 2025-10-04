interface CategoryBadgeProps {
  category: string
  showHashtag?: boolean
}

export function CategoryBadge({ category, showHashtag = true }: CategoryBadgeProps) {
  // Extract the last part after splitting by slash
  const lastPart = category.trim().split('/').pop()?.trim() || category
  const displayText = showHashtag ? `#${lastPart}` : lastPart

  return (
    <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-gray-900/80 backdrop-blur-sm text-gray-200">
      {displayText}
    </span>
  )
}
