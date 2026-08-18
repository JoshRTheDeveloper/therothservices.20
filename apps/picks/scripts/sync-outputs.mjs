import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const picksRoot = join(here, "..");
const repoRoot = join(picksRoot, "../..");
const source = join(repoRoot, "amplify_outputs.json");
const target = join(picksRoot, "amplify_outputs.json");
const example = join(picksRoot, "amplify_outputs.example.json");

if (existsSync(source)) {
  copyFileSync(source, target);
  console.log("Synced amplify_outputs.json from repo root.");
  process.exit(0);
}

if (existsSync(example)) {
  copyFileSync(example, target);
  console.warn(
    "Using amplify_outputs.example.json — deploy the Amplify backend for production auth."
  );
  process.exit(0);
}

console.warn("No amplify_outputs.json found — run npx ampx sandbox or deploy to AWS.");
