import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  RedditShareButton,
  FacebookIcon,
  XIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
} from 'react-share'
import { Check, Copy, X } from 'lucide-react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-800 [&>button]:text-gray-400 [&>button:hover]:text-gray-100 [&>button]:opacity-100 [&>button]:focus:ring-gray-600 [&>button]:ring-offset-gray-900 [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Share Article</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:justify-center gap-3">
            <TelegramShareButton url={url} title={title}>
              <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <TelegramIcon size={48} round />
                <span className="text-xs text-gray-400">Telegram</span>
              </div>
            </TelegramShareButton>

            <WhatsappShareButton url={url} title={title}>
              <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <WhatsappIcon size={48} round />
                <span className="text-xs text-gray-400">WhatsApp</span>
              </div>
            </WhatsappShareButton>

            <TwitterShareButton url={url} title={title}>
              <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <XIcon size={48} round />
                <span className="text-xs text-gray-400">X</span>
              </div>
            </TwitterShareButton>

            <FacebookShareButton url={url} hashtag="#ProofMark">
              <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <FacebookIcon size={48} round />
                <span className="text-xs text-gray-400">Facebook</span>
              </div>
            </FacebookShareButton>

            <RedditShareButton url={url} title={title}>
              <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <RedditIcon size={48} round />
                <span className="text-xs text-gray-400">Reddit</span>
              </div>
            </RedditShareButton>

            <LinkedinShareButton url={url} title={title}>
              <div className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <LinkedinIcon size={48} round />
                <span className="text-xs text-gray-400">LinkedIn</span>
              </div>
            </LinkedinShareButton>
          </div>

          <Separator className="my-4 bg-gray-800" />

          {/* Copy Link */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-300">Or copy link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-700 rounded-md bg-gray-800 text-gray-300"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 border-gray-700 h-[38px] ${copied ? 'text-green-500 hover:text-green-400' : 'text-gray-300'}`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} />
}
