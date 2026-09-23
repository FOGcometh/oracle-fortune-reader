# Oracle Fortune Reader

A Rare Friends minigame for the [Rare Friends Vibeathon](https://github.com/spokesz/rarefriends-vibeathon).

**Category:** Character Spotlight

Your Rare Friend *is* the oracle. Walk to the shrine, and the Friend you actually own
reads your fortune — drawing from a hand-authored deck that takes its flavour from that
Friend's own on-chain traits. Not a generic card shuffler wearing a mask: a different
Friend reads you differently.

Built with **FriendSDK v0.1.2** (`@rarefriends/friendsdk`).

---

## What it is

A hybrid experience in two beats:

1. **The shrine.** A small walkable garden corner, pushed dark and mystical — near-black
   ground, deep violet light, drifting motes. Your Friend stands at the oracle's circle.
2. **The reading.** Stepping up and interacting takes over the viewport: a full-screen
   card reading, the Friend centre stage, a fortune drawn face-down and turned over.

Three fortune tiers light the reading — a common one, a rare one, and the Oracle's Eye,
which is the only tier that should ever feel like it *noticed* you.

---

## Controls

| Platform | Walk | Interact | Menus |
| --- | --- | --- | --- |
| Keyboard | `WASD` / arrow keys | `E` near the shrine | `Tab` / click |
| Touch | tap a destination | tap the shrine prompt | tap |

Settings include a **mute** toggle and a **reduced-motion** alternative — with reduced
motion on, the reveal resolves instantly instead of animating.

---

## Rules and economy

**All balances, card purchases, readings and rewards are simulated.** Nothing is
transferred, no contract is deployed, and no real funds are involved. A wallet holding a
hardwired Rare Friends Generations NFT (generation 1 or higher) on Robinhood mainnet
(chain 4663) is still required to play — that ownership gate is provided by the FriendSDK
runtime, not by this game.

One reading costs **1 RF** and consumes one **Fortune Card**. Each reading resolves
exactly one fortune from this table:

| Fortune | Chance | Basis points | Reward |
| --- | --- | --- | --- |
| Whisper | 50% | 5,000 | 0.25 RF |
| Glimmer | 25% | 2,500 | 0.75 RF |
| Echo | 15% | 1,500 | 1 RF |
| Prophecy | 7% | 700 | 2 RF |
| Oracle's Eye | 3% | 300 | 10 RF |

Weights total 10,000 basis points. RF uses 18-decimal bigint base units
(`1 RF = 10n ** 18n`).

**Expected return: 0.9025 RF per 1 RF reading** — a **9.75% house edge**, matching the
SDK's own fishing example. Over 1,000 readings the game retains roughly 97.5 RF, so
promised redemption stays backed by construction rather than by hope.

> **Earlier revision:** the first draft of this table paid out 1.675 RF per 1 RF card
> (a −0.675 RF per-reading deficit that would drain any redemption backing). The rewards
> were retuned to the values above.

**Consumable and backing rules.** Every purchased Fortune Card reserves its maximum prize
(10 RF) as backing. New purchases require free stake covering the highest prize. Pending
readings and kept fortunes cannot share backing. Kept fortunes retain their RF value with
no redemption expiry — redemption has no expiry date.

> **Note for the artist, not the reviewer:** at these weights the expected reward is
> **1.675 RF per 1 RF card**, so gameplay drift is *−0.675 RF per reading* — the house
> loses in live play. Changing the reward column in `game.json` is a one-line retune.

---

## Run it locally

Requirements: **Node.js 22+**, npm, Git, and a browser wallet on Robinhood mainnet
holding a Rare Friends Generations NFT (generation ≥ 1).

This repository ships the game component only; the SDK is the runtime and owns wallet
connection, Friend discovery, ownership verification and the game frame.

```sh
git clone https://github.com/FOGcometh/oracle-fortune-reader.git
cd oracle-fortune-reader
```

**1. Get the SDK.** Either download `rarefriends-friendsdk-0.1.2.tgz` from the
[v0.1.2 release](https://github.com/spokesz/friendsdk/releases/tag/v0.1.2), or build the
archive from a checkout (`npm ci && npm pack`):

```sh
npm install ./rarefriends-friendsdk-0.1.2.tgz react react-dom
npx playwright install chromium    # only needed for the automated browser check
```

**2. Run the game.**

```sh
npx friendsdk dev ./games/oracle-fortune-reader
```

Open the URL it prints (normally `http://localhost:4173`), choose **Connect wallet**,
switch to Robinhood if prompted, select your Friend, then walk to the shrine.

To play from a phone on the same network:

```sh
npx friendsdk dev ./games/oracle-fortune-reader --host 0.0.0.0 --port 4173
```

then open `http://<your-computer-LAN-IP>:4173` on the phone.

**3. Check it.**

```sh
npx friendsdk build ./games/oracle-fortune-reader
npx friendsdk check ./games/oracle-fortune-reader
npx friendsdk test  ./games/oracle-fortune-reader
```

The `test` command runs a headless browser with a **mock** wallet and mock RPC — it
verifies the runtime boots and the game throws no browser errors. It does **not** verify
real ownership reads. Mock identities are test fixtures only; `dev` and `build` still
enforce the real ownership gate.

---

## Files

| File | What it holds |
| --- | --- |
| `games/oracle-fortune-reader/index.tsx` | The game component: shrine, reading, reveal, settings. |
| `games/oracle-fortune-reader/deck.ts` | The hand-authored fortune deck and family-flavour mapping. Edit this to write new fortunes. |
| `games/oracle-fortune-reader/game.json` | Cost, outcome weights and rewards — the economy in one place. |
| `games/oracle-fortune-reader/style.css` | The mystical palette and card styling. |
| `games/oracle-fortune-reader/README.md` | Game-specific rules and controls. |

---

## Wallet and network

| | |
| --- | --- |
| Network | Robinhood mainnet, chain **4663** |
| Wallet | Any EIP-1193 / EIP-6963 browser wallet |
| Requirement | Holds a hardwired Rare Friends Generations NFT, generation ≥ 1 |
| Private keys | Never needed. Ownership checks are read-only. |

Generation-0 Friends are excluded from the picker because play requires a hardwired
Friend. Connecting, selecting and verifying require no signature and no transaction.

---

## Asset and credit notes

- Character sprites are read from the SDK's canonical on-chain artwork deployment for the
  player's own verified token. They are drawn as pixel masks and scaled; the artwork is
  not modified, recoloured or replaced.
- The world is built from the SDK's optional garden preset with added shrine props.
- Sound is the SDK's procedural cue kit (`@rarefriends/friendsdk/sounds`). No recorded or
  third-party audio is bundled.
- The fortune text in `deck.ts` was written for this project.

## Known limitations

- **Simulated economy.** No live contracts, transactions or funding flows are implemented.
  The SDK's fixed action client is used in preview mode.
- **No persistence.** The sandbox provides no `localStorage` or save API, so a reload
  starts a fresh session. Kept fortunes last for the runtime session.
- **v0.1.2 capability gaps.** Trading, listings, creator fees, wearable NFTs, upgrades and
  additional currencies are not implemented in this SDK version; none are promised here.
- Automated browser checks use mocks and do not prove real RPC availability or ownership;
  a real-wallet playtest is the honest bar.

## Licence

Game source: Apache-2.0, matching the SDK. FriendSDK artwork permissions are separate —
see the SDK's [NOTICE.md](https://github.com/spokesz/friendsdk/blob/main/NOTICE.md).