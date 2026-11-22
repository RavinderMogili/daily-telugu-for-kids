// Manual verification script for the picture activities.
// Requires the dev server running and playwright + chromium.
// Usage: bun run dev &  then  node scripts/verify_ui.mjs
// Defaults to :8080; override with UI_BASE=http://localhost:8081
// Captures screenshots into shots/ and prints a checklist result.
// "mobile" contexts use a real touchscreen (hasTouch) so taps go through
// the same code paths as a phone.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.UI_BASE || "http://localhost:8080";
const shots = "shots";
mkdirSync(shots, { recursive: true });

const results = [];
const check = (name, ok) => {
  results.push([name, ok]);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
};

const browser = await chromium.launch();

const readProgress = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("daily-telugu-v2") ?? "{}"));

async function run(width, height, tag, touch) {
  const page = await browser.newPage({
    viewport: { width, height },
    hasTouch: touch,
    isMobile: touch,
  });
  const tap = (loc) => (touch ? loc.tap() : loc.click());
  page.on("pageerror", (e) => console.log(`PAGEERROR ${tag}:`, e.message));

  // Profile creation
  await page.goto(`${BASE}/profiles`, { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Anu");
  await page.screenshot({ path: `${shots}/${tag}-profiles.png` });
  await tap(page.getByRole("button", { name: "Add child" }));
  await page.waitForTimeout(600);

  // Pictures hub
  await page.goto(`${BASE}/pictures`, { waitUntil: "networkidle" });
  check(
    `${tag} hub shows 3 activities`,
    (await page
      .getByRole("button", { name: /Listen and choose|Picture and word|Build the word/ })
      .count()) === 3,
  );
  check(
    `${tag} hub shows difficulty labels`,
    await page.getByText(/L1 - no reading needed/).isVisible(),
  );
  await page.screenshot({ path: `${shots}/${tag}-pictures-hub.png` });

  // Activity 1: Listen and choose - audio replay, wrong pick feedback, retry
  await tap(page.getByRole("button", { name: /Listen and choose/ }));
  await page.waitForTimeout(400);
  // Audio replay: play button exists and clicking it does not show the
  // "not available" fallback (clip file is served).
  await tap(page.getByRole("button", { name: "Play word" }));
  await page.waitForTimeout(400);
  const missing = await page.getByText(/isn't available yet/).count();
  check(`${tag} listen: audio replays without fallback`, missing === 0);

  const options = page.locator("button[aria-label^='Picture of']");
  check(`${tag} listen: 4 picture options`, (await options.count()) === 4);
  check(
    `${tag} listen: options have no visible text labels`,
    (await options.nth(0).textContent()).trim() === "",
  );
  // Identify the correct button: it is the one whose aria-label matches the
  // word we cannot know; instead click all four in sequence until correct,
  // checking that a wrong pick shows retry feedback and gives NO point.
  let sawWrong = false;
  for (let k = 0; k < 4; k++) {
    await tap(options.nth(k));
    await page.waitForTimeout(250);
    const live = (await page.locator("[aria-live]").first().textContent()) ?? "";
    if (/Try again/.test(live)) sawWrong = true;
    if (/Correct/.test(live)) break;
  }
  check(`${tag} listen: correct answer reachable`, await page.getByText(/Correct/).isVisible());
  if (sawWrong) {
    const st = await readProgress(page);
    const pid = Object.keys(st.progress ?? {})[0];
    const today = new Date()
      .toLocaleDateString("en-CA", {
        timeZone: "America/Halifax",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-");
    const pts = st.progress?.[pid]?.practice?.[today]?.points ?? 0;
    check(`${tag} listen: wrong-then-right retry earns no point`, pts === 0);
  }
  await page.screenshot({ path: `${shots}/${tag}-listen.png` });

  // Activity 2: Picture and word
  await page.goto(`${BASE}/pictures`, { waitUntil: "networkidle" });
  await tap(page.getByRole("button", { name: /Picture and word/ }));
  await page.waitForTimeout(400);
  check(
    `${tag} see: illustration shown`,
    await page.locator("img[alt^='Picture of']").first().isVisible(),
  );
  const wordOpts = page.locator("button.te");
  check(`${tag} see: 4 telugu word options`, (await wordOpts.count()) === 4);
  await page.screenshot({ path: `${shots}/${tag}-see.png` });

  // Activity 3: Build the word - tiles render, placed tiles removable
  await page.goto(`${BASE}/pictures`, { waitUntil: "networkidle" });
  await tap(page.getByRole("button", { name: /Build the word/ }));
  await page.waitForTimeout(400);
  const tileButtons = page.locator("div.flex.flex-wrap button.te");
  check(`${tag} build: tiles rendered`, (await tileButtons.count()) >= 2);
  await tap(tileButtons.nth(0));
  await page.waitForTimeout(200);
  const placed = await page.locator("[aria-label^='Remove']").count();
  check(`${tag} build: tile placement works`, placed === 1);
  await page.screenshot({ path: `${shots}/${tag}-build.png` });

  // Audio review checklist page
  await page.goto(`${BASE}/audio-review`, { waitUntil: "networkidle" });
  const rows = await page.locator("li .te").count();
  check(`${tag} audio-review lists all clips`, rows >= 60);
  await tap(page.getByRole("button", { name: "OK" }).first());
  await page.waitForTimeout(200);
  check(
    `${tag} audio-review: marks persist`,
    (await page.evaluate(() => localStorage.getItem("daily-telugu-audio-review")))?.includes("ok"),
  );

  // Storage integrity: no duplicate awarded qids
  const st = await readProgress(page);
  const dup = Object.values(st.progress ?? {}).some((pr) =>
    Object.values(pr.practice ?? {}).some((d) => new Set(d.awarded).size !== d.awarded.length),
  );
  check(`${tag} storage: no duplicate awarded qids`, !dup);

  await page.close();
}

await run(1280, 800, "desktop", false);
await run(390, 844, "mobile", true);

const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
process.exit(failed.length ? 1 : 0);
