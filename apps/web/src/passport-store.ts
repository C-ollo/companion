// The person's saved Skill Passport entries. Stored only on this device
// (localStorage); nothing here is sent anywhere.
import { useSyncExternalStore } from "react"
import type { SupportLevel } from "@skill-passport/shared"

const KEY = "skill-passport/logs"

export type EntryVia = "point_ask" | "practice" | "voice_or_text"

export interface PassportEntry {
  id: string
  at: string
  skillId: string
  level: SupportLevel
  place: string
  via: EntryVia
  source: "self" | "confirmed"
  confirmedBy?: string
  /** The person's own words, for voice or text logs. */
  text?: string
}

const listeners = new Set<() => void>()
let cache: PassportEntry[] | null = null

function read(): PassportEntry[] {
  if (cache) return cache
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]") as PassportEntry[]
    // Older entries had no id or place; fill them in so they still show.
    cache = raw.map((entry, index) => ({
      ...entry,
      id: entry.id ?? `entry-${index}-${entry.at}`,
      place: entry.place ?? "",
      source: entry.source ?? "self",
    }))
  } catch {
    cache = []
  }
  return cache
}

function write(entries: PassportEntry[]) {
  cache = entries
  localStorage.setItem(KEY, JSON.stringify(entries))
  listeners.forEach((listener) => listener())
}

export function usePassportEntries() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    read,
  )
}

/** Save an entry and return its id (for undo). */
export function addEntry(entry: Omit<PassportEntry, "id" | "at">) {
  const entries = read()
  const last = entries[entries.length - 1]
  // React can run effects twice in development; don't save the same entry twice.
  const duplicate =
    last &&
    last.skillId === entry.skillId &&
    last.via === entry.via &&
    last.text === entry.text &&
    Date.now() - new Date(last.at).getTime() < 10_000
  if (duplicate) return last.id
  const id = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  write([...entries, { ...entry, id, at: new Date().toISOString() }])
  return id
}

export function removeEntry(id: string) {
  write(read().filter((entry) => entry.id !== id))
}

/** How a saved entry describes the help used. Point & Ask is shown as its own kind of help. */
export function helpLabel(entry: Pick<PassportEntry, "level" | "via">) {
  if (entry.via === "point_ask") return "●●○ With Companion's steps"
  return {
    with_help: "●○○ With help",
    with_prompt: "●●○ With a prompt",
    on_my_own: "●●● On my own",
  }[entry.level]
}
