import { SUPPORT_LEVELS } from "./types";
import type {
  Log,
  PassportSkill,
  PlaceProgress,
  Stamp,
  SupportLevel,
} from "./types";

/**
 * Level and stamp rules. These run in code, not in the AI, so they are predictable
 * and the person can be told exactly how to earn the next stamp.
 */

/** Logs needed at "With a prompt" or better to earn the "With a prompt" stamp. */
export const WITH_PROMPT_STAMP_THRESHOLD = 3;
/** Logs needed at "On my own" to earn the "On my own" stamp. */
export const ON_MY_OWN_STAMP_THRESHOLD = 3;
/** "On my own" logs needed in a new place to earn that place's stamp. */
export const NEW_PLACE_STAMP_THRESHOLD = 2;
/** How many recent logs decide the current level. */
const RECENT_WINDOW = 3;
/** How many of the recent logs must reach a level for it to count. */
const RECENT_REQUIRED = 2;

const rank = (level: SupportLevel) => SUPPORT_LEVELS.indexOf(level);

const byTime = (a: Log, b: Log) => a.at.localeCompare(b.at);

/**
 * Current level: the most independent level reached in 2 of the last 3 logs.
 * With fewer logs, every log must reach it (so one log sets the level on its own).
 */
export function currentLevel(logs: Log[]): SupportLevel {
  if (logs.length === 0) return "with_help";
  const recent = [...logs].sort(byTime).slice(-RECENT_WINDOW);
  const required = Math.min(RECENT_REQUIRED, recent.length);
  for (let i = SUPPORT_LEVELS.length - 1; i >= 0; i--) {
    const atOrAbove = recent.filter((log) => rank(log.level) >= i).length;
    if (atOrAbove >= required) return SUPPORT_LEVELS[i]!;
  }
  return "with_help";
}

/**
 * The place where the person first logged this skill. Every other place is a "new place".
 */
export function homePlace(logs: Log[]): string | undefined {
  return [...logs].sort(byTime)[0]?.place;
}

/** Stamps earned so far, in the order they were earned. */
export function earnedStamps(skillId: string, logs: Log[]): Stamp[] {
  const sorted = logs.filter((log) => log.skillId === skillId).sort(byTime);
  const stamps: Stamp[] = [];
  const home = homePlace(sorted);
  let withPromptCount = 0;
  let onMyOwnCount = 0;
  const onMyOwnByPlace = new Map<string, number>();

  for (const log of sorted) {
    if (rank(log.level) >= rank("with_prompt")) {
      withPromptCount++;
      if (withPromptCount === WITH_PROMPT_STAMP_THRESHOLD) {
        stamps.push({ kind: "with_prompt", skillId, earnedAt: log.at });
      }
    }
    if (log.level === "on_my_own") {
      onMyOwnCount++;
      if (onMyOwnCount === ON_MY_OWN_STAMP_THRESHOLD) {
        stamps.push({ kind: "on_my_own", skillId, earnedAt: log.at });
      }
      if (log.place !== home) {
        const placeCount = (onMyOwnByPlace.get(log.place) ?? 0) + 1;
        onMyOwnByPlace.set(log.place, placeCount);
        if (placeCount === NEW_PLACE_STAMP_THRESHOLD) {
          stamps.push({
            kind: "new_place",
            skillId,
            place: log.place,
            earnedAt: log.at,
          });
        }
      }
    }
  }
  return stamps;
}

/** Level in each place, home place first. A new place has its own level. */
export function placeProgress(logs: Log[]): PlaceProgress[] {
  const sorted = [...logs].sort(byTime);
  const places = [...new Set(sorted.map((log) => log.place))];
  return places.map((place) => {
    const here = sorted.filter((log) => log.place === place);
    return {
      place,
      level: currentLevel(here),
      onMyOwnCount: here.filter((log) => log.level === "on_my_own").length,
    };
  });
}

/** Build the full passport entry for one skill from its logs. */
export function passportSkill(skillId: string, allLogs: Log[]): PassportSkill {
  const logs = allLogs.filter((log) => log.skillId === skillId);
  const stamps = earnedStamps(skillId, logs);
  const has = (kind: Stamp["kind"]) => stamps.some((s) => s.kind === kind);

  let nextStamp: PassportSkill["nextStamp"] = null;
  if (!has("with_prompt")) {
    const done = logs.filter((l) => rank(l.level) >= rank("with_prompt")).length;
    nextStamp = {
      kind: "with_prompt",
      level: "with_prompt",
      remaining: WITH_PROMPT_STAMP_THRESHOLD - done,
    };
  } else if (!has("on_my_own")) {
    const done = logs.filter((l) => l.level === "on_my_own").length;
    nextStamp = {
      kind: "on_my_own",
      level: "on_my_own",
      remaining: ON_MY_OWN_STAMP_THRESHOLD - done,
    };
  }

  return {
    skillId,
    level: currentLevel(logs),
    logCount: logs.length,
    confirmedCount: logs.filter((log) => log.source === "confirmed").length,
    places: placeProgress(logs),
    stamps,
    nextStamp,
  };
}

/** "On my own" logs still needed in a place to earn its new-place stamp. */
export function remainingForPlaceStamp(
  skillId: string,
  place: string,
  allLogs: Log[],
): number {
  const logs = allLogs.filter((log) => log.skillId === skillId);
  if (place === homePlace(logs)) return 0;
  const done = logs.filter(
    (log) => log.place === place && log.level === "on_my_own",
  ).length;
  return Math.max(0, NEW_PLACE_STAMP_THRESHOLD - done);
}

/**
 * True when a new log moves the skill to a more independent level.
 * Used for the "You needed less help" message.
 */
export function neededLessHelp(previousLogs: Log[], newLog: Log): boolean {
  const before = previousLogs.filter((log) => log.skillId === newLog.skillId);
  if (before.length === 0) return false;
  return rank(currentLevel([...before, newLog])) > rank(currentLevel(before));
}

/** Days with at least one log in the week containing `now` (weeks start Monday). */
export function daysPracticedThisWeek(logs: Log[], now: Date): number {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const days = new Set(
    logs
      .map((log) => new Date(log.at))
      .filter((d) => d >= start && d < end)
      .map((d) => d.toDateString()),
  );
  return days.size;
}
