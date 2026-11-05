// Read aloud with Amazon Polly (POST /speak) so the voice is clear and the
// same on every phone. Falls back to the phone's built-in voice when the API
// isn't configured, the phone is offline, or Polly is slow or fails.

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  "",
)

// Give up on Polly and use the built-in voice after this long.
const POLLY_TIMEOUT_MS = 4000
// A tiny silent MP3, played inside the tap to unlock audio on iOS.
const SILENCE =
  "data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYxLjcuMTAzAAAAAAAAAAAAAAD/82TEAAAAA0gAAAAATEFNRVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82TEfAAAA0gAAAAAVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82TEfAAAA0gAAAAAVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82TEfAAAA0gAAAAAVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82TEfAAAA0gAAAAAVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82TEfAAAA0gAAAAAVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82TEfAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU="

let player: HTMLAudioElement | null = null
const cache = new Map<string, string>()
let latest = 0

// The phone's built-in voice (her original read-aloud, with browser fixes).
let currentWords: SpeechSynthesisUtterance | null = null
function speakWithBrowser(text: string) {
  if (!("speechSynthesis" in window)) return
  const synth = window.speechSynthesis
  const start = () => {
    currentWords = new SpeechSynthesisUtterance(text)
    currentWords.rate = 0.88
    currentWords.lang = "en-US"
    const voice = synth
      .getVoices()
      .find((v) => v.lang?.toLowerCase().startsWith("en"))
    if (voice) currentWords.voice = voice
    synth.resume()
    synth.speak(currentWords)
  }
  // Chrome ignores speech started right after cancel(), so wait a moment.
  if (synth.speaking || synth.pending) {
    synth.cancel()
    setTimeout(start, 80)
  } else {
    start()
  }
}

function stopAll() {
  player?.pause()
  if ("speechSynthesis" in window) window.speechSynthesis.cancel()
}

async function fetchSpeech(text: string) {
  const cached = cache.get(text)
  if (cached) return cached
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), POLLY_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_URL}/speak`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 1500) }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`speak ${res.status}`)
    const url = URL.createObjectURL(await res.blob())
    if (cache.size > 40) {
      const [oldText, oldUrl] = cache.entries().next().value as [string, string]
      URL.revokeObjectURL(oldUrl)
      cache.delete(oldText)
    }
    cache.set(text, url)
    return url
  } finally {
    clearTimeout(timer)
  }
}

/** Read text aloud. Call from a tap. A new call stops whatever is playing. */
export function speak(text: string) {
  const request = ++latest
  stopAll()
  if (!API_URL || !navigator.onLine) {
    speakWithBrowser(text)
    return
  }
  // Unlock audio inside the tap (iOS), then play Polly's audio when it arrives.
  player ??= new Audio()
  player.src = SILENCE
  player.play().catch(() => undefined)
  fetchSpeech(text)
    .then((url) => {
      if (request !== latest || !player) return
      player.src = url
      return player.play()
    })
    .catch(() => {
      if (request === latest) speakWithBrowser(text)
    })
}
