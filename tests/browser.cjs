/* Cloud smoke test. Run `npm run test:ui` after `npx playwright install chromium`. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const engine = await import("../src/engine.ts");
  const { SLOTS, SHOP } = await import("../src/content.ts");
  const root = path.resolve(__dirname, "../dist");
  const server = http.createServer((req, res) => {
    const file = path.resolve(
      root,
      "." +
        decodeURIComponent(
          req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0],
        ),
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end();
        return;
      }
      res.setHeader(
        "Content-Type",
        file.endsWith(".js")
          ? "application/javascript"
          : file.endsWith(".html")
            ? "text/html"
            : "application/octet-stream",
      );
      res.end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    args: ["--no-sandbox"],
  });
  const errors = [];
  try {
    let page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.clock.install();
    await page.goto(origin);
    await page.getByText("Sterrenwever", { exact: true }).click();
    await page.getByRole("button", { name: "Pauzeer expeditie" }).click();
    await page.getByText("Held", { exact: true }).click();
    await page.getByText("16 gearslots", { exact: false }).waitFor();
    assert.equal(
      await page.getByText("Leeg slot", { exact: true }).count(),
      16,
    );
    for (const name of ["Bags", "Quests", "Shop", "Avontuur"])
      await page.getByText(name, { exact: true }).click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.reload();
    await page.getByText("Avontuur", { exact: true }).waitFor();
    assert.equal(
      await page.getByText("Kies jouw daglicht.", { exact: true }).count(),
      0,
    );
    await page.getByRole("button", { name: "Pauzeer expeditie" }).click();
    const save = JSON.parse(
      await page.evaluate(() => localStorage.getItem("leonidas-v3-save-v2")),
    );
    assert.equal(save.classId, "mage");
    console.log(
      "PASS: class selection, all panels, 16 slots, local save/reload, 390px layout",
    );

    // A fixture enters the real app through the same storage path as a returning player.
    let s = engine.createState("warrior");
    s.level = 8;
    s.gold = 1000;
    s.bosses = ["woods"];
    s.daily.kills = 20;
    s.daily.bosses = 1;
    s.daily.loot = 3;
    s.run.choicePending = true;
    s.wave = 4;
    s.enemyHp = engine.enemyMax(s);
    s.lastSeen = Date.now() - 3600000;
    for (const slot of SLOTS)
      s.inventory.push({ ...SHOP[0], id: "fixture-" + slot, slot });
    s.bags = 2;
    await page.close();
    page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(
      (s) => localStorage.setItem("leonidas-v3-save-v2", JSON.stringify(s)),
      s,
    );
    await page.goto(origin);
    await page
      .getByRole("button", { name: "Verzamel beloningen", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Verzamel beloningen", exact: true })
        .count(),
      0,
    );
    await page
      .getByRole("button", {
        name: "Zonnescherf · +6 aanval deze run",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Pauzeer expeditie" }).click();
    await page.getByText("Bags", { exact: true }).click();
    await page
      .getByRole("button", { name: "Uitrusten", exact: true })
      .first()
      .click();
    await page.getByText("Held", { exact: true }).click();
    await page.getByRole("button", { name: "Afleggen", exact: true }).click();
    await page.getByText("Quests", { exact: true }).click();
    await page
      .getByRole("button", { name: "Claim hoofdstukbeloning", exact: true })
      .click();
    for (let i = 0; i < 3; i++)
      await page
        .getByRole("button", { name: "Claim daily", exact: true })
        .first()
        .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Al verzameld", exact: true })
        .count(),
      3,
    );
    await page.getByText("Shop", { exact: true }).click();
    await page
      .getByRole("button", { name: "Koop · 120 goud", exact: true })
      .click();
    await page.getByText("Avontuur", { exact: true }).click();
    await page.getByText(/2\. Asgrauwe Ruïnes/).click();
    await page.getByText("Asgrauwe Ruïnes", { exact: true }).waitFor();
    await page.getByText(/1\. Het Fluisterwoud/).click();
    fs.mkdirSync("artifacts/screenshots", { recursive: true });
    await page.evaluate(() =>
      document.querySelectorAll("*").forEach((el) => {
        if (el.scrollTop) el.scrollTop = 0;
      }),
    );
    await page.screenshot({
      path: "artifacts/screenshots/adventure.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 320, height: 740 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.getByText("Held", { exact: true }).click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: "artifacts/screenshots/gear-320.png",
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      "PASS: offline claim, blessings, equip/unequip, story + 3 dailies, shop, zone switching, 320px layout; no JS errors",
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
