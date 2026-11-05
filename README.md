# Companion (Skill Passport + Point & Ask)

**Help with anything new, anywhere, and proof of what you can do.** Companion is a calm,
plain-language app that helps autistic adults and people with intellectual or developmental
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
| `apps/web` | The Companion app: React + Vite PWA, installable on phones and desktops. Imported from the designer's repo with history |
| `packages/shared` | Shared TypeScript types, the starter skill library, and level/stamp rules |
| `services/api` | AWS Lambda handlers that call Claude on Amazon Bedrock |
| `infra` | AWS CDK stack: HTTP API, Lambda functions, DynamoDB for share links |
| `prompts` | Every system prompt the AI uses (source for our AI-prompts PDF) |
| `docs` | Problem statement and design notes |

## Architecture

```
Phone or browser (Companion PWA, apps/web)
 ├─ Passport data stored on the device (the person owns it)
 ├─ Camera, read aloud, voice or text logging
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

### App (apps/web)

```bash
cd apps/web
npx vite                     # dev server on http://localhost:8443
VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com npx vite build
```

Without `VITE_API_URL`, the app runs its built-in sample flows (no AI calls). With it set,
Point & Ask and voice/text logging use the real API. The designer's screens and copy are kept;
see `apps/web/README.md` for the product description.

Design updates from the designer's repo come in with:

```bash
git subtree pull --prefix=apps/web https://github.com/skbosire-art/Companion.git main
```

### Backend (AWS CDK)

You need AWS credentials for the target account, with model access enabled in Bedrock for
Claude Opus 5.5 (`anthropic.claude-opus-5-5`) in `us-east-1`.

```bash
cd infra
npx cdk bootstrap      # once per account and region
npx cdk diff           # see what will be created
npx cdk deploy         # prints ApiUrl; put it in VITE_API_URL
npx cdk destroy        # remove everything
```

The stack creates an HTTP API (rate-limited, since there's no sign-in yet), seven Lambda
functions, one DynamoDB table for share links, and the web app on S3 + CloudFront (HTTPS,
which the phone camera needs).

**Deploying the web app:** build it with the API URL first, then deploy. CDK uploads
`apps/web/dist` if it exists and prints the public `WebUrl`:

```bash
cd apps/web && VITE_API_URL=<ApiUrl> npx vite build && cd ../../infra && npx cdk deploy
```

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

- **UI design:** the Companion interface in `apps/web` was designed by our team's designer
  (GitHub: skbosire-art) using Figma Make, Figma's AI-assisted app builder, and imported here
  with its full commit history from https://github.com/skbosire-art/Companion.
- **AI assistance:** we used Claude Code (Anthropic) as a coding assistant to help scaffold the
  repository structure, the backend, and the code connecting the app to the API. Commits made with its help carry a
  `Co-Authored-By: Claude` trailer. Every change is reviewed, tested, and explainable by a
  team member.
- **AI in the product:** Claude Opus 5.5 via Amazon Bedrock. All prompts are in
  [`prompts/`](prompts/).
- **Partner research:** First Place AZ (site visit, Oct 27, 2026).
- **Libraries:** listed in each package's `package.json`.

## License

MIT. See [LICENSE](LICENSE).
