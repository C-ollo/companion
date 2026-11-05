// Builds docs/ai-prompts.md: every prompt the AI receives, assembled the same way
// the API assembles them (placeholders filled in), plus the dynamic user
// prompts, output schemas, settings and code-enforced guardrails.
// Run: npx tsx scripts/build-prompts-doc.ts
import fs from 'node:fs';
import path from 'node:path';

import { z } from 'zod';

import {
  BLOCKED_ITEM_EXAMPLES,
  CheckStepResultSchema,
  LogParseResultSchema,
  PointAskIdentifySchema,
  PointAskStepsSchema,
  SKILLS,
  SummaryResultSchema,
} from '../packages/shared/src/index';

const root = path.join(__dirname, '..');
const read = (file: string) => fs.readFileSync(path.join(root, 'prompts', file), 'utf8').trim();

const style = read('shared-style.md');
const logLibrary = SKILLS.map((s) => `- ${s.id}: ${s.name}. ${s.description}`).join('\n');
const pointLibrary = SKILLS.map((s) => `- ${s.id}: ${s.name}`).join('\n');

const prompts = {
  logParse: read('log-parse.md').replace('{{SKILL_LIBRARY}}', logLibrary),
  pointAsk: read('point-ask.md')
    .replace('{{BLOCKED_ITEMS}}', BLOCKED_ITEM_EXAMPLES.join(', '))
    .replace('{{SKILL_LIBRARY}}', pointLibrary),
  checkStep: read('check-step.md'),
  summary: read('summary.md'),
};

const block = (text: string) => '```text\n' + text + '\n```';

// Output fields, from the same schemas the API validates against.
function typeName(p: { type?: string | string[]; enum?: string[]; items?: { type?: string }; anyOf?: unknown[] }): string {
  if (p.enum) return p.enum.map((v) => `"${v}"`).join(' or ');
  if (p.anyOf) return 'object or null';
  const types = Array.isArray(p.type) ? p.type : [p.type ?? 'object'];
  return types.map((t) => (t === 'array' ? `array of ${p.items?.type ?? 'objects'}s` : t)).join(' or ');
}
function fields(schema: z.ZodType) {
  const json = z.toJSONSchema(schema) as { properties?: Record<string, Parameters<typeof typeName>[0]> };
  return Object.entries(json.properties ?? {})
    .map(([name, p]) => `| \`${name}\` | ${typeName(p)} |`)
    .join('\n');
}
const fieldTable = (schema: z.ZodType) => `| Field | Type |\n|---|---|\n${fields(schema)}`;

