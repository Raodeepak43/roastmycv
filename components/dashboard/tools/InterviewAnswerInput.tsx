'use client'

import { Mic, Send } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  recording?: boolean
  speechSupported?: boolean
  onToggleRecord?: () => void
  placeholder?: string
  /** Dark theme for inside interview room */
  variant?: 'default' | 'room'
}

export function InterviewAnswerInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  recording = false,
  speechSupported = true,
  onToggleRecord,
  placeholder = 'Type or tap mic to speak…',
  variant = 'default',
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = Boolean(value.trim()) && !disabled

  const resizeInput = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    const next = Math.min(Math.max(el.scrollHeight, 44), 128)
    el.style.height = `${next}px`
  }, [])

  useEffect(() => {
    resizeInput()
  }, [value, recording, resizeInput])

  const rootClass =
    variant === 'room' ? 'dash-voice-composer dash-voice-composer--room' : 'dash-voice-composer'

  return (
    <div className={rootClass}>
      <div className={`dash-voice-composer__bar ${recording ? 'dash-voice-composer__bar--live' : ''}`}>
        {recording && (
          <div className="dash-voice-composer__wave" aria-hidden>
            <span /><span /><span /><span /><span />
          </div>
        )}
        <textarea
          ref={textareaRef}
          className="dash-voice-composer__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onInput={resizeInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (canSend) onSubmit()
            }
          }}
          placeholder={recording ? 'Listening…' : placeholder}
          disabled={disabled}
          rows={1}
        />
        <div className="dash-voice-composer__actions">
          {onToggleRecord && (
            <button
              type="button"
              className={`dash-voice-composer__mic ${recording ? 'dash-voice-composer__mic--active' : ''}`}
              disabled={disabled || !speechSupported}
              onClick={onToggleRecord}
              aria-label={recording ? 'Stop speaking' : 'Start speaking'}
            >
              <Mic className="size-[18px]" strokeWidth={2} aria-hidden />
            </button>
          )}
          <button
            type="button"
            className="dash-voice-composer__send"
            disabled={!canSend}
            onClick={onSubmit}
            aria-label="Send answer"
          >
            <Send className="size-[17px]" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
      {variant === 'room' && (
        <p className="dash-voice-composer__hint">
          Press Enter to send · Shift+Enter for new line
          {!speechSupported && onToggleRecord && ' · Voice works best in Chrome'}
        </p>
      )}
      {variant !== 'room' && !speechSupported && onToggleRecord && (
        <p className="dash-voice-composer__status text-amber-600">Voice works best in Chrome and Edge.</p>
      )}
    </div>
  )
}

/** Three-dot typing indicator — no text labels. */
export function InterviewTypingDots() {
  return (
    <div className="dash-tools-typing" aria-hidden>
      <span /><span /><span />
    </div>
  )
}
