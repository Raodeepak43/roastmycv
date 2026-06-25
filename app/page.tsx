'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const SITE_URL = 'https://roastmycv-coral.vercel.app'
const FREE_LIMIT = 5
const STORAGE_KEY = 'rcv_uses_left'
const NAME_KEY = 'rcv_display_name'
const STATS_SEED = 1250

const LOADING_MSGS = [
  '📖 Teri CV padh raha hai...',
  '🔍 Recruiter mode on...',
  '💀 Roast ready ho raha hai...',
  '⚡ Bas 2 second...',
]

const TICKER_ITEMS = [
  '🔥 ZERO SYMPATHY', '⚡ RECRUITER KI NAZAR', '💀 TERI CV NEXT',
  '🤖 AI NEVER LIES', '🚑 BURNOL KE LIYE READY', '😤 SAVAGE MODE ON',
  '🎯 NO SUGARCOATING', '🇮🇳 DESI ROAST',
]

const FIXES = [
  'Fix formatting — ATS ke liye',
  'Add numbers and metrics',
  'Write original content',
]

const FAQ = [
  { q: 'Resume roast kya hota hai?', a: 'AI tumhara resume padh ke brutally honest feedback deta hai.' },
  { q: 'Kya ye free hai?', a: 'Haan, 5 roasts free hain. Uske baad ₹49 mein unlimited.' },
  { q: 'Mera resume safe hai?', a: 'Haan, hum kuch save nahi karte. Process ke baad delete.' },
]

const INTENSITY_TABS: { id: Intensity; label: string; desc: string }[] = [
  { id: 'clean', label: '😇 Clean', desc: 'Professional roast. No gaali. Sharp aur fair.' },
  { id: 'gaali_light', label: '😤 Gaali Light', desc: 'Thodi garam. Dost wali roast. Mild gaali.' },
  { id: 'savage', label: '💀 Savage', desc: 'Koi mercy nahi. Bilkul seedha.' },
]

type Intensity = 'clean' | 'gaali_light' | 'savage'

interface RoastResult {
  lines: string[]
  score: number
  intensity: Intensity
}

function computeScore(intensity: Intensity, lines: string[]): number {
  const base = { clean: 6, gaali_light: 4, savage: 2 }[intensity]
  return Math.min(10, Math.max(1, base + (lines.join('').length % 4)))
}

function getScoreEmoji(score: number) {
  if (score <= 3) return '💀'
  if (score <= 5) return '😬'
  if (score <= 7) return '😐'
  if (score <= 9) return '😎'
  return '🏆'
}

function getScoreColor(score: number) {
  if (score < 4) return '#EF4444'
  if (score <= 6) return '#F5C542'
  if (score <= 8) return '#FF4500'
  return '#22C55E'
}

function getScoreLabel(score: number) {
  if (score <= 3) return 'Yaar seedha ghar ja 💀'
  if (score <= 5) return 'Average jugaad CV 😬'
  if (score <= 7) return 'Theek hai, better ho sakta 😐'
  if (score <= 9) return 'Solid hai tera resume 😎'
  return 'Bhai tu toh set hai 🏆'
}

function getFullRoastText(result: RoastResult) {
  return result.lines.map((line, i) => `${String(i + 1).padStart(2, '0')}. ${line}`).join('\n')
}

function getShareText(result: RoastResult) {
  const verdict = result.lines[result.lines.length - 1]
  return `🔥 Mera resume AI ne roast kiya — ${result.score}/10\n'${verdict}'\n👉 ${SITE_URL}`
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Server ne sahi response nahi diya — page refresh karo aur dobara try karo')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Kuch gadbad ho gayi, dobara try karo')
  return data as T
}

function parseStreamingLines(buffer: string): string[] {
  const cleaned = buffer.replace(/```[\s\S]*?```/g, '').trim()
  const numbered = Array.from(cleaned.matchAll(/(?:^|\n)\s*(\d{1,2})\.\s*(.+)/g))
    .sort((a, b) => parseInt(a[1], 10) - parseInt(b[1], 10))
    .map((m) => m[2].trim())
    .filter(Boolean)
  if (numbered.length > 0) return numbered
  return cleaned.split('\n').map((l) => l.replace(/^\s*\d{1,2}\.\s*/, '').trim()).filter((l) => l.length > 10)
}