const doc = `# Companion: AI Prompts

- **Team:** Spectrum & Waves
- **Challenge:** ASU Spark Center North American AI Challenge 2026
- **Repository:** https://github.com/C-ollo/skill-passport (prompt source files in \`/prompts\`)

This document lists every prompt Companion sends to the AI, exactly as the model receives it, with placeholders filled in. It is generated from the code by \`scripts/build-prompts-doc.ts\`.

## 1. Overview

| | |
|---|---|
| **Model** | Claude Opus 5.5 (\`anthropic.claude-opus-5-5\`) on Amazon Bedrock, us-east-1 |
| **How prompts are built** | Every system prompt = the shared **persona and style rules** (section 3) + a **task prompt** (sections 4–7). The system prompt is the same for every request to a task, so it is cached. |
| **Output format** | **Structured outputs:** the model must return JSON that matches a fixed schema (listed per task). The app never parses free text. |
| **Thinking** | Adaptive thinking, with effort set per task (low for fast, interactive tasks). |
| **Photos** | Sent as an image block, resized on the phone to about 1024 px. Used for that request only and never stored. |
| **Guardrails** | Written into the prompts **and enforced in code** after every reply (section 8), so a wrong model answer can't bypass them. |

| Task | Used in the app | Endpoint | Effort | Max output tokens |
|---|---|---|---|---|
| Point & Ask: identify | Point & Ask, "Does this look right?" | \`POST /point-ask/identify\` | low | 1,500 |
| Point & Ask: steps | Point & Ask, step-by-step guidance | \`POST /point-ask/steps\` | low | 3,500 |
| Log matching | Voice or text logging | \`POST /log/parse\` | low | 2,000 |
| Check my step | Built; not in the current demo | \`POST /check-step\` | low | 1,500 |
| Monthly summary | Built; not in the current demo | \`POST /summary\` | medium | 4,000 |

## 2. Workflow (how the prompts chain together)

**Point & Ask**
1. The person takes or uploads a photo.
2. The app sends **two requests at the same time**, with the same photo and the goal *"Show me how to use this, step by step."*: **identify** and **steps**. Identify is short, so "Does this look right?" appears in about 4 seconds while the basic steps are still being written.
3. **Code checks** the identify answer: safety-blocked items go to the safety screen; confidence below 0.7 shows "I'm not sure. I won't guess."
4. The person confirms, then says what they want to do (typed, spoken, or a tapped idea). If they choose "Just show me the basics", the steps already loaded are used. Otherwise the app asks for the **steps again with their words** as the goal, adding *"The person confirmed this is: [item]. Write steps for it."*
5. If the identify and basic steps answers **disagree on the item**, the app also asks for the steps again with the confirmed item.
6. The steps are shown one at a time. After the last step, the identify answer's \`skill_id\` and \`item_name\` pre-fill a My Skills entry, which the person reviews and saves.

**Logging:** the person speaks or types what they did. The words go to **log matching**. If \`skill_id\` is \`none\` or confidence is below 0.6, the app asks the person to choose the skill. Otherwise it shows the match for the person to confirm and save.

**Read aloud** uses Amazon Polly (a text-to-speech service, not a language model). See section 9.

## 3. Persona and style rules (prepended to every system prompt)

${block(style)}

## 4. Point & Ask (identify and steps)

Both parts use the same system prompt. The user message says which part is wanted, and a separate output schema enforces it.

### System prompt

${block(prompts.pointAsk)}

### User message (dynamic)

An image block (the photo) followed by:

${block(`This is the identify part.        <- or: This is the steps part.
[steps only, when re-asking] The person confirmed this is: "<item_name>". Write steps for it.
What the person wants to do: "<goal, e.g. Show me how to use this, step by step. / Wash my bedsheets>"
Skills already in their My Skills record: [{"skill":"Washing Machine Laundry","level":"on_my_own","learnedOn":"Top-loading washer at the teaching apartment"}, ...]`)}

### Output: identify part

${fieldTable(PointAskIdentifySchema)}

### Output: steps part

${fieldTable(PointAskStepsSchema)}

Each step has: \`step_title\`, \`action\`, \`where\`, \`box\` (highlight position as fractions of the photo, or null), \`done_when\`, \`hint\`, \`caution\`.

## 5. Log matching (voice or text)

### System prompt

${block(prompts.logParse)}

### User message (dynamic)

${block(`What the person said: "<their words, e.g. I washed my clothes today, my phone reminded me to add soap>"
Level they chose: <with_help | with_prompt | on_my_own>      <- or: They did not choose a level.
Their current My Skills record: [{"skillId":"laundry","level":"on_my_own"}, ...]`)}

### Output

${fieldTable(LogParseResultSchema)}

## 6. Check my step (built; not in the current demo)

### System prompt

${block(prompts.checkStep)}

### User message (dynamic)

An image block (a camera frame) followed by:

${block(`Step: "<the step's action>"
Done when: "<the step's done_when>"`)}

### Output

${fieldTable(CheckStepResultSchema)}

## 7. Monthly summary (built; not in the current demo)

### System prompt

${block(prompts.summary)}

### User message (dynamic)

${block(`Month: <e.g. November 2026>
Logs, oldest first: [{"at":"2026-11-02T10:00:00Z","skillName":"Washing Machine Laundry","level":"with_prompt","place":"My Apartment"}, ...]`)}

### Output

${fieldTable(SummaryResultSchema)}

## 8. Guardrails enforced in code

These run on every reply in \`services/api/src/lib/guards.ts\`, whatever the model returns:

- **Safety block:** if the item name matches stove, oven, cooktop, burner, heater, fireplace, electrical, or medication, **no steps are ever returned** and the app shows its safety screen. Microwaves are allowed.
- **Won't guess:** Point & Ask confidence below **0.7** returns no steps and an "I'm not sure" reason.
- **Valid skills only:** \`skill_id\` and \`next_skill_id\` must exist in the skill library, or they become \`none\`.
- **Highlight boxes:** boxes outside the photo, or empty, are removed (a wrong box is worse than none).
- **Refusals:** if the model declines, the app gets a safe "I'm not sure, let's ask someone you trust" reply instead of an error.
- **Request limits:** text and image sizes are validated; the API is rate-limited (no sign-in yet).
- **Privacy:** request bodies (photos, words) are never logged or stored.
- **Human in control:** the app never saves to My Skills or sends a photo to a support person without the person tapping to confirm.

## 9. Read aloud (Amazon Polly, not a language model)

Text from the screen is sent to \`POST /speak\` and read with the neural voice "Ruth" at 90% speed:

${block('<speak><prosody rate="90%">[text from the screen, with &, <, >, quotes escaped]</prosody></speak>')}

If Polly fails or the phone is offline, the phone's built-in voice reads it instead. Voice typing uses the browser's own speech recognition; no prompt is involved.

## 10. Skill library (as inserted into prompts)

${SKILLS.map((s) => `- **${s.name}** (\`${s.id}\`): ${s.description}`).join('\n')}
`;

const out = path.join(root, 'docs', 'ai-prompts.md');
fs.writeFileSync(out, doc);
console.log('wrote', out, `(${doc.split(/\s+/).length} words)`);
