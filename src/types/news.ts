export interface NewsCardDto {
  id: string
  image: string
  headline: string
  description: string
  category: string
  trustScore: number
  confidenceLevel: number
  trustExplanation: string
  publishedAt?: string
}
