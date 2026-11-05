import {
  BLOCKED_ITEM_EXAMPLES,
  getSkill,
  PointAskIdentifySchema,
  PointAskRequestSchema,
  PointAskResultSchema,
  PointAskStepsRequestSchema,
  PointAskStepsSchema,
  SKILLS,
} from '@skill-passport/shared';
import type { PointAskRequest } from '@skill-passport/shared';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { z } from 'zod';

import promptTemplate from '../../../../prompts/point-ask.md';
import { askClaude, jpegBlock, ModelRefusalError } from '../lib/bedrock';
import {
  guardIdentify,
  guardPointAsk,
  guardSteps,
  MAX_IMAGE_BASE64_LENGTH,
  unsureIdentify,
  unsurePointAsk,
} from '../lib/guards';
import { BadRequestError, json, parseBody, withErrors } from '../lib/http';

const SYSTEM = promptTemplate
  .replace('{{BLOCKED_ITEMS}}', BLOCKED_ITEM_EXAMPLES.join(', '))
  .replace('{{SKILL_LIBRARY}}', SKILLS.map((s) => `- ${s.id}: ${s.name}`).join('\n'));

function readRequest<T extends z.ZodType<PointAskRequest>>(event: APIGatewayProxyEventV2, schema: T) {
  const req = parseBody(event, schema);
  if (req.imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
    throw new BadRequestError('Image is too large. Resize to about 1024 pixels first.');
  }
  return req;
}

/** The photo plus what the person wants and already knows. Never stored. */
function photoContent(req: PointAskRequest, extra: string[] = []) {
  const known = req.knownSkills.map((k) => ({
    skill: getSkill(k.skillId)?.name ?? k.skillId,
    level: k.level,
    learnedOn: k.learnedOn ?? 'unknown',
  }));
  return [
    jpegBlock(req.imageBase64),
    {
      type: 'text' as const,
      text: [
        ...extra,
        `What the person wants to do: ${JSON.stringify(req.goal)}`,
        `Skills already in their passport: ${JSON.stringify(known)}`,
      ].join('\n'),
    },
  ];
}

/**
 * POST /point-ask: everything in one answer (what it sees + steps).
 * Kept for older app versions; the app now uses the two endpoints below.
 */
export const handler = withErrors(async (event) => {
  const req = readRequest(event, PointAskRequestSchema);
  try {
    const result = await askClaude({
      system: SYSTEM,
      content: photoContent(req),
      schema: PointAskResultSchema,
      effort: 'low',
      maxTokens: 4000,
    });
    return json(200, guardPointAsk(result));
  } catch (err) {
    if (!(err instanceof ModelRefusalError)) throw err;
    return json(200, unsurePointAsk());
  }
});

/**
 * POST /point-ask/identify: what it sees, for "Does this look right?".
 * Short answer, so it comes back in a few seconds.
 */
export const identify = withErrors(async (event) => {
  const req = readRequest(event, PointAskRequestSchema);
  try {
    const result = await askClaude({
      system: SYSTEM,
      content: photoContent(req, ['This is the identify part.']),
      schema: PointAskIdentifySchema,
      effort: 'low',
      maxTokens: 1500,
    });
    return json(200, guardIdentify(result));
  } catch (err) {
    if (!(err instanceof ModelRefusalError)) throw err;
    return json(200, unsureIdentify());
  }
});

/**
 * POST /point-ask/steps: the steps, requested at the same time as identify.
 * If identify saw something different, the app asks again with confirmedItem.
 */
export const steps = withErrors(async (event) => {
  const req = readRequest(event, PointAskStepsRequestSchema);
  const extra = ['This is the steps part.'];
  if (req.confirmedItem) {
    extra.push(`The person confirmed this is: ${JSON.stringify(req.confirmedItem)}. Write steps for it.`);
  }
  try {
    const result = await askClaude({
      system: SYSTEM,
      content: photoContent(req, extra),
      schema: PointAskStepsSchema,
      effort: 'low',
      maxTokens: 3500,
    });
    return json(200, guardSteps(result));
  } catch (err) {
    if (!(err instanceof ModelRefusalError)) throw err;
    return json(200, { appliance: 'unknown', item_name: '', steps: [] });
  }
});
