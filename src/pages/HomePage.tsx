import { useState } from 'react'
import { Header } from '@/components/Header'
import { VideoPlayer } from '@/components/VideoPlayer'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { NewsFeed } from '@/modules/NewsFeed'
import { CredibilityChecker } from '@/modules/CredibilityChecker'
import { DetailedAnalysisModal } from '@/modules/DetailedAnalysisModal'
import { SignUpModal } from '@/modules/SignUpModal'
import { TrustScoreModal } from '@/modules/TrustScoreModal'
import { Logo } from '@/components/Logo'
import { useNavigate } from 'react-router-dom'

interface User {
  isSignedIn: boolean
  name: string
  email: string
  avatar: string
}

export function HomePage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<User>({
    isSignedIn: false,
    name: '',
    email: '',
    avatar: '',
  })

  const [detailedAnalysisModal, setDetailedAnalysisModal] = useState<{
    isOpen: boolean
    newsId: string
    headline: string
  }>({
    isOpen: false,
    newsId: '',
    headline: '',
  })

  const [signUpModalOpen, setSignUpModalOpen] = useState(false)

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

  const handleNewsCardClick = (newsId: string) => {
    navigate(`/article/${newsId}`)
  }

  const handleDetailedAnalysis = (newsId: string, headline: string) => {
    setDetailedAnalysisModal({
      isOpen: true,
      newsId,
      headline,
    })
  }

  const handleCloseDetailedAnalysis = () => {
    setDetailedAnalysisModal({
      isOpen: false,
      newsId: '',
      headline: '',
    })
  }

  const handleDeepResearchToggle = () => {
    setSignUpModalOpen(true)
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

  const handleGoogleSignIn = () => {
    setUser({
      isSignedIn: true,
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    })
  }

  const handleSignOut = () => {
    setUser({
      isSignedIn: false,
      name: '',
      email: '',
      avatar: '',
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
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

        <footer className="border-t border-border bg-card/50">
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Logo />
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered news credibility verification for the modern world.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>How it Works</li>
                  <li>API Access</li>
                  <li>Pricing</li>
                  <li>Enterprise</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>About Us</li>
                  <li>Careers</li>
                  <li>Press</li>
                  <li>Contact</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Documentation</li>
                  <li>Research</li>
                  <li>Blog</li>
                  <li>Support</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © 2025 ProofMark. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Cookie Policy</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <DetailedAnalysisModal
        isOpen={detailedAnalysisModal.isOpen}
        onClose={handleCloseDetailedAnalysis}
        newsHeadline={detailedAnalysisModal.headline}
      />

      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
      />

      <TrustScoreModal
        isOpen={trustScoreModal.isOpen}
        onClose={handleCloseTrustScore}
        score={trustScoreModal.score}
        explanation={trustScoreModal.explanation}
        newsHeadline={trustScoreModal.headline}
      />
    </div>
  )
}
