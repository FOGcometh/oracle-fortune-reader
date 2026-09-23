/**
 * Focused interaction check for the Oracle Fortune Reader:
 * walkable shrine -> full-screen reading -> settled tier -> kept card -> redeem.
 *
 * Run from the SDK root (or this game directory):
 *   node --test games/oracle-fortune-reader/test/interaction.test.mjs
 *
 * It uses the SDK's exported `testGame` helper, so the ordinary runtime, the
 * mock wallet, mock Robinhood RPC responses and sample canonical sprites are
 * supplied by the SDK. Two details of that harness shape the expectations here:
 * browser entropy is pinned to the 1500 bps roll bucket, so sample Friend #7730
 * settles on the first tier, and the trusted runtime asks for its own preview
 * confirmation on every buy, play and redeem.
 *
 * Every RF figure here is DERIVED from game.json rather than hardcoded, so
 * retuning the economy can never leave this test asserting yesterday's numbers.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { testGame } from "@rarefriends/friendsdk/testing";

const GAME = "games/oracle-fortune-reader";
const DEFINITION = JSON.parse(readFileSync(new URL("../game.json", import.meta.url), "utf8"));
const RF_UNITS = 10n ** 18n;
/** The runtime's simulated preview balance (src/game-host.tsx: `20n * RF`). */
const START_BALANCE = 20n * RF_UNITS;

/** Render RF base units the way the game does: trim trailing zeros. */
function rf(value) {
  const whole = value / RF_UNITS, fraction = value % RF_UNITS;
  if (fraction === 0n) return `${whole} RF`;
  return `${whole}.${fraction.toString().padStart(18, "0").replace(/0+$/, "")} RF`;
}

const TIERS = Object.fromEntries(DEFINITION.outcomes.map(outcome =>
  [outcome.name, [`${outcome.chanceBps / 100}%`, rf(BigInt(outcome.reward))]]));
/** Balance after buying one card and keeping the first tier's reward. */
const AFTER_BUY = START_BALANCE - BigInt(DEFINITION.price);
const AFTER_REDEEM = AFTER_BUY + BigInt(DEFINITION.outcomes[0].reward);

/** Approve one trusted runtime confirmation (buy, play or redeem). */
async function confirm(page) {
  const menu = page.locator(".rf-frame-menu");
  await menu.waitFor();
  await menu.getByRole("button", { name: "Confirm preview", exact: true }).click();
  await menu.waitFor({ state: "hidden" });
}

test("the shrine opens a full-screen reading whose tier comes from the settled result", { timeout: 120_000 }, async () => {
  const result = await testGame(GAME, {
    width: Number(process.env.OFR_WIDTH ?? 960),
    check: async ({ game, page }) => {
      // The world and the Friend's artwork finish loading, and the shrine prompt is in reach.
      await game.locator(".rf-world-loading").waitFor({ state: "hidden" });
      const prompt = game.getByRole("button", { name: /Oracle shrine/ });
      await prompt.waitFor();
      for (let attempt = 0; attempt < 30 && (await prompt.isDisabled()); attempt++) await page.waitForTimeout(100);
      assert.equal(await prompt.isDisabled(), false, "The shrine prompt should be in reach from the spawn");

      // The simulated economy is labelled in the HUD.
      await game.getByText("Simulated", { exact: true }).waitFor();

      // Interact -> the reading is its own full-screen layer, not a GameMenu popup.
      await prompt.click();
      const reading = game.getByRole("dialog");
      await reading.waitFor();
      assert.equal(await game.locator(".rf-frame-menu").count(), 0, "The reading must not be an SDK menu popup");
      assert.equal(await reading.getAttribute("aria-modal"), "true");
      // The oracle is the player's own Friend: its family flavor comes from the artwork read.
      await reading.getByText(/Hoverer/).first().waitFor();

      // The world stops while a reading is open (paused prop + inert world container).
      const world = game.locator("canvas");
      assert.equal(await world.getAttribute("tabindex"), "-1", "The world is paused while the reading is open");
      const stillX = await world.getAttribute("data-x");
      const stillY = await world.getAttribute("data-y");
      await page.keyboard.down("ArrowDown");
      await page.waitForTimeout(250);
      await page.keyboard.up("ArrowDown");
      assert.deepEqual([await world.getAttribute("data-x"), await world.getAttribute("data-y")], [stillX, stillY], "The paused world must not move");

      // One card: buy and play need the runtime's own preview confirmation, then settle.
      await reading.getByRole("button", { name: /Draw one card/ }).click();
      await confirm(page);
      await confirm(page);
      const tier = game.locator(".ofr-card-tier");
      await tier.waitFor();
      const tierText = (await tier.textContent()) ?? "";
      const name = Object.keys(TIERS).find(candidate => tierText.startsWith(candidate));
      assert(name, `The reading must show one of the five settled tiers, saw: ${tierText}`);
      assert.equal(tierText, `${name} · ${TIERS[name][0]} · ${TIERS[name][1]}`, "The tier line must match the settled outcome's chance and value");
      const source = (await game.locator(".ofr-card-source").textContent()) ?? "";
      assert(source.includes("Hoverer"), `The card should credit the Friend family, saw: ${source}`);
      assert(source.includes("settled outcome #"), `The card should cite the settled outcome, saw: ${source}`);
      const omen = (await game.locator(".ofr-card-omen").textContent()) ?? "";
      const advice = (await game.locator(".ofr-card-advice").textContent()) ?? "";
      assert(omen.length > 20 && advice.length > 20, "The card needs real omen and advice text");

      // Optional visual capture for design review (never written unless asked for).
      if (process.env.OFR_SCREENSHOT) await page.screenshot({ path: process.env.OFR_SCREENSHOT });

      // The simulated purchase is reflected in the HUD balance (20 RF - 1 RF).
      await reading.getByRole("button", { name: /Keep this reading/ }).click();
      await reading.waitFor({ state: "hidden" });
      await game.getByText(rf(AFTER_BUY), { exact: true }).waitFor();
      await game.getByText("1 kept", { exact: true }).waitFor();

      // Walking still works after the reading: hold a direction and the Friend moves.
      const canvas = game.locator("canvas");
      await canvas.focus();
      const before = Number(await canvas.getAttribute("data-y"));
      await page.keyboard.down("ArrowDown");
      await page.waitForTimeout(350);
      await page.keyboard.up("ArrowDown");
      const after = Number(await canvas.getAttribute("data-y"));
      assert(after > before, `Walking should move the Friend (was ${before}, now ${after})`);

      // Redeeming the kept card returns its simulated RF and clears the kept count.
      await game.getByRole("button", { name: "Enter the shrine", exact: true }).click();
      await reading.waitFor();
      await reading.getByRole("button", { name: /Redeem kept cards/ }).click();
      await confirm(page);
      await game.getByText(rf(AFTER_REDEEM), { exact: true }).waitFor();
      assert.equal(await game.getByText("1 kept", { exact: true }).count(), 0, "The redeemed card is no longer kept");

      // Settings owns the mute toggle and the reduced-motion alternative.
      await reading.getByRole("button", { name: "Step back", exact: true }).click();
      await reading.waitFor({ state: "hidden" });
      await game.getByRole("button", { name: "Settings", exact: true }).click();
      await game.getByRole("button", { name: "Sound off", exact: true }).click();
      await game.getByRole("button", { name: "Sound on", exact: true }).waitFor();
      assert.equal(await game.getByRole("checkbox").isChecked(), true, "Reduced motion follows the OS preference in the test browser");
      await game.getByRole("button", { name: "Close Settings", exact: true }).click();
    },
  });
  assert.equal(result.friendId, "7730");
});