async function streamRoast(resumeText: string, intensity: Intensity, onLine: (lines: string[]) => void): Promise<string[]> {
  const res = await fetch('/api/roast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, intensity }),
  })
  if (!res.ok) {
    const text = await res.text()
    try {
      const err = JSON.parse(text) as { error?: string }
      throw new Error(err.error ?? 'Kuch gadbad ho gayi, dobara try karo')
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error('Server error — page refresh karo aur dobara try karo')
      throw e
    }
  }
  if (!res.body) throw new Error('Kuch gadbad ho gayi, dobara try karo')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const partial = parseStreamingLines(buffer)
    if (partial.length > 0) onLine(partial)
  }
  buffer += decoder.decode()
  if (buffer.includes('ERROR:')) throw new Error(buffer.split('ERROR:')[1]?.trim() || 'Roast fail ho gaya')
  const lines = parseStreamingLines(buffer)
  if (lines.length < 6) throw new Error('AI ne poora roast nahi diya — dobara try karo')
  return lines.slice(0, 12)
}

function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.round(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return val
}

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF4500" strokeWidth="1.5" className="mx-auto mb-3">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function CompactScoreRow({ score }: { score: number }) {
  const animated = useCountUp(score)
  return (
    <div className="flex items-center gap-3 py-4 border-b border-[#1A1A1A]">
      <span className="text-[32px] leading-none shrink-0">{getScoreEmoji(score)}</span>
      <span className="font-display text-[48px] leading-none shrink-0" style={{ color: getScoreColor(score) }}>
        {animated}<span className="text-xl text-muted">/10</span>
      </span>
      <span className="font-body text-[12px] text-[#444444] leading-snug flex-1 min-w-0">
        {getScoreLabel(score)}
      </span>
    </div>
  )
}

