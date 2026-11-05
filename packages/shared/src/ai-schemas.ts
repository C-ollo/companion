import { z } from "zod";
import { SUPPORT_LEVELS } from "./types";

/**
 * Shapes the AI must return (via Bedrock structured outputs) and the app expects.
 * Shared so the API and the app can't drift apart.
 */

export const SupportLevelSchema = z.enum(SUPPORT_LEVELS);

// POST /log/parse
export const LogParseRequestSchema = z.object({
  text: z.string().min(1).max(500),
  /** Level the person picked themselves, if they did. */
  level: SupportLevelSchema.optional(),
  /** Current levels for skills already in the passport. */
  passport: z
    .array(z.object({ skillId: z.string(), level: SupportLevelSchema }))
    .max(100)
    .default([]),
});
export type LogParseRequest = z.infer<typeof LogParseRequestSchema>;

export const LogParseResultSchema = z.object({
  /** Matching skill id from the library, or "none" if nothing fits. */
  skill_id: z.string(),
  support_level: SupportLevelSchema,
  /** 0 to 1. Below the app's threshold, the app asks the person to confirm. */
  confidence: z.number(),
  /** Plain-language question to confirm the match, e.g. "Did you mean Laundry?" */
  confirm_question: z.string(),
  /** Short, warm, plain-language reply to the person. */
  reply: z.string(),
  /** A skill to suggest next, or "none". */
  next_skill_id: z.string(),
});
export type LogParseResult = z.infer<typeof LogParseResultSchema>;

// POST /point-ask
export const PointAskRequestSchema = z.object({
  /** Base64 JPEG, resized on the device to about 1024px on the long edge. */
  imageBase64: z.string().min(1),
  /** What the person wants to do, e.g. "Wash my clothes". */
  goal: z.string().min(1).max(300),
  /** Related skills already in the passport, with where they learned them. */
  knownSkills: z
    .array(
      z.object({
        skillId: z.string(),
        level: SupportLevelSchema,
        learnedOn: z.string().optional(),
      }),
    )
    .max(50)
    .default([]),
});
export type PointAskRequest = z.infer<typeof PointAskRequestSchema>;

export const StepSchema = z.object({
  /** 2 to 4 words naming the step, e.g. "Choosing your item". */
  step_title: z.string(),
  /** One instruction, verb first, 12 words or fewer. */
  action: z.string(),
  /** Where it is, using visible landmarks. */
  where: z.string(),
  /** Highlight box as fractions (0 to 1) of the image, or null if not sure. */
  box: z
    .object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() })
    .nullable(),
  /** How the person will know the step worked. */
  done_when: z.string(),
  /** A short extra clue, shown on "Show hint". */
  hint: z.string().nullable(),
  caution: z.string().nullable(),
});
export type Step = z.infer<typeof StepSchema>;

export const PointAskResultSchema = z.object({
  /** e.g. "washing_machine", "cafe_self_order_kiosk", "stove", "unknown". */
  appliance: z.string(),
  /** Plain-words name, e.g. "Café Self-Order Touchscreen Kiosk". */
  item_name: z.string(),
  /** The passport skill this task belongs to, from the skill library, or "none". */
  skill_id: z.string(),
  confidence: z.number(),
  /** What the AI thinks it sees, phrased for the person to confirm. */
  check_statement: z.string(),
  same_as_before: z.array(z.string()),
  different: z.array(z.string()),
  /** Empty when unsure or blocked. Shown only after the person confirms. */
  steps: z.array(StepSchema),
  /** Plain-language reason when the AI won't guide, otherwise null. */
  unsure_reason: z.string().nullable(),
});
/** What the API returns: the model's answer plus the code-enforced safety flag. */
export type PointAskResponse = z.infer<typeof PointAskResultSchema> & { safety_blocked?: boolean };
export type PointAskResult = z.infer<typeof PointAskResultSchema>;

/**
 * Point & Ask in two parts, requested at the same time so the person sees
 * "Does this look right?" quickly while the steps are still being written.
 */
export const PointAskStepsRequestSchema = PointAskRequestSchema.extend({
  /** Set when re-asking for steps after the identify answer disagreed. */
  confirmedItem: z.string().max(200).optional(),
});
export type PointAskStepsRequest = z.infer<typeof PointAskStepsRequestSchema>;

export const PointAskIdentifySchema = PointAskResultSchema.omit({ steps: true });
export type PointAskIdentify = z.infer<typeof PointAskIdentifySchema>;
export type PointAskIdentifyResponse = PointAskIdentify & { safety_blocked?: boolean };

export const PointAskStepsSchema = z.object({
  appliance: z.string(),
  item_name: z.string(),
  steps: z.array(StepSchema),
});
export type PointAskSteps = z.infer<typeof PointAskStepsSchema>;

// POST /check-step
export const CheckStepRequestSchema = z.object({
  imageBase64: z.string().min(1),
  action: z.string(),
  done_when: z.string(),
});
export type CheckStepRequest = z.infer<typeof CheckStepRequestSchema>;

export const CheckStepResultSchema = z.object({
  result: z.enum(["done", "not_yet", "not_sure"]),
  what_i_see: z.string(),
  /** What to do next when not_yet, otherwise null. */
  tip: z.string().nullable(),
});
export type CheckStepResult = z.infer<typeof CheckStepResultSchema>;

// POST /summary
export const SummaryRequestSchema = z.object({
  month: z.string(),
  logs: z
    .array(
      z.object({
        at: z.string(),
        skillName: z.string(),
        level: SupportLevelSchema,
        place: z.string(),
      }),
    )
    .max(500),
});
export type SummaryRequest = z.infer<typeof SummaryRequestSchema>;

export const SummaryResultSchema = z.object({
  did: z.array(z.string()),
  stronger: z.array(z.string()),
  new_places: z.array(z.string()),
  next_ideas: z.array(z.string()),
});
export type SummaryResult = z.infer<typeof SummaryResultSchema>;
