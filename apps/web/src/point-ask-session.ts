// Holds the current Point & Ask photo and the AI's answer while the person moves
// through the scan, identify, steps and complete screens. Memory only: nothing
// here is written to storage, and the photo URL is released when a new scan starts.
import { useSyncExternalStore } from "react"
import type { PointAskResponse } from "@skill-passport/shared"

import { askAboutPhoto, type KnownSkill } from "./api"

export type PointAskStatus = "idle" | "loading" | "ready" | "error"

export interface PointAskSession {
  status: PointAskStatus
  photoUrl: string | null
  goal: string
  result: PointAskResponse | null
  stepIndex: number
}

const empty: PointAskSession = {
  status: "idle",
  photoUrl: null,
  goal: "",
  result: null,
  stepIndex: 0,
}

let session = empty
const listeners = new Set<() => void>()

function set(next: Partial<PointAskSession>) {
  session = { ...session, ...next }
  listeners.forEach((listener) => listener())
}

export function usePointAskSession() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => session,
  )
}

/** Skills Maya already knows, so the AI can say what's the same and different. */
const knownSkills: KnownSkill[] = [
  {
    skillId: "cafe_self_order",
    level: "with_prompt",
    learnedOn: "Campus Café kiosk",
  },
  {
    skillId: "laundry",
    level: "on_my_own",
    learnedOn: "Top-loading washer at the teaching apartment",
  },
  {
    skillId: "light_rail_to_work",
    level: "on_my_own",
    learnedOn: "Central Station ticket machine",
  },
]

/** Send a photo for checking. Resolves when the answer (or an error) is in. */
export async function startPointAsk(file: File, goal: string) {
  if (session.photoUrl) URL.revokeObjectURL(session.photoUrl)
  set({
    status: "loading",
    photoUrl: URL.createObjectURL(file),
    goal,
    result: null,
    stepIndex: 0,
  })
  try {
    const result = await askAboutPhoto(file, goal, knownSkills)
    set({ status: result ? "ready" : "idle", result })
  } catch {
    set({ status: "error", result: null })
  }
}

export function setStepIndex(stepIndex: number) {
  set({ stepIndex })
}

/** Forget the photo and answer, e.g. when starting over or leaving the flow. */
export function resetPointAsk() {
  if (session.photoUrl) URL.revokeObjectURL(session.photoUrl)
  session = empty
  listeners.forEach((listener) => listener())
}
