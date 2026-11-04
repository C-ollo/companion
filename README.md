# Skill Passport

An AI-powered tool that helps people with autism or intellectual and developmental
disabilities (IDD) build independent-living skills and carry them into new places.

Built by **Spectrum & Waves** for the 2026 ASU Spark Center North American AI Challenge, with
customer research from our Challenge Partner, **First Place AZ**.

## The problem

People with autism or IDD build real independent-living skills, but they often lack an
accessible way to see and track their own progress. Skills learned in one setting also may not
carry over when the environment, tools, or context change. See
[`docs/proposal.md`](docs/proposal.md) for the full problem statement and partner research.

## What it does

- **Skill Passport:** log everyday tasks by voice, text, or a quick tap, alone or with a
  support person. The AI turns logs into a personal record of how much help each skill still
  needs (*With help*, *With a prompt*, *On my own*) and suggests a next skill.
- **Point & Ask:** point the phone camera at an unfamiliar appliance and say what you want to
  do. The AI checks what it sees first, explains what's the same and different from what you
  already know, and guides you one step at a time. If it's unsure, it says so instead of
  guessing and helps you reach someone you trust.
- **You own it:** the passport lives on your phone, and you choose who sees it: family,
  staff, a friend, or no one.

## Repository layout

| Path | What it is |
|---|---|
| `apps/mobile` | Expo (React Native) app: iOS, Android and web from one codebase (coming once the UI design is final) |
| `packages/shared` | Shared TypeScript types, the starter skill library, and level/stamp rules |
| `services/api` | AWS Lambda handlers that call Claude on Amazon Bedrock |
| `infra` | AWS CDK stack: HTTP API, Lambda functions, DynamoDB for share links |
| `prompts` | Every system prompt the AI uses (source for our AI-prompts PDF) |
| `docs` | Problem statement and design notes |

## Architecture

```
Phone or browser (Expo app)
 ├─ Passport data stored on the device (the person owns it)
 ├─ Camera, text-to-speech, voice input
 └─ HTTPS ──► API Gateway (HTTP API)
               ├─ POST /log/parse      ─► Lambda ─► Bedrock: Claude Opus 5.5
               ├─ POST /point-ask      ─► Lambda ─► Bedrock: Claude Opus 5.5 (image + text)
               ├─ POST /check-step     ─► Lambda ─► Bedrock: Claude Opus 5.5 (image + text)
               ├─ POST /summary        ─► Lambda ─► Bedrock: Claude Opus 5.5
               └─ /share               ─► Lambda ─► DynamoDB (share snapshots the owner can delete)
```

Photos are processed in memory and never stored by our app.

## Getting started

Requires Node 20+, npm, and (for the backend) an AWS account with Bedrock access to
`anthropic.claude-opus-5-5`.

```bash
npm install
cp .env.example .env   # fill in values
npm test               # unit tests (no AWS calls)
```

### Backend (AWS CDK)

You need AWS credentials for the target account, with model access enabled in Bedrock for
Claude Opus 5.5 (`anthropic.claude-opus-5-5`) in `us-east-1`.

```bash
cd infra
npx cdk bootstrap      # once per account and region
npx cdk diff           # see what will be created
npx cdk deploy         # prints ApiUrl; put it in EXPO_PUBLIC_API_URL
npx cdk destroy        # remove everything
```

The stack creates an HTTP API (rate-limited, since there's no sign-in yet), seven Lambda
functions, and one DynamoDB table for share links.

**Live model test** (costs a fraction of a cent):

```bash
cd services/api
RUN_BEDROCK_TESTS=1 AWS_REGION=us-east-1 npx vitest run log-parse.bedrock
```

### API

| Route | Does |
|---|---|
| `POST /log/parse` | `{ text, level?, passport[] }` → skill, support level, confidence, reply, next skill |
| `POST /point-ask` | `{ imageBase64, goal, knownSkills[] }` → what it sees, same/different, steps (or "not sure") |
| `POST /check-step` | `{ imageBase64, action, done_when }` → `done` / `not_yet` / `not_sure`, what it sees, tip |
| `POST /summary` | `{ month, logs[] }` → did, getting stronger, new places, ideas for next month |
| `POST /share` | `{ recipients[], snapshot }` → `{ id, deleteToken }` |
| `GET /share/{id}` | Read-only shared snapshot |
| `DELETE /share/{id}` | Stop sharing (header `x-delete-token`) |

Request and response shapes are in `packages/shared/src/ai-schemas.ts`.

## Team

Spectrum & Waves: Collins Kimutai, Ida Gachoki, Lucy Juma, Sandrah Bosire.

## Attribution

- **AI assistance:** we used Claude Code (Anthropic) as a coding assistant to help scaffold the
  repository structure and draft parts of the code. Commits made with its help carry a
  `Co-Authored-By: Claude` trailer. Every change is reviewed, tested, and explainable by a
  team member.
- **AI in the product:** Claude Opus 5.5 via Amazon Bedrock. All prompts are in
  [`prompts/`](prompts/).
- **Partner research:** First Place AZ (site visit, Oct 27, 2026).
- **Libraries:** listed in each package's `package.json`.

## License

MIT. See [LICENSE](LICENSE).
