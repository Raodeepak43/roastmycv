'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  speakInterviewText,
  stopInterviewSpeech,
  type SpeakInterviewOptions,
} from '@/lib/tools/dashboard/interview-speech'

export function useInterviewSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [speechWarning, setSpeechWarning] = useState('')
  const busyRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopInterviewSpeech()
      busyRef.current = false
    }
  }, [])

  const stop = useCallback(() => {
    stopInterviewSpeech()
    if (mountedRef.current) {
      setSpeaking(false)
      setLoadingAudio(false)
    }
    busyRef.current = false
  }, [])

  const speak = useCallback(
    async (rawText: string, voiceId?: string, extra?: Pick<SpeakInterviewOptions, 'onStart' | 'onEnd'>) => {
      if (busyRef.current) stop()

      if (!rawText.trim()) {
        extra?.onStart?.()
        extra?.onEnd?.()
        return 'none' as const
      }

      busyRef.current = true
      if (mountedRef.current) {
        setLoadingAudio(true)
        setSpeechWarning('')
      }

      const used = await speakInterviewText(rawText, {
        voiceId,
        onFallback: (reason) => {
          if (!mountedRef.current) return
          setSpeechWarning(
            reason.includes('Invalid') && reason.includes('API key')
              ? 'Interviewer voice is unavailable — using your browser voice instead.'
              : 'Interviewer voice unavailable — using browser voice.',
          )
        },
        onStart: () => {
          if (!mountedRef.current) return
          setLoadingAudio(false)
          setSpeaking(true)
          extra?.onStart?.()
        },
        onEnd: () => {
          if (!mountedRef.current) return
          setSpeaking(false)
          setLoadingAudio(false)
          busyRef.current = false
          extra?.onEnd?.()
        },
      })

      if (used === 'cancelled') {
        if (mountedRef.current) {
          setLoadingAudio(false)
          setSpeaking(false)
        }
        busyRef.current = false
        return 'cancelled' as const
      }

      if (used === 'none') {
        if (mountedRef.current) {
          setLoadingAudio(false)
          setSpeaking(false)
        }
        busyRef.current = false
        extra?.onStart?.()
        extra?.onEnd?.()
      }

      return used
    },
    [stop],
  )

  return { speak, stop, speaking, loadingAudio, speechWarning }
}
