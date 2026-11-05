// What the person is asking a trusted person about, carried from Point & Ask
// into the photo check and waiting screens. Memory only.
//
// Prototype: in the real app, supporters would have Companion too and get the
// request in-app. Here the in-app send is simulated, and "Send by text instead"
// uses the phone's share menu to reach a real person.
import { useSyncExternalStore } from "react"

export type AskReason = "safety" | "unsure" | "stuck"

export interface AskRequest {
  reason: AskReason
  itemName: string
  /** Current step, when the person is stuck on one. */
  stepNumber?: number
  stepText?: string
  /** How it was sent, once sent. */
  sentBy?: "app" | "text"
}

let request: AskRequest | null = null
const listeners = new Set<() => void>()

export function useAskRequest() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => request,
  )
}

export function startAsk(next: AskRequest) {
  request = next
  listeners.forEach((listener) => listener())
}

export function markSent(sentBy: "app" | "text") {
  if (request) request = { ...request, sentBy }
  listeners.forEach((listener) => listener())
}

/** The message the friend will see. */
export function askMessage(ask: AskRequest, name = "Maya") {
  const item = ask.itemName || "something new"
  if (ask.reason === "safety") {
    return `${name} needs in-person help with the ${item}.`
  }
  if (ask.reason === "stuck" && ask.stepText) {
    return `${name} is on step ${ask.stepNumber ?? 1} with the ${item}: ‘${ask.stepText}’ and would like help.`
  }
  return `${name} is not sure what this is or how to use it. Can you help?`
}

/** Send the photo and message through the phone's share menu (SMS, WhatsApp...). */
export async function shareByText(ask: AskRequest, photoUrl: string | null) {
  const text = askMessage(ask)
  const files: File[] = []
  if (photoUrl) {
    const blob = await fetch(photoUrl).then((res) => res.blob())
    files.push(new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" }))
  }
  const withPhoto = { title: "Can you help?", text, files }
  if (files.length && navigator.canShare?.(withPhoto)) {
    await navigator.share(withPhoto)
    return true
  }
  if (navigator.share) {
    await navigator.share({ title: "Can you help?", text })
    return true
  }
  // No share menu (most desktop browsers): open a text message instead.
  window.location.href = `sms:?&body=${encodeURIComponent(text)}`
  return true
}
