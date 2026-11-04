# Prompts

Every system prompt Skill Passport sends to the model lives here. These files are bundled into
the Lambda functions as-is, so what you read here is exactly what the model receives. This
folder is also the source for our AI-prompts PDF deliverable.

| File | Used by | What it does |
|---|---|---|
| `shared-style.md` | All prompts (prepended) | Voice, tone, and plain-language rules for every reply |
| `log-parse.md` | `POST /log/parse` | Maps a person's own words to a skill and a support level |
| `point-ask.md` | `POST /point-ask` | Looks at a photo, checks what it sees, and writes steps |
| `check-step.md` | `POST /check-step` | Checks a camera frame against the current step |
| `summary.md` | `POST /summary` | Writes the monthly "My month" summary |

**Guardrails are also enforced in code** (`services/api/src/lib/guards.ts`): blocked
appliances (stoves, ovens, heaters, electrical, medication) never get steps, unsupported
appliances never get steps, and low-confidence answers never get steps, whatever the model
returns.

**Model:** Claude Opus 5.5 on Amazon Bedrock (`anthropic.claude-opus-5-5`), with structured
outputs so every reply matches the schemas in `packages/shared/src/ai-schemas.ts`.
