// Voice typing with the browser's built-in speech recognition (Web Speech API).
// Chrome and Safari turn speech into text using their own speech services;
// Companion never records or saves the audio.
import { useCallback, useEffect, useRef, useState } from "react"

// Minimal types: the Web Speech API isn't in TypeScript's DOM library.
interface RecognitionResult {
  isFinal: boolean
  0: { transcript: string }
}
interface RecognitionEvent {
  resultIndex: number
  results: ArrayLike<RecognitionResult>
}
interface Recognition {
  lang: string
  interimResults: boolean
  continuous: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}
type RecognitionConstructor = new () => Recognition

function recognitionConstructor(): RecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export const voiceTypingSupported =
  typeof window !== "undefined" && recognitionConstructor() !== null

const ERRORS: Record<string, string> = {
  "not-allowed": "Allow the microphone to use voice. Or type instead.",
  "service-not-allowed": "Voice typing is turned off. You can type instead.",
  "no-speech": "I didn't hear anything. Tap the microphone to try again.",
  "audio-capture": "I can't find a microphone. You can type instead.",
  network: "Voice typing needs the internet. You can type instead.",
}

/**
 * Start and stop listening. Words are passed to onText as they are heard,
 * appended to whatever text was there when listening started.
 */
export function useVoiceTyping(text: string, onText: (value: string) => void) {
  const [listening, setListening] = useState(false)
  const [message, setMessage] = useState("")
  const recognition = useRef<Recognition | null>(null)
  const textRef = useRef(text)
  textRef.current = text

  useEffect(() => () => recognition.current?.abort(), [])

  const stop = useCallback(() => {
    recognition.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Ctor = recognitionConstructor()
    if (!Ctor) {
      setMessage(
        "Voice typing doesn't work in this browser. Tap the box below and use your keyboard's microphone, or type.",
      )
      return
    }
    const rec = new Ctor()
    rec.lang = "en-US"
    rec.interimResults = true
    rec.continuous = true
    const before = textRef.current.trim()
    let finalText = ""
    rec.onresult = (event) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result) continue
        if (result.isFinal) finalText += result[0].transcript
        else interim += result[0].transcript
      }
      const heard = (finalText + interim).trim()
      onText([before, heard].filter(Boolean).join(" "))
    }
    rec.onerror = (event) => {
      if (event.error === "aborted") return
      setMessage(ERRORS[event.error] ?? "Voice typing stopped. You can type instead.")
    }
    rec.onend = () => {
      setListening(false)
      recognition.current = null
    }
    recognition.current = rec
    setMessage("")
    try {
      rec.start()
      setListening(true)
    } catch {
      setMessage("Voice typing couldn't start. You can type instead.")
    }
  }, [onText])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  return { listening, toggle, message }
}
