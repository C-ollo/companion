import { CheckStepRequestSchema, CheckStepResultSchema } from '@skill-passport/shared';

import SYSTEM from '../../../../prompts/check-step.md';
import { askClaude, jpegBlock, ModelRefusalError } from '../lib/bedrock';
import { MAX_IMAGE_BASE64_LENGTH } from '../lib/guards';
import { BadRequestError, json, parseBody, withErrors } from '../lib/http';

/**
 * POST /check-step: a frame from the live camera preview, checked against the
 * current step. Never "done" unless the expected result is clearly visible.
 */
export const handler = withErrors(async (event) => {
  const req = parseBody(event, CheckStepRequestSchema);
  if (req.imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
    throw new BadRequestError('Image is too large. Resize to about 1024 pixels first.');
  }

  try {
    const result = await askClaude({
      system: SYSTEM,
      content: [
        jpegBlock(req.imageBase64),
        {
          type: 'text',
          text: `Step: ${JSON.stringify(req.action)}\nDone when: ${JSON.stringify(req.done_when)}`,
        },
      ],
      schema: CheckStepResultSchema,
      effort: 'low',
      maxTokens: 1500,
    });
    return json(200, result);
  } catch (err) {
    if (!(err instanceof ModelRefusalError)) throw err;
    return json(200, {
      result: 'not_sure',
      what_i_see: "I can't check this one.",
      tip: 'Ask someone you trust to take a look.',
    });
  }
});
