import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryBadge } from '@/components/CategoryBadge'
import { Separator } from '@/components/ui/separator'
import { TrustScoreBadge } from '@/components/TrustScoreBadge'
import { ShareModal } from '@/modules/ShareModal'
import { Header } from '@/components/Header'
import {
  ArrowLeft,
  Clock,
  User as UserIcon,
  MapPin,
  Share2,
} from 'lucide-react'
import { Image } from '@/components/Image'
import { NewsArticle } from '@/api/news'
import { useState } from 'react'
import type { User } from '@/types/user'

interface ArticleDetailProps {
  article: NewsArticle
  onBack: () => void
  onTrustScoreClick: (score: number, explanation: string, headline: string) => void
  user: User | null
  authLoading?: boolean
  onSignIn: () => void
  onSignOut: () => void
}

export function ArticleDetail({ article, onBack, onTrustScoreClick, user, authLoading, onSignIn, onSignOut }: ArticleDetailProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
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
      <Header user={user} authLoading={authLoading} onSignIn={onSignIn} onSignOut={onSignOut} />

      {/* Back Button */}
      <div className="container mx-auto px-6 pt-20 pb-4">
        <Button
          variant="ghost"
          className="text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Article Header */}
            <div className="mb-6">
              <div className="mb-4">
                <CategoryBadge category={article.category} showHashtag={true} />
              </div>
              <h1 className="text-4xl font-bold mb-4">{article.headline}</h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-6">
                {article.author && (
                  <div className="flex items-center">
                    <UserIcon className="w-3 h-3 mr-1" />
                    {article.author}
                  </div>
                )}
                {article.location && (
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {article.location}
                  </div>
                )}
                {article.publishedAt && (
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
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
              {article.description && (
                <p className="text-xl text-gray-300 mb-6">{article.description}</p>
              )}
              {article.content && (
                <div className="whitespace-pre-wrap text-gray-400">{article.content}</div>
              )}
            </div>

            {/* Share Section */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Share this article</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShareModalOpen(true)}
                  className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/90 hover:border-gray-600/50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Credibility Score Card */}
              <Card className="bg-card border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Credibility Score</span>
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Source Reliability</p>
                      <p className="text-gray-500">
                        {article.detailedAnalysis?.sourceReliability || '--'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Factual Accuracy</p>
                      <p className="text-gray-500">
                        {article.detailedAnalysis?.factualAccuracy || '--'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Bias Indicators</p>
                      <p className="text-gray-500">
                        {article.detailedAnalysis?.biasIndicators || '--'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Sources Verified</p>
                      <p className="text-gray-500">{article.sourcesVerified || '--'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Details Card */}
              <Card className="bg-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {article.flags && article.flags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Findings</h4>
                      <ul className="space-y-2">
                        {article.flags.map((flag, index) => (
                          <li key={index} className="text-sm text-gray-500 flex items-start">
                            <div className="w-1.5 h-1.5 bg-[#0066FF] rounded-full mr-2 mt-2 flex-shrink-0" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {article.detailedAnalysis?.recommendation && (
                    <>
                      <Separator className="my-4 bg-gray-700" />
                      <div>
                        <h4 className="font-medium mb-2">Recommendation</h4>
                        <p className="text-sm text-gray-500">
                          {article.detailedAnalysis.recommendation}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Methodology Card */}
              <Card className="bg-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Methodology</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-medium mb-1">Source Verification</h5>
                    <p className="text-gray-500">
                      Cross-referenced with {article.sourcesVerified || 0} independent sources including government databases, academic papers, and verified news outlets.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium mb-1">Bias Detection</h5>
                    <p className="text-gray-500">
                      AI analysis of language patterns, fact-checking against known databases, and sentiment analysis.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium mb-1">Credibility Scoring</h5>
                    <p className="text-gray-500">
                      Composite score based on source reliability, factual accuracy, and bias indicators using ProofMark's proprietary algorithm.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={article.headline}
      />
    </div>
  )
}
