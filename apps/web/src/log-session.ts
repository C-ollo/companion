// Holds the AI's match for the current voice or text log while the person moves
// from "Tell me what you did" to the review and confirmation screens. Memory only.
import { useSyncExternalStore } from "react"
import type { LogParseResult, SupportLevel } from "@skill-passport/shared"
import { getSkill } from "@skill-passport/shared/src/skills"

import { matchLogToSkill } from "./api"

export interface LogSession {
  text: string
  result: LogParseResult | null
}

let session: LogSession = { text: "", result: null }
const listeners = new Set<() => void>()

export function useLogSession() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => session,
  )
}

/** Maya's current levels, so the AI can notice when she needed less help. */
const passport: { skillId: string; level: SupportLevel }[] = [
  { skillId: "laundry", level: "on_my_own" },
  { skillId: "light_rail_to_work", level: "on_my_own" },
  { skillId: "cafe_self_order", level: "with_prompt" },
  { skillId: "stovetop_cooking", level: "on_my_own" },
  { skillId: "grocery_list", level: "with_prompt" },
]

/** Below this, the app asks the person to pick the skill themselves. */
export const LOG_MATCH_MIN_CONFIDENCE = 0.6

/**
 * Ask the AI which skill the person's words describe.
 * Returns "matched", "unclear", or null when the API isn't configured.
 */
export async function matchLog(text: string) {
  const result = await matchLogToSkill(text, passport)
  session = { text, result }
  listeners.forEach((listener) => listener())
  if (!result) return null
  const known = result.skill_id !== "none" && getSkill(result.skill_id)
  return known && result.confidence >= LOG_MATCH_MIN_CONFIDENCE
    ? "matched"
    : "unclear"
}

const LOGS_KEY = "skill-passport/logs"

export interface SavedLog {
  at: string
  text: string
  skillId: string
  level: SupportLevel
  via: "voice_or_text"
}

/** Keep the confirmed log on this device. Nothing is sent anywhere. */
export function saveLog(text: string, result: LogParseResult) {
  const logs = loadLogs()
  const last = logs[logs.length - 1]
  // React may run effects twice in development; don't save the same log twice.
  const justSaved =
    last &&
    last.text === text &&
    Date.now() - new Date(last.at).getTime() < 10_000
  if (justSaved) return
  logs.push({
    at: new Date().toISOString(),
    text,
    skillId: result.skill_id,
    level: result.support_level,
    via: "voice_or_text",
  })
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

/** Undo: remove the most recent log. */
export function removeLastLog() {
  const logs = loadLogs()
  logs.pop()
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export function loadLogs(): SavedLog[] {
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) ?? "[]") as SavedLog[]
  } catch {
    return []
  }
}
