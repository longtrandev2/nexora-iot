import { useEffect, useState } from 'react'
import { toast } from './toast'

const COPIED_FEEDBACK_MS = 1500

/** Icon button copying `text` to the clipboard (e.g. a table timestamp to paste into the search box). */
export function CopyTextButton({ text, label = 'Sao chép' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    return () => clearTimeout(id)
  }, [copied])

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      toast('Không sao chép được, hãy bôi đen và copy thủ công', 'error')
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Đã sao chép' : `${label}: ${text}`}
      aria-label={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-primary/10 ${
        copied ? 'text-[#10B981]' : 'text-outline hover:text-primary'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
    </button>
  )
}
