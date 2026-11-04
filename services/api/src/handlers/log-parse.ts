import {
  LogParseRequestSchema,
  LogParseResultSchema,
  SKILLS,
} from '@skill-passport/shared';

import promptTemplate from '../../../../prompts/log-parse.md';
import { askClaude, ModelRefusalError } from '../lib/bedrock';
import { guardLogParse } from '../lib/guards';
import { json, parseBody, withErrors } from '../lib/http';

const skillLibrary = SKILLS.map((s) => `- ${s.id}: ${s.name}. ${s.description}`).join('\n');
const SYSTEM = promptTemplate.replace('{{SKILL_LIBRARY}}', skillLibrary);

/** POST /log/parse: map the person's own words to a skill and a support level. */
export const handler = withErrors(async (event) => {
  const req = parseBody(event, LogParseRequestSchema);

  const content = [
    `What the person said: ${JSON.stringify(req.text)}`,
    req.level ? `Level they chose: ${req.level}` : 'They did not choose a level.',
    `Their current passport: ${JSON.stringify(req.passport)}`,
  ].join('\n');

  try {
    const result = await askClaude({
      system: SYSTEM,
      content,
      schema: LogParseResultSchema,
      effort: 'low',
      maxTokens: 2000,
    });
    return json(200, guardLogParse(result));
  } catch (err) {
    if (!(err instanceof ModelRefusalError)) throw err;
    return json(200, {
      skill_id: 'none',
      support_level: req.level ?? 'with_prompt',
      confidence: 0,
      confirm_question: 'Can you tell me a bit more about what you did?',
      reply: "I'm not sure what you did. Can you tell me a bit more?",
      next_skill_id: 'none',
    });
  }
});
