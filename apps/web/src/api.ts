// Client for the Skill Passport API (services/api). When VITE_API_URL is not set,
// every call returns null and the app shows its built-in sample flows instead.
import type {
  LogParseResult,
  PointAskResponse,
  SupportLevel,
} from "@skill-passport/shared"

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  "",
)

export const apiAvailable = Boolean(API_URL)

// API Gateway stops waiting at 30 seconds; give up just before that.
const TIMEOUT_MS = 28_000

async function post<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Request failed (${res.status})`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Shrink a photo to about 1024px on the long edge and encode it as base64 JPEG.
 * Keeps uploads small and fast. The photo is only held in memory.
 */
export async function photoToJpegBase64(file: File, maxEdge = 1024) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
  return dataUrl.slice(dataUrl.indexOf(",") + 1)
}

export interface KnownSkill {
  skillId: string
  level: SupportLevel
  learnedOn?: string
}

export async function askAboutPhoto(
  file: File,
  goal: string,
  knownSkills: KnownSkill[],
): Promise<PointAskResponse | null> {
  if (!apiAvailable) return null
  const imageBase64 = await photoToJpegBase64(file)
  return post<PointAskResponse>("/point-ask", {
    imageBase64,
    goal,
    knownSkills,
  })
}

export async function matchLogToSkill(
  text: string,
  passport: { skillId: string; level: SupportLevel }[],
): Promise<LogParseResult | null> {
  if (!apiAvailable) return null
  return post<LogParseResult>("/log/parse", { text, passport })
}
