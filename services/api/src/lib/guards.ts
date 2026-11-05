import { getSkill, isSafetyBlocked } from '@skill-passport/shared';
import type { LogParseResult, PointAskResponse, PointAskResult, Step } from '@skill-passport/shared';

/** Below this, Point & Ask shows no steps, whatever the model says. */
export const POINT_ASK_MIN_CONFIDENCE = 0.7;

/** Largest base64 image we accept (about 3 MB of JPEG). */
export const MAX_IMAGE_BASE64_LENGTH = 4_000_000;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Keep skill ids inside our library and confidence inside 0..1. */
export function guardLogParse(result: LogParseResult): LogParseResult {
  return {
    ...result,
    skill_id: getSkill(result.skill_id) ? result.skill_id : 'none',
    next_skill_id: getSkill(result.next_skill_id) ? result.next_skill_id : 'none',
    confidence: clamp01(result.confidence),
  };
}

const UNSURE_DEFAULT = "I'm not sure. I won't guess. Let's ask someone you trust.";
const BLOCKED_REASON =
  "I don't give steps for this, to keep you safe. Let's ask someone you trust.";

function clampBox(step: Step): Step {
  if (!step.box) return step;
  const x = clamp01(step.box.x);
  const y = clamp01(step.box.y);
  const w = clamp01(step.box.w);
  const h = clamp01(step.box.h);
  // Drop boxes that are empty or run off the image; a wrong box is worse than none.
  if (w === 0 || h === 0 || x + w > 1 || y + h > 1) return { ...step, box: null };
  return { ...step, box: { x, y, w, h } };
}

/**
 * Enforce the "won't guess" rules in code: safety-blocked items (stoves, heaters,
 * medication) and low-confidence answers never get steps.
 */
export function guardPointAsk(result: PointAskResult): PointAskResponse {
  const confidence = clamp01(result.confidence);
  const noSteps = (reason: string): PointAskResponse => ({
    ...result,
    confidence,
    steps: [],
    unsure_reason: reason,
    safety_blocked: false,
  });

  if (isSafetyBlocked(result.appliance)) {
    return { ...noSteps(BLOCKED_REASON), safety_blocked: true };
  }
  if (confidence < POINT_ASK_MIN_CONFIDENCE || result.steps.length === 0) {
    return noSteps(result.unsure_reason ?? UNSURE_DEFAULT);
  }
  return {
    ...result,
    confidence,
    unsure_reason: null,
    safety_blocked: false,
    steps: result.steps.map(clampBox),
  };
}

/** Safe reply when the model declines or fails, so the app can offer human help. */
export function unsurePointAsk(reason = UNSURE_DEFAULT): PointAskResponse {
  return {
    appliance: 'unknown',
    item_name: '',
    confidence: 0,
    check_statement: '',
    same_as_before: [],
    different: [],
    steps: [],
    unsure_reason: reason,
    safety_blocked: false,
  };
}
