import { SummaryRequestSchema, SummaryResultSchema } from '@skill-passport/shared';

import SYSTEM from '../../../../prompts/summary.md';
import { askClaude } from '../lib/bedrock';
import { json, parseBody, withErrors } from '../lib/http';

/** POST /summary: draft "My month" from the person's logs. They edit it before sharing. */
export const handler = withErrors(async (event) => {
  const req = parseBody(event, SummaryRequestSchema);
  if (req.logs.length === 0) {
    return json(200, { did: [], stronger: [], new_places: [], next_ideas: [] });
  }

  const logs = [...req.logs].sort((a, b) => a.at.localeCompare(b.at));
  const result = await askClaude({
    system: SYSTEM,
    content: `Month: ${req.month}\nLogs, oldest first: ${JSON.stringify(logs)}`,
    schema: SummaryResultSchema,
    effort: 'medium',
    maxTokens: 4000,
  });
  return json(200, result);
});
