'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createSpeechRecognition,
  speechRecognitionSupported,
  transcriptsFromEvent,
  type BrowserSpeechRecognition,
} from '@/lib/tools/dashboard/speech-recognition'

const SILENCE_MS = 1800

type Options = {
  lang?: string
  onTranscript?: (text: string) => void
  /** Fires after user stops speaking — use for auto-send. */
  onUtteranceEnd?: (text: string) => void
}

export function useSpeechRecognition(opts?: Options) {
  const [supported, setSupported] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const baseTextRef = useRef('')
  const latestTextRef = useRef('')
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const silentStopRef = useRef(false)
  const utteranceSentRef = useRef(false)
  const optsRef = useRef(opts)
  optsRef.current = opts

  useEffect(() => {
    setSupported(speechRecognitionSupported())
  }, [])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const flushUtterance = useCallback(() => {
    if (utteranceSentRef.current || silentStopRef.current) return
    const finalText = latestTextRef.current.trim()
    if (!finalText) return
    utteranceSentRef.current = true
    optsRef.current?.onUtteranceEnd?.(finalText)
  }, [])

  const endSession = useCallback(() => {
    clearSilenceTimer()
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    recognitionRef.current = null
    setRecording(false)
  }, [clearSilenceTimer])

  const stop = useCallback(
    (stopOpts?: { silent?: boolean }) => {
      clearSilenceTimer()
      if (stopOpts?.silent) {
        silentStopRef.current = true
        utteranceSentRef.current = true
        try {
          recognitionRef.current?.abort()
        } catch {
          /* ignore */
        }
        recognitionRef.current = null
        setRecording(false)
        silentStopRef.current = false
        utteranceSentRef.current = false
        return
      }
      flushUtterance()
      try {
        recognitionRef.current?.stop()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
      setRecording(false)
    },
    [clearSilenceTimer, flushUtterance],
  )

  const scheduleSilenceEnd = useCallback(() => {
    clearSilenceTimer()
    silenceTimerRef.current = setTimeout(() => {
      flushUtterance()
      endSession()
    }, SILENCE_MS)
  }, [clearSilenceTimer, endSession, flushUtterance])

  const start = useCallback(
    (appendTo = '') => {
      clearSilenceTimer()
      silentStopRef.current = true
      try {
        recognitionRef.current?.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
      setRecording(false)
      silentStopRef.current = false
      utteranceSentRef.current = false

      const rec = createSpeechRecognition(optsRef.current?.lang ?? 'en-IN')
      if (!rec) return

      baseTextRef.current = appendTo.trim()
      latestTextRef.current = appendTo.trim()
      setTranscript(appendTo.trim())

      rec.onresult = (event) => {
        const spoken = transcriptsFromEvent(event)
        const next = baseTextRef.current
          ? `${baseTextRef.current} ${spoken}`.trim()
          : spoken
        latestTextRef.current = next
        setTranscript(next)
        optsRef.current?.onTranscript?.(next)
        scheduleSilenceEnd()
      }

      rec.onerror = () => {
        if (!silentStopRef.current) flushUtterance()
        endSession()
        silentStopRef.current = false
      }

      rec.onend = () => {
        if (!silentStopRef.current) flushUtterance()
        endSession()
        silentStopRef.current = false
      }

      try {
        rec.start()
      } catch {
        return
      }
      recognitionRef.current = rec
      setRecording(true)
    },
    [endSession, flushUtterance, scheduleSilenceEnd],
  )

  useEffect(
    () => () => {
      silentStopRef.current = true
      clearSilenceTimer()
      try {
        recognitionRef.current?.abort()
      } catch {
        /* ignore */
      }
    },
    [clearSilenceTimer],
  )

  return { supported, recording, transcript, start, stop, setTranscript }
}
