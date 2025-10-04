import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArticleDetail } from '@/modules/ArticleDetail'
import { TrustScoreModal } from '@/modules/TrustScoreModal'
import { Loader } from '@/components/Loader'
import { fetchNewsById, NewsArticle } from '@/api/news'
import { useModal } from '@/hooks/useModal'
import { TrustScoreModalData } from '@/types/modal'

export function Article() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const trustScoreModal = useModal<TrustScoreModalData>({
    score: 0,
    explanation: '',
    headline: '',
  })

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) {
        navigate('/')
        return
      }

      setIsLoading(true)
      const data = await fetchNewsById(id)

      if (!data) {
        navigate('/')
        return
      }

      setArticle(data)
      setIsLoading(false)
    }

    loadArticle()
  }, [id, navigate])

  const handleBackToHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleTrustScoreClick = useCallback(
    (score: number, explanation: string, headline: string) => {
      trustScoreModal.open({ score, explanation, headline })
    },
    [trustScoreModal]
  )

  if (isLoading) {
    return <Loader />
  }

  if (!article) {
    return null
  }

  return (
    <>
      <ArticleDetail
        article={article}
        onBack={handleBackToHome}
        onTrustScoreClick={handleTrustScoreClick}
      />

      <TrustScoreModal
        isOpen={trustScoreModal.state.isOpen}
        onClose={trustScoreModal.close}
        score={trustScoreModal.state.data.score}
        explanation={trustScoreModal.state.data.explanation}
        newsHeadline={trustScoreModal.state.data.headline}
      />
    </>
  )
}
