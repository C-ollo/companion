// Holds the current Point & Ask photo and the AI's answer while the person moves
// through the scan, identify, steps and complete screens. Memory only: nothing
// here is written to storage, and the photo URL is released when a new scan starts.
import { useSyncExternalStore } from "react"
import type { PointAskResponse } from "@skill-passport/shared"

import {
  identifyPhoto,
  photoToJpegBase64,
  stepsForPhoto,
  type KnownSkill,
} from "./api"

export type PointAskStatus = "idle" | "loading" | "ready" | "error"

export interface PointAskSession {
  /** The identify answer ("Does this look right?"). */
  status: PointAskStatus
  /** The steps, which arrive a few seconds after identify. */
  stepsStatus: PointAskStatus
  photoUrl: string | null
  goal: string
  /** Identify answer plus steps (empty until stepsStatus is "ready"). */
  result: PointAskResponse | null
  stepIndex: number
}

const empty: PointAskSession = {
  status: "idle",
  stepsStatus: "idle",
  photoUrl: null,
  goal: "",
  result: null,
  stepIndex: 0,
}

let session = empty
// The scan in progress; answers from an older scan are ignored.
let currentScan: symbol | null = null
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

// Do the identify and steps answers describe the same item?
function sameItem(a: { appliance: string; item_name: string }, b: { appliance: string; item_name: string }) {
  const norm = (v: string) => v.toLowerCase().replace(/[^a-z]+/g, " ").trim()
  const [aa, ba, an, bn] = [norm(a.appliance), norm(b.appliance), norm(a.item_name), norm(b.item_name)]
  return aa === ba || an === bn || an.includes(bn) || bn.includes(an)
}

/**
 * Send a photo for checking. Identify and steps are requested at the same time:
 * identify comes back in a few seconds, steps keep loading while the person
 * reads "Does this look right?". If the two disagree on the item, the steps are
 * asked for again using the item the person was shown.
 */
export async function startPointAsk(file: File, goal: string) {
  if (session.photoUrl) URL.revokeObjectURL(session.photoUrl)
  const scan = Symbol("scan")
  currentScan = scan
  set({
    status: "loading",
    stepsStatus: "loading",
    photoUrl: URL.createObjectURL(file),
    goal,
    result: null,
    stepIndex: 0,
  })
  let image: string
  try {
    image = await photoToJpegBase64(file)
  } catch {
    set({ status: "error", stepsStatus: "error" })
    return
  }
  const stillCurrent = () => currentScan === scan

  const identifying = identifyPhoto(image, goal, knownSkills)
  const stepping = stepsForPhoto(image, goal, knownSkills)
  // Handled below; this stops an "unhandled rejection" if it fails early.
  stepping.catch(() => undefined)

  let identified: Awaited<typeof identifying> = null
  try {
    identified = await identifying
    if (!stillCurrent()) return
    if (!identified) {
      set({ status: "idle", stepsStatus: "idle" })
      return
    }
    set({ status: "ready", result: { ...identified, steps: [] } })
  } catch {
    if (stillCurrent()) set({ status: "error", stepsStatus: "error" })
    return
  }
  // No steps for blocked or unsure items.
  if (identified.safety_blocked || identified.unsure_reason) {
    set({ stepsStatus: "ready" })
    return
  }
  try {
    let steps = await stepping
    if (steps && !sameItem(identified, steps)) {
      steps = await stepsForPhoto(image, goal, knownSkills, identified.item_name)
    }
    if (!stillCurrent()) return
    if (!steps || steps.steps.length === 0) {
      set({ stepsStatus: "error" })
      return
    }
    set({
      stepsStatus: "ready",
      result: { ...identified, steps: steps.steps },
    })
  } catch {
    if (stillCurrent()) set({ stepsStatus: "error" })
  }
}

export function setStepIndex(stepIndex: number) {
  set({ stepIndex })
}

/** Forget the photo and answer, e.g. when starting over or leaving the flow. */
export function resetPointAsk() {
  currentScan = null
  if (session.photoUrl) URL.revokeObjectURL(session.photoUrl)
  session = empty
  listeners.forEach((listener) => listener())
}
