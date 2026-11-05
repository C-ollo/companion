import {
  BLOCKED_ITEM_EXAMPLES,
  getSkill,
  PointAskRequestSchema,
  PointAskResultSchema,
} from '@skill-passport/shared';

import promptTemplate from '../../../../prompts/point-ask.md';
import { askClaude, jpegBlock, ModelRefusalError } from '../lib/bedrock';
import { guardPointAsk, MAX_IMAGE_BASE64_LENGTH, unsurePointAsk } from '../lib/guards';
import { BadRequestError, json, parseBody, withErrors } from '../lib/http';

const SYSTEM = promptTemplate.replace('{{BLOCKED_ITEMS}}', BLOCKED_ITEM_EXAMPLES.join(', '));

/**
 * POST /point-ask: look at the photo, say what it sees (the app asks the person to
 * confirm before showing steps), and write steps that compare with known skills.
 * The photo is used for this request only and never stored.
 */
export const handler = withErrors(async (event) => {
  const req = parseBody(event, PointAskRequestSchema);
  if (req.imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
    throw new BadRequestError('Image is too large. Resize to about 1024 pixels first.');
  }

  const known = req.knownSkills.map((k) => ({
    skill: getSkill(k.skillId)?.name ?? k.skillId,
    level: k.level,
    learnedOn: k.learnedOn ?? 'unknown',
  }));

  try {
    const result = await askClaude({
      system: SYSTEM,
      content: [
        jpegBlock(req.imageBase64),
        {
          type: 'text',
          text: [
            `What the person wants to do: ${JSON.stringify(req.goal)}`,
            `Skills already in their passport: ${JSON.stringify(known)}`,
          ].join('\n'),
        },
      ],
      schema: PointAskResultSchema,
      // Low effort keeps the reply well inside API Gateway's 30-second limit.
      effort: 'low',
      maxTokens: 4000,
    });
    return json(200, guardPointAsk(result));
  } catch (err) {
    if (!(err instanceof ModelRefusalError)) throw err;
    return json(200, unsurePointAsk());
  }
});
