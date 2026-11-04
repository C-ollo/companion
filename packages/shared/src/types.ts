/** How much help a skill needed, from most help to least. */
export const SUPPORT_LEVELS = ["with_help", "with_prompt", "on_my_own"] as const;
export type SupportLevel = (typeof SUPPORT_LEVELS)[number];

export const SUPPORT_LEVEL_LABELS: Record<SupportLevel, string> = {
  with_help: "With help",
  with_prompt: "With a prompt",
  on_my_own: "On my own",
};

export const CATEGORIES = [
  "cooking",
  "laundry",
  "cleaning",
  "getting_around",
  "money",
  "health",
  "friends",
  "work",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  cooking: "Cooking",
  laundry: "Laundry",
  cleaning: "Cleaning",
  getting_around: "Getting around",
  money: "Money",
  health: "Health",
  friends: "Friends",
  work: "Work",
};

export interface Skill {
  id: string;
  name: string;
  category: Category;
  /** One plain-language sentence describing the skill. */
  description: string;
  /** Skills that build on this one, used for "Up next" suggestions. */
  nextSkillIds: string[];
}

export type LogSource = "self" | "confirmed";
export type LogVia = "voice" | "text" | "tap" | "point_ask";

export interface Log {
  id: string;
  /** ISO 8601 timestamp. */
  at: string;
  /** What the person said or typed, in their own words. */
  text: string;
  skillId: string;
  level: SupportLevel;
  /** Where the skill was done, e.g. "First Place laundry room" or "My apartment". */
  place: string;
  /** "confirmed" when a support person was there; otherwise self-reported. */
  source: LogSource;
  confirmedBy?: string;
  via: LogVia;
}

export type StampKind = "with_prompt" | "on_my_own" | "new_place";

export interface Stamp {
  kind: StampKind;
  skillId: string;
  /** Set for new-place stamps. */
  place?: string;
  /** ISO timestamp of the log that earned it. */
  earnedAt: string;
}

export interface PlaceProgress {
  place: string;
  level: SupportLevel;
  onMyOwnCount: number;
}

/** Everything the app shows for one skill. Derived from logs in code, never by the AI. */
export interface PassportSkill {
  skillId: string;
  level: SupportLevel;
  logCount: number;
  confirmedCount: number;
  places: PlaceProgress[];
  stamps: Stamp[];
  /** What the person needs to do to earn the next skill stamp, or null when all are earned. */
  nextStamp: { kind: StampKind; remaining: number; level: SupportLevel } | null;
}

export type CircleRole = "supporter" | "friend";

export interface CircleMember {
  id: string;
  name: string;
  /** e.g. "Mom", "Support staff". */
  relationship: string;
  role: CircleRole;
  canSee: {
    sharedStamps: boolean;
    monthlySummary: boolean;
    skillIds: string[];
  };
  canDo: {
    confirmLogs: boolean;
    receiveHelpRequests: boolean;
    sendCheers: boolean;
  };
}
