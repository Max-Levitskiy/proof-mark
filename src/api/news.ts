import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/supabase'

// Database row type
type NewsArticleRow = Tables<'news_articles'>

// Extended type for frontend use
export interface NewsArticle {
  id: string
  headline: string
  description: string
  category: string
  source?: string
  timestamp?: string
  image: string
  trustScore: number
  confidenceLevel: number
  trustExplanation: string
  userScore: number
  content?: string
  author?: string
  location?: string
  publishedAt?: string
  readTime?: string
  sourcesVerified?: number
  flags?: string[]
  detailedAnalysis?: {
    credibilityScore: number
    sourceReliability: string
    factualAccuracy: string
    biasIndicators: string
    recommendation: string
  }
}

// Transform database row to NewsArticle
function transformNewsArticle(row: NewsArticleRow): NewsArticle {
  // Extract category from JSONB array of objects
  const categories = Array.isArray(row.category) ? row.category : []
  const category =
    categories.length > 0
      ? typeof categories[0] === 'object' && categories[0] !== null
        ? String((categories[0] as Record<string, unknown>).label || '')
        : String(categories[0])
      : ''

  // Extract flags from JSONB array
  const flags = Array.isArray(row.flags) ? (row.flags as string[]) : undefined

  // Extract detailed analysis from JSONB
  const detailedAnalysis =
    row.detailed_analysis && typeof row.detailed_analysis === 'object'
      ? {
          credibilityScore:
            Number(
              (row.detailed_analysis as Record<string, unknown>)
                .credibilityScore
            ) || 0,
          sourceReliability: String(
            (row.detailed_analysis as Record<string, unknown>)
              .sourceReliability || ''
          ),
          factualAccuracy: String(
            (row.detailed_analysis as Record<string, unknown>)
              .factualAccuracy || ''
          ),
          biasIndicators: String(
            (row.detailed_analysis as Record<string, unknown>).biasIndicators ||
              ''
          ),
          recommendation: String(
            (row.detailed_analysis as Record<string, unknown>).recommendation ||
              ''
          ),
        }
      : undefined

  // Extract author from JSON or string
  const author =
    row.author && typeof row.author === 'object'
      ? String((row.author as Record<string, unknown>).name || '')
      : typeof row.author === 'string'
        ? row.author
        : undefined

  // Extract source from JSON or string
  const source =
    row.source && typeof row.source === 'object'
      ? String((row.source as Record<string, unknown>).name || '')
      : typeof row.source === 'string'
        ? row.source
        : undefined

  return {
    id: row.id,
    headline: row.headline,
    description: row.description || '',
    category,
    image: row.image || '',
    trustScore: row.trust_score ?? 50,
    confidenceLevel: row.confidence_level ?? 0,
    trustExplanation: row.trust_explanation || '',
    userScore: row.user_score ?? 0,
    content: row.content || undefined,
    author,
    location: row.location || undefined,
    publishedAt: row.published_at || undefined,
    readTime: row.read_time || undefined,
    source,
    sourcesVerified: row.sources_verified || undefined,
    flags,
    detailedAnalysis,
  }
}

// API functions using Supabase
export async function fetchNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching news:', error)
    return []
  }

  return data?.map(transformNewsArticle) || []
}

export async function fetchNewsById(id: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching news by id:', error)
    return null
  }

  return data ? transformNewsArticle(data) : null
}

export async function analyzeText(_text: string): Promise<{
  score: number
  explanation: string
  sources: Array<{ title: string; url: string; credibility: string }>
}> {
  // TODO: Replace with actual AI analysis API call

  // Mock response for now
  return {
    score: 0,
    explanation: '',
    sources: [],
  }
}

// TanStack Query hooks
export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
  })
}

export function useNewsById(id: string) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: () => fetchNewsById(id),
    enabled: !!id,
  })
}
