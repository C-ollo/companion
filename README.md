# Companion

**Help with anything new, anywhere, and proof of what you can do.**

Companion is a calm, plain-language app for autistic adults and people with intellectual or
developmental disabilities (IDD). Point your phone at something unfamiliar, like a new washer,
a café kiosk or a ticket machine, and get short, step-by-step help that builds on what you
already know. Every skill you do is saved to **My Skills**, a record that belongs to you and
goes with you when you move.

Built by **Spectrum & Waves** for the 2026 ASU Spark Center North American AI Challenge, with
our Challenge Partner **First Place AZ**.

**▶ Live app: https://d3r4ulgn9zwehn.cloudfront.net**

| | |
|---|---|
| Live app | https://d3r4ulgn9zwehn.cloudfront.net (open it on a phone) |
| AI prompts | [`docs/ai-prompts.pdf`](docs/ai-prompts.pdf), generated from [`prompts/`](prompts/) |
| Problem statement and partner research | [`docs/proposal.md`](docs/proposal.md) |
| UI design source | https://github.com/skbosire-art/Companion |

---

## Contents

- [Try it](#try-it)
- [The problem](#the-problem)
- [What it does](#what-it-does)
- [What's real and what's sample data](#whats-real-and-whats-sample-data)
- [Technical walkthrough](#technical-walkthrough)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Run it locally](#run-it-locally)
- [Deploy to AWS](#deploy-to-aws)
- [API reference](#api-reference)
- [Team and attribution](#team-and-attribution)

---

## Try it

1. Open **https://d3r4ulgn9zwehn.cloudfront.net** on your phone. It also works on a laptop.
2. Optional: add it to your home screen. It's an installable web app (PWA).
3. Tap **Point & Ask → Open camera** and allow the camera.
4. Point at an appliance or screen, like a washer, microwave, coffee machine or kiosk, and tap
   **Capture Photo**. You can also tap **Upload photo instead**.
5. Check what it found, tap **Yes, that's right**, then type or say what you want to do, for
   example *"wash my bedsheets"*. You can also tap an idea, or tap **Just show me the basics**.
6. Follow the steps. Tap **Read this step aloud** on any step. When you finish, review the entry
   and tap **Save to My Skills**.

Things to notice:

- **Safety block:** photograph a stove, heater or medicine. Companion will not give steps and
  offers to contact someone you trust.
- **Won't guess:** a blurry or unclear photo gets *"I'm not sure. I won't guess."*

The first request after a quiet spell can take a few extra seconds while the servers start.

---

## The problem

On our visit to First Place AZ, staff and residents showed us two gaps:

1. **Skills don't travel.** First Place's teaching kitchen uses the *exact same stove* as the
   apartments, because a skill learned on one appliance often doesn't carry over to another.
   After someone moves, the washer, the stove and the touchscreens are all different.
2. **Progress belongs to staff, not the person.** Residents rely on staff to know how they're
   doing, and staff rarely have time to say "here's what you learned this month."

Existing tools don't close these gaps. Task planners break tasks into steps, and camera apps
describe what they see, but none of them know what *you* already know. More than 100,000
Arizonans with autism or IDD will never have a program like First Place.

## What it does

**Point & Ask: help in the moment**

- **Checks first.** "I think this is a front-loading washing machine. Does this look right?"
  Nothing happens until the person confirms.
- **Builds on what you know.** "You already know this: Washing Machine Laundry. You learned it
  on a top-loading washer. This one is a different type." Then it lists what's the same and
  what's different.
- **Asks what you want to do.** The person can type it, say it, or tap an idea.
- **Guides one step at a time** in plain words: what to do, where to look (a blue box on the
  photo), and how you'll know it worked. Every step can be read aloud, and there's no timer.
- **Ask someone you trust.** If the person gets stuck, they can send the photo and the step
  they're on to a support person. They see exactly what will be sent and choose to send it.
- **Safe by design.** Stoves, ovens, heaters, electrical work and medication are never guided.
  When the AI is unsure, it says so.

**My Skills: a record that belongs to the person**

- At the end of Point & Ask, the app fills in a My Skills entry: the skill, the new place, and
  the help used ("With AI help"). The person reviews it and taps to save.
- Log everyday tasks by voice or text. The AI matches the person's own words to a skill and
  they confirm it.
- Three help levels, and every one counts: **With someone · With AI help · By myself**. There
  are no streaks to lose and no "failed".
- Practice routines step by step, and get cheers from supporters.
- It's stored on the person's own phone, and they choose who sees it.

**Accessibility throughout:** plain language, read aloud on every screen, voice typing, large
tap targets, a calm low-stimulation design, and no time pressure.

## What's real and what's sample data

| Real and working | Sample data or prototype |
|---|---|
| Point & Ask with real AI: check first, "you already know this", same and different, your own goal, step-by-step guidance with a highlight box | Stamp totals, monthly summary, Official Skills Record |
| Safety block and "won't guess", enforced in code | Supporters and cheers on My People |
| Voice and text logging matched to skills by AI | Supporters receiving requests *in the app* (today they're sent by text, through the phone's share menu) |
| Read aloud (Amazon Polly) and voice typing | |
| Saving to My Skills, stored on the phone | |

---

## Technical walkthrough

### Architecture

```
Phone (Companion PWA, apps/web)                     AWS (infra/, us-east-1)
┌──────────────────────────────────┐
│ React 19 + Vite, installable PWA │  HTTPS  ┌────────────────────────────┐
│ My Skills in localStorage        │ ──────► │ CloudFront + S3 (the app)  │
│ Camera (getUserMedia)            │         └────────────────────────────┘
│ Voice typing (Web Speech API)    │         ┌────────────────────────────┐
│ Photo resized on the phone       │ ──────► │ API Gateway HTTP API       │
└──────────────────────────────────┘  JSON   │ (rate limited, CORS)       │
                                             └─────────────┬──────────────┘
                                                           │
                   ┌──────────────────────┬────────────────┼──────────────┬────────────────┐
                   ▼                      ▼                ▼              ▼                ▼
          /point-ask/identify   /point-ask/steps     /log/parse       /speak          /share
          Lambda                Lambda               Lambda           Lambda          Lambda
             │                     │                    │                │               │
             └──────────┬──────────┴────────────────────┘                ▼               ▼
                        ▼                                           Amazon Polly      DynamoDB
          Claude Opus 5.5 on Amazon Bedrock                         (neural voice)
          structured outputs + code guardrails
```

Each route is its own Lambda function (Node.js 22, TypeScript, bundled with esbuild), so each
one gets only the permissions it needs. The AI functions can call Bedrock, `/speak` can call
Polly, and the share functions can reach only their DynamoDB table.

### Point & Ask, request by request

```
Photo ──► resized on the phone to ~1024 px JPEG
      ├─► POST /point-ask/identify ──► "Does this look right?" (~4 s)
      └─► POST /point-ask/steps    ──► basic steps (~8 s, loading in the background)

Person taps "Yes" ──► "What do you want to do with it?"
      ├─ "Just show me the basics" ──► basic steps (already loaded, instant)
      └─ types or says a goal ──► POST /point-ask/steps again, with their words
                                   and the item they confirmed
```

1. **Two requests at once.** Identifying is short, so the check appears in about 4 seconds
   while the longer steps are still being written. This cut the wait from about 27 seconds
   (one big request) to about 4.
2. **Agreement check.** If the identify and steps answers name different items, the app asks
   for the steps again for the item the person was shown (`confirmedItem`).
3. **What you already know.** Each request includes the skills the person already has:
   sample skills plus everything saved in My Skills, with where they learned each one. The AI
   uses this to say what's the same and what's different. The app shows "You already know
   this" when the photo matches one of those skills.
4. **The person's own goal.** After they confirm the item, their typed or spoken goal becomes
   the goal for a new steps request.
5. **Highlight box.** Each step can include a box, given as fractions of the photo. The photo
   is shown at its true shape so the box lines up.
6. **Save.** The identify answer's `skill_id` and `item_name` pre-fill the My Skills entry,
   which the person reviews before saving.

### How the AI is used

- **Model:** Claude Opus 5.5 on Amazon Bedrock, using the Anthropic Bedrock SDK
  (`@anthropic-ai/bedrock-sdk`).
- **Structured outputs:** every reply must match a zod schema in
  [`packages/shared/src/ai-schemas.ts`](packages/shared/src/ai-schemas.ts). The app never
  parses free text.
- **Prompts:** in [`prompts/`](prompts/). Every system prompt is the shared persona and
  plain-language rules ([`shared-style.md`](prompts/shared-style.md)) plus a task prompt. The
  system prompt is cached, since it's the same for every request to a task.
- **Effort:** adaptive thinking with low effort for the interactive tasks, to keep them fast.
- **Full prompt document:** [`docs/ai-prompts.pdf`](docs/ai-prompts.pdf), generated from the
  code with `npx tsx scripts/build-prompts-doc.ts`.

### Guardrails enforced in code

The AI is told these rules, and [`services/api/src/lib/guards.ts`](services/api/src/lib/guards.ts)
enforces them on every reply, whatever the model returns:

| Rule | How |
|---|---|
| Never guide dangerous items | If the item matches stove, oven, burner, heater, fireplace, electrical or medication, the reply has no steps and the app shows a safety screen worded for that kind of item. Microwaves are allowed. |
| Don't guess | A confidence below 0.7 means no steps, and the app shows "I'm not sure". |
| Valid skills only | Skill ids that aren't in the skill library become `none`. |
| No misleading boxes | Boxes that are empty or run off the photo are removed. |
| Safe refusals | If the model declines, the app gets a calm "let's ask someone you trust" reply instead of an error. |
| Person in control | Nothing is saved to My Skills, and no photo is sent to anyone, without the person tapping to confirm. |

### Privacy

- Photos are sent only for the current request. They're processed in memory, and the API never
  logs or stores them.
- My Skills is stored on the phone (`localStorage`). There is no account and no server-side
  copy.
- Voice typing uses the phone's built-in speech recognition. Companion never records audio.
- Asking a support person uses the phone's own share menu (SMS, WhatsApp and similar), and
  only after the person sees and approves the message.

### Read aloud and voice typing

- **Read aloud:** `POST /speak` uses Amazon Polly (neural voice *Ruth*, at 90% speed), so it
  sounds the same on every phone. If Polly is slow or the phone is offline, the phone's
  built-in voice reads it instead. On iOS, a silent clip is played inside the tap to unlock
  audio.
- **Voice typing:** the browser's Web Speech API. Words appear as they're spoken, and the
  person can edit them.

---

## Tech stack

| Layer | Tools |
|---|---|
| App | React 19, TypeScript, Vite 8, Tailwind CSS 4, `vite-plugin-pwa` (installable) |
| UI design | Figma Make (Figma's AI-assisted app builder) |
| AI | Claude Opus 5.5 on Amazon Bedrock, structured outputs (zod) |
| Speech | Amazon Polly (read aloud), Web Speech API (voice typing) |
| Backend | AWS Lambda (Node.js 22, TypeScript), API Gateway HTTP API, DynamoDB |
| Hosting | Amazon S3 + CloudFront (HTTPS, which the phone camera needs) |
| Infrastructure as code | AWS CDK (TypeScript) |
| Tests | Vitest |
| Monorepo | npm workspaces |

## Repository layout

| Path | What it is |
|---|---|
| [`apps/web`](apps/web) | The Companion app. Designed in Figma Make by our designer and imported with its full history (`git subtree`); we connected it to the backend. |
| [`packages/shared`](packages/shared) | Types and AI output schemas shared by the app and the API, the skill library, safety rules and level rules |
| [`services/api`](services/api) | Lambda handlers (`src/handlers`), the Bedrock client (`src/lib/bedrock.ts`) and the guardrails (`src/lib/guards.ts`) |
| [`infra`](infra) | AWS CDK stack: API, Lambda functions, DynamoDB, S3 + CloudFront |
| [`prompts`](prompts) | Every system prompt the AI receives |
| [`scripts`](scripts) | `build-prompts-doc.ts`, which generates `docs/ai-prompts.md` |
| [`docs`](docs) | Problem statement, partner research and the AI prompts document |

Key files in the app (`apps/web/src`):

| File | Does |
|---|---|
| `App.tsx` | The designer's screens, connected to the features below |
| `api.ts` | API calls and photo resizing |
| `point-ask-session.ts` | Point & Ask state: parallel identify and steps, agreement check, asking again with the person's goal |
| `passport-store.ts` | My Skills entries in `localStorage`, and the help-level labels |
| `log-session.ts` | Voice and text logging |
| `read-aloud.ts` | Polly playback, with the phone's voice as a fallback |
| `voice-typing.ts` | Web Speech API voice typing |
| `ask-friend.ts` | Asking a support person, through the phone's share menu |

---

## Run it locally

Requires **Node 20+** and npm.

```bash
git clone https://github.com/C-ollo/companion.git
cd companion
npm install
npm test                      # unit tests: guardrails and level rules (no AWS calls)
```

**App only, with sample flows and no AI:**

```bash
cd apps/web
npx vite                      # http://localhost:8443
```

**App connected to a deployed API (real AI):**

```bash
cd apps/web
VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com npx vite
```

Without `VITE_API_URL`, the app runs the designer's built-in sample flows. With it set,
Point & Ask, logging and read aloud use the real API. The camera needs HTTPS or `localhost`.

**Live model test** (needs AWS credentials with Bedrock access; costs a fraction of a cent):

```bash
cd services/api
RUN_BEDROCK_TESTS=1 AWS_REGION=us-east-1 npx vitest run log-parse.bedrock
```

## Deploy to AWS

You need an AWS account with Bedrock access to Claude Opus 5.5 (`anthropic.claude-opus-5-5`) in
`us-east-1`. See [`.env.example`](.env.example).

```bash
cd infra
npx cdk bootstrap             # once per account and region
npx cdk deploy                # prints ApiUrl and WebUrl
```

Then build the app with the API URL and deploy again, which uploads `apps/web/dist` to S3:

```bash
cd apps/web && VITE_API_URL=<ApiUrl> npx vite build && cd ../../infra && npx cdk deploy
```

`npx cdk destroy` removes everything. The API is rate limited (5 requests per second, bursts of
10) because there's no sign-in yet.

**Design updates** from the designer's repo come in with:

```bash
GIT_LFS_SKIP_SMUDGE=1 git subtree pull --prefix=apps/web https://github.com/skbosire-art/Companion.git main
git lfs fetch https://github.com/skbosire-art/Companion.git --all && git lfs checkout
```

## API reference

Request and response shapes are the zod schemas in
[`packages/shared/src/ai-schemas.ts`](packages/shared/src/ai-schemas.ts).

| Route | Request | Returns | Used in the app |
|---|---|---|---|
| `POST /point-ask/identify` | `imageBase64, goal, knownSkills[]` | item, skill, confidence, check statement, same and different | ✓ |
| `POST /point-ask/steps` | `imageBase64, goal, knownSkills[], confirmedItem?` | steps (action, where, box, done when, hint, caution) | ✓ |
| `POST /log/parse` | `text, level?, passport[]` | skill, help level, confidence, reply, next skill | ✓ |
| `POST /speak` | `text` | MP3 audio (Amazon Polly) | ✓ |
| `POST /point-ask` | `imageBase64, goal, knownSkills[]` | identify and steps in one call (older, slower) | |
| `POST /check-step` | `imageBase64, action, done_when` | `done`, `not_yet` or `not_sure`, with a tip | built, not in the demo |
| `POST /summary` | `month, logs[]` | monthly summary in plain words | built, not in the demo |
| `POST /share` · `GET` / `DELETE /share/{id}` | snapshot, recipients | share link the owner can delete | built, not in the demo |

---

## Team and attribution

**Spectrum & Waves:** Collins Kimutai, Ida Gachoki, Lucy Juma, Sandrah Bosire.

- **Challenge Partner:** First Place AZ. Site visit and customer research, Oct 27, 2026.
- **UI design:** the interface in `apps/web` was designed by our team's designer (GitHub:
  skbosire-art) in **Figma Make**, Figma's AI-assisted app builder. It is imported here with its
  full commit history from https://github.com/skbosire-art/Companion.
- **AI coding assistant:** we used **Claude Code** (Anthropic) to help build the backend, the
  infrastructure and the code connecting the app to the API. Commits made with its help carry a
  `Co-Authored-By: Claude` trailer. Every change was reviewed and tested by a team member.
- **AI in the product:** Claude Opus 5.5 on Amazon Bedrock. All prompts are in
  [`prompts/`](prompts/).
- **Libraries:** listed in each package's `package.json`.

## License

MIT. See [LICENSE](LICENSE).
