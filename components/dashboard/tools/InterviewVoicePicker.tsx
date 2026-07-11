'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDashboardUser } from '@/components/dashboard/DashboardUserContext'
import {
  DEFAULT_INTERVIEW_VOICE_ID,
  INTERVIEW_VOICE_STORAGE_KEY,
  INTERVIEW_VOICES,
  interviewVoicePreviewLine,
  isInterviewVoiceId,
  REMOVED_INTERVIEW_VOICE_IDS,
  type InterviewVoiceId,
} from '@/lib/tools/dashboard/interview-voices'

type Props = {
  value: InterviewVoiceId
  onChange: (id: InterviewVoiceId) => void
}

export function useInterviewVoicePreference() {
  const [voiceId, setVoiceId] = useState<InterviewVoiceId>(DEFAULT_INTERVIEW_VOICE_ID)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(INTERVIEW_VOICE_STORAGE_KEY)
      if (saved && REMOVED_INTERVIEW_VOICE_IDS.has(saved)) {
        localStorage.setItem(INTERVIEW_VOICE_STORAGE_KEY, DEFAULT_INTERVIEW_VOICE_ID)
        setVoiceId(DEFAULT_INTERVIEW_VOICE_ID)
      } else if (saved && isInterviewVoiceId(saved)) setVoiceId(saved)
    } catch {
      /* ignore */
    }
  }, [])

  const setPreference = (id: InterviewVoiceId) => {
    setVoiceId(id)
    try {
      localStorage.setItem(INTERVIEW_VOICE_STORAGE_KEY, id)
    } catch {
      /* ignore */
    }
  }

  return { voiceId, setVoiceId: setPreference }
}

export function InterviewVoicePicker({ value, onChange }: Props) {
  const { name } = useDashboardUser()
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previewLine = interviewVoicePreviewLine(name)

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      URL.revokeObjectURL(audioRef.current.src)
      audioRef.current = null
    }
    setPreviewingId(null)
  }, [])

  const playPreview = useCallback(
    async (voiceId: InterviewVoiceId) => {
      if (previewingId === voiceId) {
        stopPreview()
        return
      }

      stopPreview()
      setPreviewingId(voiceId)
      setPreviewError('')

      try {
        const res = await fetch('/api/tools/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: previewLine, voiceId }),
        })

        if (!res.ok || !res.headers.get('content-type')?.includes('audio')) {
          const errBody = (await res.json().catch(() => null)) as { error?: string } | null
          setPreviewingId(null)
          setPreviewError(
            errBody?.error?.includes('Invalid ElevenLabs API key')
              ? 'ElevenLabs API key is invalid. Update ELEVENLABS_API_KEY in Vercel → Settings → Environment Variables.'
              : errBody?.error || 'Voice preview failed — check ElevenLabs configuration.',
          )
          return
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => {
          URL.revokeObjectURL(url)
          audioRef.current = null
          setPreviewingId(null)
        }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          audioRef.current = null
          setPreviewingId(null)
        }
        await audio.play()
      } catch {
        setPreviewingId(null)
        setPreviewError('Could not play voice preview.')
      }
    },
    [previewLine, previewingId, stopPreview],
  )

  useEffect(() => () => stopPreview(), [stopPreview])

  const selected = INTERVIEW_VOICES.find((v) => v.id === value)

  return (
    <div>
      <span className="dash-tools-label">Interviewer voice</span>
      <p className="dash-tools-hint mt-1 mb-3">
        Tap a voice to select · ▶ hears: &ldquo;{previewLine}&rdquo;
      </p>
      <div className="dash-tools-voice-grid">
        {INTERVIEW_VOICES.map((v) => {
          const active = value === v.id
          const playing = previewingId === v.id
          return (
            <div
              key={v.id}
              className={`dash-tools-voice-card ${active ? 'dash-tools-voice-card--active' : ''}`}
            >
              <button
                type="button"
                className="dash-tools-voice-card__select"
                onClick={() => onChange(v.id)}
              >
                <span className="dash-tools-voice-card__name">{v.label}</span>
                <span className={`dash-tools-voice-card__gender dash-tools-voice-card__gender--${v.gender}`}>
                  {v.gender === 'female' ? 'Female' : 'Male'}
                </span>
                <span className="dash-tools-voice-card__hint">{v.hint}</span>
              </button>
              <button
                type="button"
                className={`dash-tools-voice-card__demo ${playing ? 'dash-tools-voice-card__demo--playing' : ''}`}
                onClick={() => void playPreview(v.id)}
                aria-label={`Preview ${v.label}`}
                title="Play demo"
              >
                {playing ? '⏹' : '▶'}
              </button>
            </div>
          )
        })}
      </div>
      {selected && (
        <p className="dash-tools-hint mt-2">
          Selected: <strong>{selected.label}</strong> ({selected.gender === 'female' ? 'Female' : 'Male'})
        </p>
      )}
      {previewError && <p className="dash-tools-error mt-2">{previewError}</p>}
    </div>
  )
}
