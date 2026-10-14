/* End-to-end English UI and real WebGL smoke tests. */
const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const engine = await import("../src/engine.ts");
  const { SLOTS, SHOP, CLASSES, ZONES, RACES, COMPANIONS, forgeItem } =
    await import("../src/content.ts");
  const root = path.resolve(__dirname, "../dist");
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/favicon.ico") {
      res.writeHead(204).end();
      return;
    }
    const file = path.resolve(root, "." + (url === "/" ? "/index.html" : url));
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
            : file.endsWith(".wav")
              ? "audio/wav"
              : file.endsWith(".png")
                ? "image/png"
                : "application/octet-stream",
      );
      res.end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser, lastPage;
  const errors = [];
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CHROMIUM_PATH
        ? { executablePath: process.env.CHROMIUM_PATH }
        : {}),
      args: [
        "--no-sandbox",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    });
    const open = async (fixture) => {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      });
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      if (fixture)
        await page.addInitScript(
          (s) => localStorage.setItem("leonidas-v3-save-v2", JSON.stringify(s)),
          fixture,
        );
      await page.goto(origin);
      lastPage = page;
      return page;
    };
    const saved = async (page) => {
      await page.waitForTimeout(100);
      return JSON.parse(
        await page.evaluate(() => localStorage.getItem("leonidas-v3-save-v2")),
      );
    };
    const nav = async (page, name) => {
      await page
        .getByRole("button", { name: `Open ${name}`, exact: true })
        .click();
    };
    const webgl = async (page) => {
      const canvas = page.locator("canvas");
      await canvas.waitFor();
      await canvas.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const c = document.querySelector("canvas");
        return c && c.width > 0 && c.height > 0 && !!c.getContext("webgl2");
      });
      // Read the composited frame, since low-power/WebGL buffers may clear after presentation.
      for (let attempt = 0; attempt < 20; attempt++) {
        const png = PNG.sync.read(await canvas.screenshot());
        const colors = new Set();
        for (let i = 0; i < png.data.length; i += 16)
          colors.add(`${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`);
        if (colors.size > 50) return;
        await page.waitForTimeout(150);
      }
      throw new Error(
        "WebGL context exists but no detailed 3D frame was presented",
      );
    };
    const top = async (page) =>
      page.evaluate(() =>
        document.querySelectorAll("*").forEach((el) => {
          if (el.scrollTop) el.scrollTop = 0;
        }),
      );
    fs.mkdirSync("artifacts/screenshots", { recursive: true });
    let page = await open();
    await page
      .getByRole("button", { name: "Select Mage", exact: true })
      .click();
    await webgl(page);
    await page
      .getByRole("button", { name: "Begin as Starweaver", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Pause expedition", exact: true })
      .click();
    await webgl(page);
    await nav(page, "Hero");
    assert.equal(
      await page.getByText("Empty slot", { exact: true }).count(),
      16,
    );
    await page
      .getByRole("button", { name: "Hair color 3", exact: true })
      .click();
    await page.getByRole("button", { name: "Twin tails", exact: true }).click();
    assert.equal((await saved(page)).appearance.hair, 2);
    for (const name of ["Bag", "Quests", "Shop", "Settings", "Adventure"])
      await nav(page, name);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.reload();
    await page
      .getByRole("button", { name: "Pause expedition", exact: true })
      .click();
    assert.equal((await saved(page)).classId, "mage");
    assert.equal((await saved(page)).appearance.style, 2);
    console.log(
      "PASS: English class selection, real WebGL pixels, all panels, 16 icons/slots, customization and save/reload",
    );
    await page.close();

    let s = engine.createState("shapeshifter");
    s.level = 8;
    s.gold = 2000;
    s.hp = engine.stats(s).hp;
    s.enemyHp = 10000;
    s.settings.effects = false;
    s.bosses = ["woods"];
    s.daily.kills = 20;
    s.daily.bosses = 1;
    s.daily.loot = 3;
    s.lastSeen = Date.now() - 3600000;
    s.bags = 2;
    for (const slot of SLOTS)
      s.inventory.push({
        ...SHOP[0],
        id: "fixture-" + slot,
        name: "Dawn " + slot,
        slot,
        rarity: ["epic", "rare", "uncommon"][SLOTS.indexOf(slot) % 3],
        weaponStyle: slot === "weapon" ? "staff" : undefined,
      });
    page = await open(s);
    await page
      .getByRole("button", { name: "Collect offline rewards", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Pause expedition", exact: true })
      .click();
    await nav(page, "Bag");
    await page
      .getByRole("button", { name: "Equip Dawn weapon", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Equip Dawn chest", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Equip Dawn helmet", exact: true })
      .click();
    await nav(page, "Hero");
    await webgl(page);
    await top(page);
    await page.screenshot({ path: "artifacts/screenshots/hero-3d.png" });
    assert.equal((await saved(page)).gear.weapon.rarity, "epic");
    // All class models, weapon styles, and class switching exercise the real renderer.
    for (const c of CLASSES) {
      if (c.id !== "shapeshifter")
        await page
          .getByRole("button", { name: c.archetype, exact: true })
          .click();
      await webgl(page);
    }
    await page
      .getByRole("button", { name: "Shapeshifter", exact: true })
      .click();
    await nav(page, "Adventure");
    await page
      .getByRole("button", { name: "Resume expedition", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Bear Form · Cast", exact: true })
      .click();
    await page.getByText(/BEAR FORM/).waitFor();
    await webgl(page);
    await page
      .getByRole("button", { name: "Pause expedition", exact: true })
      .click();
    await top(page);
    await page.screenshot({ path: "artifacts/screenshots/bear-form.png" });
    await nav(page, "Quests");
    await page
      .getByRole("button", { name: "Claim chapter reward", exact: true })
      .click();
    for (const name of ["Push Back the Mist", "One Less Crown", "Relic Hunter"])
      await page
        .getByRole("button", { name: `Claim ${name}`, exact: true })
        .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Already collected", exact: true })
        .count(),
      3,
    );
    await nav(page, "Shop");
    await page
      .getByRole("button", { name: "Buy · 120 gold", exact: true })
      .click();
    await nav(page, "Settings");
    await page
      .getByRole("button", { name: "Low graphics off", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Sound effects off", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Sound effects on", exact: true })
      .click();
    await nav(page, "Adventure");
    await page
      .getByRole("button", { name: "Open world map", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Travel to Ashen Ruins", exact: true })
      .click();
    await page.getByText("Ashen Ruins", { exact: true }).waitFor();
    await webgl(page);
    await top(page);
    await page.screenshot({ path: "artifacts/screenshots/adventure-3d.png" });
    await page.setViewportSize({ width: 320, height: 740 });
    await nav(page, "Hero");
    await webgl(page);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({ path: "artifacts/screenshots/hero-320.png" });
    await page.close();
    console.log(
      "PASS: all 14 3D class models, weapon/armor equipment, rarities, shapeshift cast, dailies, story, shop, settings and 320px layout",
    );

    for (let zone = 0; zone < ZONES.length; zone++) {
      const bossState = engine.createState("mage");
      bossState.level = ZONES[zone].level;
      bossState.zone = zone;
      bossState.wave = 10;
      bossState.enemyHp = engine.enemyMax(bossState);
      bossState.hp = engine.stats(bossState).hp;
      bossState.settings.effects = false;
      page = await open(bossState);
      await page
        .getByRole("button", { name: "Pause expedition", exact: true })
        .click();
      await webgl(page);
      await page
        .getByRole("button", { name: "Resume expedition", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Ember Lance · Cast", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Pause expedition", exact: true })
        .click();
      assert.ok((await saved(page)).combat.cooldowns["ember-lance"] > 0);
      await top(page);
      await page.screenshot({
        path: `artifacts/screenshots/boss-${zone + 1}.png`,
      });
      await page.close();
    }
    console.log(
      "PASS: all eight boss models and offensive spell buttons/cooldowns render and work",
    );

    // Damage labels must follow the actual actors through the 3D camera.
    const damageState = engine.createState("mage");
    damageState.level = 28;
    damageState.zone = 7;
    damageState.wave = 10;
    damageState.enemyHp = engine.enemyMax(damageState);
    damageState.hp = engine.stats(damageState).hp;
    damageState.settings.effects = false;
    page = await open(damageState);
    await page
      .getByRole("button", { name: "Pause expedition", exact: true })
      .click();
    await webgl(page);
    const damagePositions = async () => {
      await page
        .getByRole("button", { name: "Resume expedition", exact: true })
        .click();
      await page.waitForTimeout(1400);
      await page
        .getByRole("button", { name: "Pause expedition", exact: true })
        .click();
      const dealt = await page
        .getByLabel(/^Damage to enemy:/)
        .last()
        .boundingBox();
      const received = await page
        .getByLabel(/^Damage to hero:/)
        .last()
        .boundingBox();
      assert.ok(
        dealt && received,
        "Both outgoing and incoming damage must be displayed",
      );
      return { dealt, received };
    };
    let positions = await damagePositions();
    assert.ok(
      positions.dealt.x > positions.received.x + 20,
      "Overview damage must belong to the enemy on the right and hero on the left",
    );
    await page.screenshot({
      path: "artifacts/screenshots/projected-damage-overview.png",
    });
    await page
      .getByRole("button", { name: "Switch to third person", exact: true })
      .click();
    await page.waitForTimeout(1800);
    positions = await damagePositions();
    assert.ok(
      positions.dealt.y < positions.received.y,
      "Third-person damage must belong to the foe ahead and hero in the foreground",
    );
    await page.screenshot({
      path: "artifacts/screenshots/projected-damage-third.png",
    });
    await page.close();
    console.log(
      "PASS: incoming/outgoing damage follows the correct 3D actors in overview and third person",
    );

    // Play the new 0.4 frontier, cameras, heritage, factions and companions through actual controls.
    s = engine.createState("ranger");
    s.level = 28;
    s.gold = 5000;
    s.hp = engine.stats(s).hp;
    s.settings.effects = false;
    s.gear = Object.fromEntries(
      [
        "weapon",
        "helmet",
        "chest",
        "shoulders",
        "boots",
        "cloak",
        "offhand",
      ].map((slot, i) => [slot, forgeItem(6, slot, "epic", i, "bow")]),
    );
    s.world.mode = "explore";
    page = await open(s);
    await webgl(page);
    const height = await page
      .locator("canvas")
      .evaluate((c) => c.getBoundingClientRect().height);
    assert.ok(height > 450, `Gameplay canvas must be large; got ${height}`);
    await page
      .getByRole("button", { name: "Switch to third person", exact: true })
      .click();
    await page.waitForTimeout(1800);
    await webgl(page);
    await page.getByRole("button", { name: "Move east", exact: true }).click();
    await page.screenshot({ path: "artifacts/screenshots/third-person.png" });
    await page
      .getByRole("button", { name: "Open world map", exact: true })
      .click();
    await page.screenshot({ path: "artifacts/screenshots/world-atlas.png" });
    const cache = engine.regionNodes(s).find((n) => n.kind === "cache");
    await page
      .getByRole("button", { name: `Walk to ${cache.name}`, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Open cache", exact: true })
      .click({ timeout: 15000 });
    const afterCache = await saved(page);
    assert.ok(afterCache.world.visited.includes(cache.id));
    assert.ok(afterCache.gold > 5000);
    await page
      .getByRole("button", { name: "Switch to overview", exact: true })
      .click();
    await page.waitForTimeout(1800);
    await page.screenshot({
      path: "artifacts/screenshots/exploration-overview.png",
    });
    await nav(page, "Hero");
    for (const race of RACES) {
      await page.getByRole("button", { name: race.name, exact: true }).click();
      assert.equal((await saved(page)).race, race.id);
      await webgl(page);
    }
    await page
      .getByRole("button", { name: "Umbral Pact", exact: true })
      .click();
    assert.equal((await saved(page)).faction, "pact");
    await page.screenshot({
      path: "artifacts/screenshots/drakari-wardrobe.png",
    });
    await nav(page, "Shop");
    await page
      .getByRole("button", { name: "Companion lodge", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Hire Mossfang · 180 gold", exact: true })
      .click();
    assert.equal((await saved(page)).companions.active, "moss");
    await page
      .getByRole("button", { name: "Hire Lumen Wisp · 300 gold", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Bring Lumen Wisp", exact: true })
      .click();
    assert.equal((await saved(page)).companions.active, "lumen");
    await nav(page, "Adventure");
    await webgl(page);
    await page
      .getByRole("button", { name: "Return to combat", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Pause expedition", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Position right", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Stance Balanced", exact: true })
      .click();
    const tactical = await saved(page);
    assert.equal(tactical.tactics.lane, 1);
    assert.equal(tactical.tactics.stance, "assault");
    await page.screenshot({
      path: "artifacts/screenshots/tactical-combat.png",
    });
    await page.setViewportSize({ width: 320, height: 740 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page
      .getByRole("button", { name: "Switch to third person", exact: true })
      .click();
    await page.waitForTimeout(1200);
    await webgl(page);
    await page.screenshot({
      path: "artifacts/screenshots/third-person-320.png",
    });
    await page.close();
    console.log(
      "PASS: large gameplay viewport, playable third person, aerial camera swap, procedural walk-to-site/cache, six rendered races, faction choice, companion hiring/switching and tactical position/stance",
    );

    // A real v2 structure must enter the new app without going through character creation.
    s = engine.createState("bard");
    s.version = 2;
    s.level = 5;
    s.gold = 450;
    s.bosses = ["woods"];
    s.settings.effects = false;
    delete s.appearance;
    delete s.settings;
    delete s.combat;
    delete s.lastBoss;
    page = await open(s);
    await page
      .getByRole("button", { name: "Pause expedition", exact: true })
      .click();
    const migrated = await saved(page);
    assert.equal(migrated.version, 4);
    assert.equal(migrated.level, 5);
    assert.equal(migrated.gold, 450);
    assert.deepEqual(migrated.bosses, ["woods"]);
    await webgl(page);
    await page.close();
    assert.deepEqual(errors, []);
    console.log(
      "PASS: 0.2.0 save migrated in the actual UI, no JavaScript or WebGL errors",
    );
  } catch (error) {
    console.error("Browser errors:", errors);
    if (lastPage) {
      await lastPage.screenshot({ path: "artifacts/screenshots/failure.png" });
      console.error(
        await lastPage.evaluate(() => {
          const c = document.querySelector("canvas");
          return {
            canvas: c
              ? {
                  width: c.width,
                  height: c.height,
                  rect: c.getBoundingClientRect().toJSON(),
                }
              : null,
            text: document.body.innerText.slice(0, 1200),
          };
        }),
      );
    }
    throw error;
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
