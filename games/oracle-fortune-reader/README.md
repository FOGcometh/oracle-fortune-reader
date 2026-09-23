# Oracle Fortune Reader

Category: **Character Spotlight**. Built with FriendSDK **v0.1.2** for the CLI
game layout (`index.tsx` + `game.json` + assets).

Builder: **lucymoran.eth** (GitHub: [FOGcometh](https://github.com/FOGcometh)) — the
Rare Friends community knows this builder by the `lucymoran.eth` wallet identity.

Your own Rare Friends Generations NFT **is the oracle**. A small shrine sits in a
dark corner of the supplied garden world; walk up to it, interact, and the view
is taken over by a full-screen tarot-style reading. The oracle's portrait is
drawn from your Friend's canonical 16 × 16 one-bit sprite masks, and the fortune
it speaks is flavored by your Friend's own family (`familyId` / `familyName`) and
seed — so two different Friends read differently from the same card.

## Run it

From a checkout or project with the SDK package installed:

```sh
npx friendsdk dev   games/oracle-fortune-reader     # local preview on http://127.0.0.1:4173
npx friendsdk build games/oracle-fortune-reader     # static output in games/oracle-fortune-reader/.friendsdk
npx friendsdk check games/oracle-fortune-reader     # game validation
npx friendsdk test  games/oracle-fortune-reader     # automated headless smoke check
node --test games/oracle-fortune-reader/test/interaction.test.mjs   # focused shrine -> reading interaction check
```

In an SDK checkout you can also use `npm run dev:game -- games/oracle-fortune-reader`.
The runtime requires a connected wallet whose account owns a hardwired
Generations NFT (generation ≥ 1); wallet connection, Friend discovery, the
ownership gate and the Friend list are supplied by the SDK runtime, never by this
component.

## Controls

| Input | Action |
| --- | --- |
| `W A S D` / arrow keys | Walk (while the world has focus) |
| Click / tap the ground | Walk to that point (collision-checked) |
| `E`, or the shrine prompt | Interact with the Oracle shrine |
| `Enter the shrine` (HUD button) | Open the reading without walking |
| `Esc` | Leave the reading |
| Tab / Shift+Tab | Move through the reading and the settings menu |

Mobile: everything is reachable by tap; the shrine prompt and every button are
at least 44 px tall, and a 360 px-wide viewport lays the reading out in a single
column with its own scrolling. Reduced motion (the OS `prefers-reduced-motion`
setting, or the Settings checkbox) skips the card turn, the floating oracle and
the drifting motes, and reveals the card instantly.

## Rules (exact)

| Rule | Value |
| --- | --- |
| Category | Character Spotlight |
| Cost | **1 RF** per card (`1000000000000000000` base units) |
| Consumable | `Fortune Card` — one card is exactly one reading |
| Price / rewards | All values are 18-decimal `bigint` RF base units |
| Backing | Each bought card reserves the maximum prize (10 RF) until it is settled; kept cards keep reserving their own fixed value |
| Rounding | No rounding anywhere: the tier's reward comes from `game.json` verbatim |
| Redemption | `redeem(outcomeId, 1n)` pays the card's fixed value back with no expiry |
| Pending readings | A play with `outcomeId === null` is resumed and settled by its existing id; it never costs a second card |

| Card (settled outcome) | Chance | Reward |
| --- | --- | --- |
| Whisper | 50% (5,000 bps) | 0.25 RF |
| Glimmer | 25% (2,500 bps) | 0.75 RF |
| Echo | 15% (1,500 bps) | 1 RF |
| Prophecy | 7% (700 bps) | 2 RF |
| Oracle's Eye | 3% (300 bps) | 10 RF |
| **Expected return** | — | **0.9025 RF per card** (9.75% edge) |

Weights total 10,000 basis points. The expected return is printed here for
review; the deck odds table inside the game shows chance, value and how many of
each card this Friend is keeping.

## Simulated economy — no transactions

Every RF amount, card, tier, kept card and redemption in this game is
**simulated by the SDK runtime's preview ledger**. The component only calls the
SDK's fixed action client (`read`, `canBuy`, `buy`, `play`, `settle`, `redeem`).
It does not connect a wallet, discover NFTs, gate ownership, hold a signer,
deploy contracts or send transactions, and the runtime still requires a
connected account owning a hardwired Generations Friend. The simulated ledger
lives for the session only; reloading resets it.

The tier the player is shown is taken from the settled `client.settle()`
result, never from browser randomness. The card's title, omen and advice are
chosen deterministically from the settled outcome id, the Friend's sprite seed
and the Friend's family name, so re-opening a reading shows the same fortune
instead of re-rolling it.

## Files

| File | Contents |
| --- | --- |
| `index.tsx` | The game component: walkable shrine, HUD, full-screen reading, action flow, accessibility |
| `deck.ts` | The hand-authored deck: 5 tiers, 72 fortunes (15/14/15/14/14), the family-flavor map and the deterministic `selectFortune` selector. Pure data + pure functions, no React |
| `game.json` | The chance-game definition: name, consumable, price and the five tiers |
| `style.css` | The shrine's palette (near-black ground, deep violet glow) and responsive layout |
| `test/interaction.test.mjs` | Focused interaction check for the shrine → reading flow, run through the SDK's exported `testGame` helper |

## Editing the deck

Open `deck.ts`. Each tier holds a list of `{ title, omen, advice }` fortunes in
second person — eerie, warm, folkloric. Add entries freely; `selectFortune`
picks by a deterministic hash of `tier id + seed + family name`, so more
fortunes simply means more variety. `FAMILY_FLAVOR` maps the SDK's
`GENERATION_FAMILY_NAMES` (Skeleton, Mask, Family, Cellular, Asymmetry, Hoverer,
Colossus, Sparkling, Hollow) to an epithet and an opening line; any other family
falls back to the neutral voice. Tier ids and order must stay aligned with the
`game.json` outcomes, because the tier comes from the settled outcome id.

## Accessibility and platform notes

- Loading state, error state with retry (session, action and artwork failures are
  reported with `role="alert"` and can be retried without reloading).
- Mute toggle in Settings and in the HUD; the sound kit is created muted and only
  unlocks inside a user gesture.
- Reduced motion: OS preference and an in-game checkbox.
- Keyboard and touch controls, `Esc` to close, focus moves into the reading and
  returns to the prompt when it closes.
- The runtime's `paused` prop stops world movement and disables every action
  button; the runtime's own menus always win.
- All UI stays inside the sandboxed frame. No storage APIs, no parent-page
  access, no popups, no navigation, no headers/footers/landing pages.
- An epoch counter plus an action lock means a stale async result can never land
  after unmount or a Friend/client change; the sound kit is disposed and the
  world animation is cancelled on cleanup.

Canonical Friend artwork (the one-bit sprite masks) is used with permission
under the SDK's `NOTICE.md`. The garden world preset, the world renderer and the
frame/menu components are SDK building blocks; the shrine palette, layout and
deck are this game's own.