function ShareButtons({ result, copied, onCopy }: { result: RoastResult; copied: boolean; onCopy: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button type="button" onClick={onCopy}
        className="font-body text-[13px] py-2.5 rounded-[10px] border border-border text-white hover:border-white transition-colors">
        {copied ? '✅ Copied' : '📋 Copy'}
      </button>
      <button type="button" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`, '_blank')}
        className="font-body text-[13px] py-2.5 rounded-[10px] border border-[#0077B5] text-[#0077B5]">💼 LinkedIn</button>
      <button type="button" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(result))}`, '_blank')}
        className="font-body text-[13px] py-2.5 rounded-[10px] border border-[#1DA1F2] text-[#1DA1F2]">🐦 Twitter</button>
    </div>
  )
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadMsgIdx, setLoadMsgIdx] = useState(0)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState('')
  const [intensity, setIntensity] = useState<Intensity>('gaali_light')
  const [roastCount, setRoastCount] = useState(STATS_SEED)
  const [usesLeft, setUsesLeft] = useState(FREE_LIMIT)
  const [showPaywall, setShowPaywall] = useState(false)
  const [copied, setCopied] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [uploadHighlight, setUploadHighlight] = useState(false)
  const [roastExpanded, setRoastExpanded] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)
  const [tickerNames, setTickerNames] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUsesLeft(parseInt(localStorage.getItem(STORAGE_KEY) || String(FREE_LIMIT), 10))
    setSignupName(localStorage.getItem(NAME_KEY) || '')
    const fetchStats = () => {
      fetch('/api/stats').then((r) => r.json()).then((d) => setRoastCount(d.count ?? 0)).catch(() => {})
    }
    const fetchTicker = () => {
      fetch('/api/signups').then((r) => r.json()).then((d) => setTickerNames(d.items ?? [])).catch(() => {})
    }
    fetchStats()
    fetchTicker()
    const interval = setInterval(() => { fetchStats(); fetchTicker() }, 30000)
    return () => clearInterval(interval)
  }, [])

  const postTickerName = (name: string, score?: number) => {
    fetch('/api/signups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.items) setTickerNames(d.items) })
      .catch(() => {})
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = signupName.trim()
    if (name.length < 2) { setSignupError('Apna naam daal yaar'); return }
    setSignupLoading(true)
    setSignupError('')
    try {
      localStorage.setItem(NAME_KEY, name)
      if (signupEmail.trim()) localStorage.setItem('rcv_email', signupEmail.trim())
      await fetchJson<{ items: string[] }>('/api/signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }).then((d) => setTickerNames(d.items))
      setShowSignup(false)
    } catch (err: unknown) {
      setSignupError(err instanceof Error ? err.message : 'Signup fail ho gaya')
    } finally {
      setSignupLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setLoadMsgIdx((i) => (i + 1) % LOADING_MSGS.length), 1500)
    return () => clearInterval(t)
  }, [loading])

  const handleFile = (f: File) => {
    if (!f.name.match(/\.(pdf|txt)$/i)) { setError('PDF ya TXT file upload karo yaar'); return }
    if (f.size > 5 * 1024 * 1024) { setError('File 5MB se choti honi chahiye'); return }
    setFile(f); setError(''); setResult(null); setUploadHighlight(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const reset = () => {
    setResult(null); setFile(null); setError(''); setRoastExpanded(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyShare = () => {
    if (!result) return
    navigator.clipboard.writeText(getShareText(result))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRoast = async () => {
    if (!file) {
      setError('Pehle CV upload karo!')
      setUploadHighlight(true)
      setTimeout(() => setUploadHighlight(false), 2000)
      return
    }
    if (usesLeft <= 0) { setShowPaywall(true); return }
    setLoading(true); setLoadMsgIdx(0); setResult(null); setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const parseData = await fetchJson<{ text: string }>('/api/parse', { method: 'POST', body: formData })
      const lines = await streamRoast(parseData.text, intensity, () => {})
      const score = computeScore(intensity, lines)
      const newUses = usesLeft - 1
      setUsesLeft(newUses)
      localStorage.setItem(STORAGE_KEY, String(newUses))
      fetch('/api/stats', { method: 'POST' }).then((r) => r.json()).then((d) => setRoastCount(d.count ?? roastCount + 1)).catch(() => {})
      setResult({ lines, score, intensity })
      setRoastExpanded(false)
      const displayName = localStorage.getItem(NAME_KEY)
      if (displayName) {
        postTickerName(displayName, score)
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kuch gadbad ho gayi, dobara try karo')
    } finally { setLoading(false) }
  }

  const activeDesc = INTENSITY_TABS.find((t) => t.id === intensity)?.desc ?? ''
  const tickerItems = [...tickerNames, ...TICKER_ITEMS]

  return (
    <main className="min-h-screen flex flex-col bg-page w-full">
      {/* Header — full width */}
      <header className="w-full border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          {result ? (
            <button
              type="button"
              onClick={reset}
              className="font-body text-[13px] text-[#888888] hover:text-white transition-colors"
            >
              ← Try Again
            </button>
          ) : (
            <a href="/" className="font-display text-lg md:text-xl text-white hover:text-orange transition-colors" aria-label="RoastMyCV home">
              🔥 RoastMyCV
            </a>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSignup(true)}
              className="font-body text-[11px] text-white border border-border px-2.5 py-1 rounded-full hover:border-orange hover:text-orange transition-colors"
              aria-label="Join newsletter"
            >
              📬 Join
            </button>
            <span
              className="font-body text-xs text-orange border border-orange px-3 py-1 rounded-full cursor-default"
              title={`You have ${usesLeft} free roast${usesLeft === 1 ? '' : 's'} remaining`}
              aria-label={`${usesLeft} free roasts remaining`}
            >
              {usesLeft} roasts free
            </span>
          </div>
        </div>
        <div className="w-full bg-card border-t border-border overflow-hidden py-2">
          <div className="ticker-track font-body text-[11px] text-white whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="mx-5">
                <span className="text-orange mr-1.5">·</span>{item}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className={`flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 ${result ? 'py-4 pb-24 md:py-6 md:pb-6' : 'py-6 md:py-10'}`}>
        {!result ? (
          <>
            <div className="max-w-xl mx-auto w-full">
              {/* Hero */}
              <section className="text-center mb-8">
                <p className="font-body text-[11px] text-muted tracking-[0.1em] mb-4">
                  🤖 AI-POWERED · ⚡ INSTANT · 🆓 FREE
                </p>
                <h1 className="font-display leading-[0.95] mb-4">
                  <span className="block text-4xl sm:text-5xl md:text-6xl text-white whitespace-nowrap">
                    Tera Resume
                  </span>
                  <span className="block text-4xl sm:text-5xl md:text-6xl text-orange whitespace-nowrap">
                    Ek Mazaak Hai.
                  </span>
                </h1>
                <h2 className="font-body text-sm md:text-base text-muted">
                  AI batayega sach. Recruiter wala sach.
                </h2>
                <p className="font-body text-[13px] text-white mt-4">
                  🔥 {roastCount.toLocaleString('en-US')} resumes already destroyed
                </p>
              </section>

              {/* Upload + controls */}
              <section>
                <div
                  className={`upload-card p-5 md:p-8 text-center cursor-pointer mb-4 ${dragging ? 'dragover' : ''} ${uploadHighlight ? 'upload-error' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload your resume — PDF or TXT, max 5MB"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
                >
                  <input
                    ref={fileInputRef}
                    id="resume-upload"
                    name="resume"
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    aria-label="Choose resume file"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  {file ? (
                    <>
                      <p className="text-4xl mb-2">✅</p>
                      <p className="font-display text-lg text-orange mb-1 truncate px-2">{file.name}</p>
                      <p className="font-body text-[13px] text-muted">Ready to roast 🔥</p>
                    </>
                  ) : (
                    <>
                      <UploadIcon />
                      <p className="font-display text-xl md:text-2xl text-white mb-1">Drop your resume here</p>
                      <p className="font-body text-[13px] text-muted">or click to upload</p>
                      <p className="font-body text-[11px] text-[#333333] mt-1">PDF or TXT · Max 5MB</p>
                    </>
                  )}
                </div>

                <div className="flex gap-2 mb-2">
                  {INTENSITY_TABS.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => setIntensity(tab.id)}
                      aria-label={`${tab.label} roast mode`}
                      aria-pressed={intensity === tab.id}
                      className={`flex-1 font-body text-[12px] md:text-[13px] py-2 md:py-2.5 px-1.5 md:px-2 rounded-xl border transition-all ${
                        intensity === tab.id
                          ? 'bg-orange border-orange text-black font-medium'
                          : 'bg-card border-border text-muted'
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                <p className="font-body text-xs text-muted text-center mb-4">{activeDesc}</p>

                {error && (
                  <div className="card-ui p-3 mb-3 font-body text-sm text-red-400 border-red-500/30">{error}</div>
                )}

                {loading ? (
                  <div className="btn-roast w-full py-3.5 md:py-4 flex items-center justify-center gap-3 opacity-90 text-base">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full spinner" />
                    <span className="font-body text-sm">{LOADING_MSGS[loadMsgIdx]}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRoast}
                    aria-label="Roast my resume"
                    className="btn-roast w-full py-3.5 md:py-4 text-base md:text-lg">
                    🔥 Roast Kar Mere Resume Ko
                  </button>
                )}
              </section>
            </div>
          </>
        ) : (
          <>
            <div ref={resultRef} className="fade-up max-w-[600px] mx-auto card-ui px-4 md:px-5">
              <CompactScoreRow score={result.score} />

              <div className="py-3 border-b border-[#1A1A1A]">
                <p className="font-body text-[10px] text-muted uppercase mb-1">🎯 AI KA VERDICT</p>
                <p className="font-display text-base text-white leading-snug line-clamp-2">
                  &ldquo;{result.lines[0]}&rdquo;
                </p>
              </div>

              <div className="py-3 border-b border-[#1A1A1A]">
                <p className="font-body text-[10px] text-muted uppercase mb-2">🔥 THE ROAST</p>
                {(roastExpanded ? result.lines : result.lines.slice(0, 4)).map((line, i) => (
                  <div key={i} className="flex gap-2 py-1">
                    <span className="font-body text-[11px] text-orange shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-body text-[13px] text-[#CCCCCC] leading-[1.4]">{line}</span>
                  </div>
                ))}
                {!roastExpanded && result.lines.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setRoastExpanded(true)}
                    className="font-body text-[13px] text-orange mt-2 hover:text-white transition-colors"
                  >
                    Poora Roast Dekh 👇
                  </button>
                )}
              </div>

              <div className="py-3 border-b border-[#1A1A1A]">
                <p className="font-body text-[14px] text-gold leading-[1.4]">
                  ⚡ &ldquo;{result.lines[result.lines.length - 1]}&rdquo;
                </p>
              </div>

              <div className="py-2">
                <p className="font-body text-[10px] text-muted uppercase mb-1">✅ AB KYA KAR</p>
                {FIXES.map((fix, i) => (
                  <p key={i} className="font-body text-[13px] text-white leading-[1.4] py-2">
                    {i + 1}. {fix}
                  </p>
                ))}
              </div>

              <div className="hidden md:block py-4 border-t border-[#1A1A1A]">
                <p className="font-body text-[10px] text-muted uppercase mb-3">📤 DOSTO KO JALAO BHI</p>
                <div className="bg-page border border-border rounded-xl p-4 mb-4 font-body text-[14px] text-white whitespace-pre-wrap min-h-[100px] leading-[1.4]">
                  {getShareText(result)}
                </div>
                <ShareButtons result={result} copied={copied} onCopy={copyShare} />
              </div>
            </div>

            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-page border-t border-[#1A1A1A] px-4 py-3">
              <div className="max-w-[600px] mx-auto">
                <ShareButtons result={result} copied={copied} onCopy={copyShare} />
              </div>
            </div>
          </>
        )}

        {!result && (
          <>
            <div className="card-ui grid grid-cols-2 md:grid-cols-4 gap-0 mt-8 md:mt-10 max-w-4xl mx-auto divide-x divide-y md:divide-y-0 divide-border">
              {[
                { val: roastCount.toLocaleString('en-US'), color: 'text-orange', label: '🔥 ROASTED' },
                { val: String(INTENSITY_TABS.length), color: 'text-purple', label: '🎚️ ROAST MODES' },
                { val: '0', color: 'text-white', label: '😇 MERCY GIVEN' },
                { val: '∞', color: 'text-gold', label: '⚡ EMOTIONAL DMG' },
              ].map((s) => (
                <div key={s.label} className="py-4 md:py-5 text-center px-2">
                  <p className={`font-display text-3xl md:text-[40px] leading-none ${s.color}`}>{s.val}</p>
                  <p className="font-body text-[10px] md:text-[11px] text-muted uppercase tracking-[0.1em] mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>

            <section className="mt-8 md:mt-10 mb-2 max-w-xl mx-auto" aria-label="FAQ">
              {FAQ.map((item, i) => (
                <div key={i} className="border-b border-[#1A1A1A]">
                  <button type="button" onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    aria-expanded={faqOpen === i}
                    aria-label={`FAQ: ${item.q}`}
                    className="w-full text-left py-2 font-body text-[12px] text-[#555555] hover:text-[#888888] transition-colors flex justify-between items-center">
                    {item.q}
                    <span className="text-[#555555] ml-2 text-xs">{faqOpen === i ? '−' : '+'}</span>
                  </button>
                  {faqOpen === i && (
                    <p className="font-body text-[12px] text-[#555555] pb-2 leading-relaxed">{item.a}</p>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
      </div>

      {/* Footer — full width */}
      <footer className="w-full bg-page border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a href={SITE_URL} className="font-body text-[13px] text-white hover:text-orange transition-colors" aria-label="Visit RoastMyCV">
            🔥 roastmycv-coral.vercel.app
          </a>
          <p className="font-body text-[11px] text-[#333333] text-center">
            No account needed · Built by a desi founder
          </p>
        </div>
      </footer>

      {/* Newsletter signup */}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="card-ui p-6 max-w-sm w-full rounded-[20px]">
            <p className="font-display text-xl text-white mb-1">📬 Join the Roast List</p>
            <p className="font-body text-[13px] text-muted mb-5">Naam daal — ticker pe dikhega jab roast hogi 🔥</p>
            <form onSubmit={handleSignup} className="space-y-3">
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Tera naam"
                maxLength={30}
                className="w-full bg-page border border-border rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-[#444444] focus:border-orange outline-none"
                aria-label="Your name"
              />
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="Email (optional — updates ke liye)"
                className="w-full bg-page border border-border rounded-xl px-4 py-3 font-body text-sm text-white placeholder:text-[#444444] focus:border-orange outline-none"
                aria-label="Email optional"
              />
              {signupError && <p className="font-body text-xs text-red-400">{signupError}</p>}
              <button type="submit" disabled={signupLoading} className="btn-roast w-full py-3 text-base">
                {signupLoading ? 'Ho raha hai...' : '🔥 Join Kar'}
              </button>
              <button type="button" onClick={() => setShowSignup(false)} className="w-full font-body text-[13px] text-[#333333] hover:text-muted py-1">
                baad mein
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Paywall */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="card-ui p-8 max-w-sm w-full text-center rounded-[20px]">
            <p className="text-[48px] mb-4">😅</p>
            <h3 className="font-display text-[28px] text-white mb-2">Free Limit Khatam Bhai</h3>
            <p className="font-body text-sm text-muted mb-6">5 free roasts use ho gaye</p>
            <span className="inline-block bg-orange text-black font-body text-[13px] px-4 py-1.5 rounded-full mb-6">
              ₹49 · Lifetime Unlimited
            </span>
            <button className="btn-roast w-full py-3 text-base mb-3 block">🔥 Razorpay se Unlock Kar</button>
            <button onClick={() => setShowPaywall(false)} className="font-body text-[13px] text-[#333333] hover:text-muted">
              baad mein karta hoon
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
