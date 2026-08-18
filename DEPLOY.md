# Deploy NFL Picks to AWS (Production)

This guide deploys the **full stack** to AWS:

- **Amazon Cognito** — invite-only family login
- **AWS AppSync + DynamoDB** — shared picks storage
- **Amplify Hosting** — production PWA at a public URL

The repo is a monorepo. Amplify reads `amplify.yml` at the root and deploys two apps:

| Amplify app root | What it deploys |
|------------------|-----------------|
| `apps/picks` | Backend + NFL Picks PWA |
| `.` (repo root) | Marketing site only |

---

## 1. Install AWS CLI

```bash
brew install awscli
aws configure
```

Use an IAM user or SSO role with permission to manage Amplify, Cognito, CloudFormation, and AppSync.

---

## 2. Connect GitHub in Amplify Console

1. Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. **Create new app** → **Host web app**
3. Connect **GitHub** → select `JoshRTheDeveloper/therothservices.20`
4. Amplify detects the monorepo from `amplify.yml`

### Create the Picks app (full stack)

1. When prompted for the app, choose **monorepo** setup
2. Set **App root** to: `apps/picks`
3. Branch: `main` (or your production branch)
4. Amplify uses the `applications` entry for `appRoot: apps/picks` in `amplify.yml`
5. Confirm build settings show **backend** + **frontend** phases
6. Deploy

First deploy takes **10–20 minutes** (CloudFormation creates Cognito, AppSync, DynamoDB).

When it finishes, Amplify gives you a URL like:

`https://main.d1234abcdef.amplifyapp.com`

### Marketing site (optional, separate Amplify app)

Create a **second** Amplify app from the same repo with **App root** `.` (repo root). That app is frontend-only and keeps serving the marketing site.

---

## 3. Verify the backend deployed

After the picks app build succeeds:

1. In Amplify Console → your picks app → **Backend environments**
2. Confirm Auth and Data resources exist
3. The build log should show `ampx pipeline-deploy` succeeded
4. `amplify_outputs.json` is generated during the backend phase (not committed to git)

---

## 4. Create family Cognito users

Self sign-up is **disabled**. Add each family member manually:

1. AWS Console → **Cognito** → User pools → select the pool created by Amplify
2. **Users** → **Create user**
3. Set **email** and a temp password
4. Set **Preferred username** to their display name (`Josh`, `Stewphon`, `timathack`, etc.) — this is what standings show
5. Send them the temp password; they set a new one on first login

---

## 5. Custom domain (optional)

In Amplify Console → picks app → **Domain management**:

1. Add domain (e.g. `picks.therothservices.com`)
2. Follow DNS instructions (CNAME in Route 53 or your registrar)
3. Amplify provisions HTTPS automatically

---

## 6. Local dev against production backend

After the first AWS deploy, pull outputs to your laptop:

```bash
cd ~/Desktop/Projects/therothservices.20
npm install
npx ampx generate outputs --branch main --app-id YOUR_AMPLIFY_APP_ID
cd apps/picks
npm install
npm run dev
```

Find **App ID** in Amplify Console → App overview.

---

## 7. Ongoing updates

Push to `main` → Amplify automatically:

1. Runs `npx ampx pipeline-deploy` (updates Cognito/AppSync if schema changed)
2. Builds and publishes the picks PWA

No manual deploy steps after CI is connected.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Deploy picks API" screen | Backend build failed or `Pick` model not deployed — check Amplify build logs |
| Blank page after deploy | Wrong `baseDirectory` — should be `dist` under `apps/picks` |
| Sign-in fails | User not created in Cognito, or wrong app URL (use the **picks** Amplify app URL) |
| Standings empty | No picks locked in yet, or ESPN scoreboard fetch blocked |

---

## Cost estimate

For a small family app:

- **Amplify Hosting** — free tier covers low traffic
- **Cognito** — free tier for <50k MAU
- **AppSync + DynamoDB** — pennies/month at family scale

Expect **~$0–5/month** unless traffic grows significantly.
