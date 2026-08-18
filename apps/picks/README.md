# Roth Family NFL Picks (PWA)

Standalone app under `apps/picks` — separate from the marketing site at the repo root.

Uses the shared Amplify Gen 2 backend at `/amplify` (Cognito + AppSync `Pick` model).

## Production (AWS)

**Full deploy guide:** [DEPLOY.md](../../DEPLOY.md) at the repo root.

Quick summary:

1. Connect this repo in **AWS Amplify Console**
2. Create an app with **App root** = `apps/picks`
3. Push to `main` — Amplify deploys Cognito, AppSync, and the hosted PWA
4. Create family users in **Cognito** (invite-only)

## Local development

### Against a deployed AWS backend

```bash
# From repo root — pull production/staging outputs
npx ampx generate outputs --branch main --app-id YOUR_AMPLIFY_APP_ID

cd apps/picks
npm install
npm run dev
```

Opens on [http://127.0.0.1:5174](http://127.0.0.1:5174).

### Sandbox (personal AWS dev stack)

```bash
# From repo root
npx ampx sandbox

cd apps/picks
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## What's included

- Amplify Authenticator (email login, sign-up hidden)
- Cloud picks via Amplify Data (`Pick`: season, seasonType, week, gameId, pickedTeamAbbr, pickerName)
- Shared family standings (W/L/Open, straight-up winners)
- ESPN NFL scoreboard fetch
- Week + season-type selector and ticket-stub winner picks
- Installable PWA via `vite-plugin-pwa`

## How standings work

- Every locked pick is saved to AppSync under the signed-in family member.
- All authenticated users can read everyone's picks.
- Standings compare each pick to ESPN final scores for that week.
- Ties and unfinished games stay in the **Open** column.

## Note

ESPN's scoreboard API is unofficial/public and may change. If browser CORS blocks direct calls, add a small Amplify Function proxy next.
