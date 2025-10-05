import { useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArticleDetail } from '@/modules/ArticleDetail'
import { TrustScoreModal } from '@/modules/TrustScoreModal'
import { Loader } from '@/components/Loader'
import { useNewsById } from '@/api/news'
import { useModal } from '@/hooks/useModal'
import { TrustScoreModalData } from '@/types/modal'
import { useAuth } from '@/api/AuthContext'
import { signInWithGoogle, signOut } from '@/api/auth'

export function Article() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const trustScoreModal = useModal<TrustScoreModalData>({
    score: 0,
    confidenceLevel: 0,
    explanation: '',
    headline: '',
  })

  // Fetch article with TanStack Query
  const { data: article, isLoading } = useNewsById(id || '')

  // Redirect to 404 if no ID or article not found
  useEffect(() => {
    if (!id) {
      navigate('/404', { replace: true })
      return
    }

    if (!isLoading && !article) {
      navigate('/404', { replace: true })
    }
  }, [id, article, isLoading, navigate])

  const handleBackToHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleTrustScoreClick = useCallback(
    (score: number, confidenceLevel: number, explanation: string, headline: string) => {
      trustScoreModal.open({ score, confidenceLevel, explanation, headline })
    },
    [trustScoreModal]
  )

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [])

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
        user={user}
        authLoading={authLoading}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      <TrustScoreModal
        isOpen={trustScoreModal.state.isOpen}
        onClose={trustScoreModal.close}
        score={trustScoreModal.state.data.score}
        confidenceLevel={trustScoreModal.state.data.confidenceLevel}
        explanation={trustScoreModal.state.data.explanation}
        newsHeadline={trustScoreModal.state.data.headline}
      />
    </>
  )
}
