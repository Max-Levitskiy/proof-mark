import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrustScoreBadge } from '@/components/TrustScoreBadge'
import {
  ArrowLeft,
  Clock,
  User,
  MapPin,
  ExternalLink,
  Share2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { Image } from '@/components/Image'
import { Logo } from '@/components/Logo'
import { NewsArticle } from '@/api/news'

interface ArticleDetailProps {
  article: NewsArticle
  onBack: () => void
  onTrustScoreClick: (score: number, explanation: string, headline: string) => void
}

export function ArticleDetail({ article, onBack, onTrustScoreClick }: ArticleDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Logo />
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-gray-800/50"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Article Header */}
            <div className="mb-6">
              <Badge className="mb-4">{article.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{article.headline}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {article.author && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {article.author}
                  </div>
                )}
                {article.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {article.location}
                  </div>
                )}
                {article.publishedAt && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(article.publishedAt)}
                  </div>
                )}
                {article.readTime && <span>{article.readTime}</span>}
              </div>
            </div>

            {/* Article Image */}
            <div className="mb-8 rounded-lg overflow-hidden">
              <Image
                src={article.image}
                alt={article.headline}
                className="w-full h-[400px] object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none prose-invert">
              <p className="text-xl text-muted-foreground mb-6">{article.description}</p>
              {article.content && (
                <div className="whitespace-pre-wrap">{article.content}</div>
              )}
            </div>

            {/* Share Section */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Share this article</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Original
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Trust Score Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Trust Score</span>
                    <TrustScoreBadge
                      score={article.trustScore}
                      explanation={article.trustExplanation}
                      onOpenModal={() =>
                        onTrustScoreClick(
                          article.trustScore,
                          article.trustExplanation,
                          article.headline
                        )
                      }
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sources Verified</span>
                      <span className="font-medium">{article.sourcesVerified || 0}</span>
                    </div>
                    {article.detailedAnalysis && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Source Reliability</span>
                          <span className="font-medium">
                            {article.detailedAnalysis.sourceReliability}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Factual Accuracy</span>
                          <span className="font-medium">
                            {article.detailedAnalysis.factualAccuracy}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Bias Indicators</span>
                          <span className="font-medium">
                            {article.detailedAnalysis.biasIndicators}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Flags */}
              {article.flags && article.flags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {article.flags.map((flag, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Recommendation */}
              {article.detailedAnalysis?.recommendation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {article.detailedAnalysis.recommendation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
