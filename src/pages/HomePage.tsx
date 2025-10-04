import { useState, useCallback, useEffect } from 'react'
import { Header } from '@/components/Header'
import { VideoPlayer } from '@/components/VideoPlayer'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { NewsFeed } from '@/modules/NewsFeed'
import { CredibilityChecker } from '@/modules/CredibilityChecker'
import { DetailedAnalysisModal } from '@/modules/DetailedAnalysisModal'
import { SignUpModal } from '@/modules/SignUpModal'
import { TrustScoreModal } from '@/modules/TrustScoreModal'
import { Logo } from '@/components/Logo'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from 'react-router-dom'
import { useModal } from '@/hooks/useModal'
import { TrustScoreModalData, DetailedAnalysisModalData } from '@/types/modal'
import type { User } from '@/types/user'
import { getCurrentUser, onAuthStateChange, signInWithGoogle, signOut } from '@/api/auth'

export function HomePage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)

  const detailedAnalysisModal = useModal<DetailedAnalysisModalData>({
    newsId: '',
    headline: '',
  })

  const trustScoreModal = useModal<TrustScoreModalData>({
    score: 0,
    explanation: '',
    headline: '',
  })

  const handleNewsCardClick = useCallback(
    (newsId: string) => {
      navigate(`/article/${newsId}`)
    },
    [navigate]
  )

  const handleDetailedAnalysis = useCallback(
    (newsId: string, headline: string) => {
      detailedAnalysisModal.open({ newsId, headline })
    },
    [detailedAnalysisModal]
  )

  const handleDeepResearchToggle = useCallback(() => {
    setSignUpModalOpen(true)
  }, [])

  const handleTrustScoreClick = useCallback(
    (score: number, explanation: string, headline: string) => {
      trustScoreModal.open({ score, explanation, headline })
    },
    [trustScoreModal]
  )

  useEffect(() => {
    getCurrentUser().then(setUser)
    const unsubscribe = onAuthStateChange(setUser)
    return unsubscribe
  }, [])

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
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [])

  const handleCloseSignUpModal = useCallback(() => {
    setSignUpModalOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        user={user}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="pt-20">
        <section className="relative w-full py-16 text-center overflow-hidden">
          <AnimatedBackground />
          <div className="relative z-10 container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Proof Your News with AI
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Advanced artificial intelligence analyzes news credibility in
                  real-time, helping you make informed decisions in our
                  information-rich world.
                </p>
              </div>

              <VideoPlayer />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16">
          <CredibilityChecker
            onDeepResearchToggle={handleDeepResearchToggle}
            onTrustScoreClick={handleTrustScoreClick}
          />
        </section>

        <section className="container mx-auto px-6 py-16">
          <NewsFeed
            onNewsCardClick={handleNewsCardClick}
            onDetailedAnalysis={handleDetailedAnalysis}
            onTrustScoreClick={handleTrustScoreClick}
          />
        </section>

        <footer className="border-t border-gray-700 bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Logo />
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  AI-powered news credibility verification for the modern world.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-200">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">How it Works</li>
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">API Access</li>
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">Pricing</li>
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">Enterprise</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-200">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">About Us</li>
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">Careers</li>
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">Press</li>
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">Contact</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-200">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">Documentation</li>
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">Research</li>
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">Blog</li>
                  <li className="hover:text-gray-200 cursor-pointer transition-colors">Support</li>
                </ul>
              </div>
            </div>

            <Separator className="my-6 bg-gray-700" />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2025 ProofMark. All rights reserved.
              </p>
              <div className="flex gap-8 text-sm text-gray-400">
                <span className="hover:text-gray-200 cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-gray-200 cursor-pointer transition-colors">Terms of Service</span>
                <span className="hover:text-gray-200 cursor-pointer transition-colors">Cookie Policy</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <DetailedAnalysisModal
        isOpen={detailedAnalysisModal.state.isOpen}
        onClose={detailedAnalysisModal.close}
        newsHeadline={detailedAnalysisModal.state.data.headline}
      />

      <SignUpModal isOpen={signUpModalOpen} onClose={handleCloseSignUpModal} />

      <TrustScoreModal
        isOpen={trustScoreModal.state.isOpen}
        onClose={trustScoreModal.close}
        score={trustScoreModal.state.data.score}
        explanation={trustScoreModal.state.data.explanation}
        newsHeadline={trustScoreModal.state.data.headline}
      />
    </div>
  )
}
