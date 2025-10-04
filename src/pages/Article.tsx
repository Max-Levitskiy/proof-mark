import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArticleDetail } from '@/modules/ArticleDetail'
import { TrustScoreModal } from '@/modules/TrustScoreModal'
import { Loader } from '@/components/Loader'
import { fetchNewsById, NewsArticle } from '@/api/news'

export function Article() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [trustScoreModal, setTrustScoreModal] = useState<{
    isOpen: boolean
    score: number
    explanation: string
    headline: string
  }>({
    isOpen: false,
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

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleTrustScoreClick = (
    score: number,
    explanation: string,
    headline: string
  ) => {
    setTrustScoreModal({
      isOpen: true,
      score,
      explanation,
      headline,
    })
  }

  const handleCloseTrustScore = () => {
    setTrustScoreModal({
      isOpen: false,
      score: 0,
      explanation: '',
      headline: '',
    })
  }

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
        isOpen={trustScoreModal.isOpen}
        onClose={handleCloseTrustScore}
        score={trustScoreModal.score}
        explanation={trustScoreModal.explanation}
        newsHeadline={trustScoreModal.headline}
      />
    </>
  )
}
