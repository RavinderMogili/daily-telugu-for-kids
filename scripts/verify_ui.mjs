// Manual verification script for the picture activities.
// Requires the dev server running on :8080 and playwright + chromium.
// Usage: bun run dev &  then  node scripts/verify_ui.mjs
// Captures screenshots into shots/ and prints a checklist result.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:8080";
const shots = "shots";
mkdirSync(shots, { recursive: true });

const results = [];
const check = (name, ok) => {
  results.push([name, ok]);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
};

const browser = await chromium.launch();

async function run(width, height, tag) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("pageerror", (e) => console.log(`PAGEERROR ${tag}:`, e.message));

  // Profile creation
  await page.goto(`${BASE}/profiles`, { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Anu");
  await page.screenshot({ path: `${shots}/${tag}-profiles.png` });
  await page.getByRole("button", { name: "Add child" }).click();
  await page.waitForTimeout(600);

  // Pictures hub
  await page.goto(`${BASE}/pictures`, { waitUntil: "networkidle" });
  check(`${tag} pictures hub shows 3 activities`, (await page.getByRole("button", { name: /Listen and choose|Picture and word|Build the word/ }).count()) === 3);
  await page.screenshot({ path: `${shots}/${tag}-pictures-hub.png` });

  // Activity 1: Listen and choose — pick wrong then correct
  await page.getByRole("button", { name: /Listen and choose/ }).click();
  await page.waitForTimeout(400);
  const listenButtons = page.locator("button[aria-label^='Picture:']");
  check(`${tag} listen: 4 picture options`, (await listenButtons.count()) === 4);
  await page.screenshot({ path: `${shots}/${tag}-listen.png` });
  // click a wrong option first if there is more than one enabled
  await listenButtons.nth(0).click();
  await page.waitForTimeout(300);
  const feedback1 = await page.locator("[aria-live]").first().textContent();
  check(`${tag} listen: feedback after pick`, !!feedback1 && feedback1.length > 0);

  // Activity 2: Picture and word
  await page.goto(`${BASE}/pictures`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Picture and word/ }).click();
  await page.waitForTimeout(400);
  check(`${tag} see: picture shown`, await page.locator("[role='img']").first().isVisible());
  await page.screenshot({ path: `${shots}/${tag}-see.png` });

  // Activity 3: Build the word
  await page.goto(`${BASE}/pictures`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Build the word/ }).click();
  await page.waitForTimeout(400);
  const tileCount = await page.locator("button.te").count();
  check(`${tag} build: tiles rendered`, tileCount >= 2);
  await page.screenshot({ path: `${shots}/${tag}-build.png` });

  // Audio file availability check (server-side)
  const audio = await page.evaluate(async () => {
    const r = await fetch("/audio/a000.mp3", { method: "HEAD" });
    return r.status;
  });
  check(`${tag} audio file served`, audio === 200);

  await page.close();
}

await run(1280, 800, "desktop");
await run(390, 844, "mobile");

const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
process.exit(failed.length ? 1 : 0);
