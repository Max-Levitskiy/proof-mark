// Types
export interface NewsArticle {
  id: string
  headline: string
  description: string
  category: string
  source?: string
  timestamp?: string
  image: string
  trustScore: number
  trustExplanation: string
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

// Mock data provider - easily replaceable with API
const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: '1',
    headline: 'Global Climate Summit Reaches Historic Agreement on Carbon Reduction',
    description: 'World leaders agree on ambitious targets to cut emissions by 50% within the next decade',
    category: 'climate',
    image: 'https://images.unsplash.com/photo-1687610877269-9c051d3d254e',
    author: 'Sarah Chen',
    location: 'Geneva, Switzerland',
    publishedAt: '2025-01-04T10:30:00Z',
    readTime: '4 min read',
    trustScore: 87,
    trustExplanation: 'High credibility with verified sources',
    content: 'Full article content here...',
    sourcesVerified: 15,
    flags: [
      'Multiple independent sources confirm the agreement',
      'Official statements from government representatives',
      'No misleading claims or bias indicators detected',
      'Facts cross-referenced with climate science data',
    ],
    detailedAnalysis: {
      credibilityScore: 87,
      sourceReliability: 'High',
      factualAccuracy: 'Verified',
      biasIndicators: 'Minimal',
      recommendation:
        'This article demonstrates high credibility with strong factual foundation and multiple verifiable sources.',
    },
  },
]

// API placeholder functions - to be connected to Supabase
export async function fetchNews(): Promise<NewsArticle[]> {
  // TODO: Replace with actual Supabase call
  // const { data, error } = await supabase.from('news').select('*')

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data for now
  return MOCK_ARTICLES
}

export async function fetchNewsById(id: string): Promise<NewsArticle | null> {
  // TODO: Replace with actual Supabase call
  // const { data, error } = await supabase.from('news').select('*').eq('id', id).single()

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data for now
  return MOCK_ARTICLES.find((article) => article.id === id) || null
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
