/**
 * Oracle Fortune Reader — the hand-authored fortune deck.
 *
 * Pure data plus two tiny pure selectors. No React, no browser APIs, no
 * randomness: the artist can edit this file to grow the deck without touching
 * the game component.
 *
 * Tiers map 1:1 onto the settled chance-game outcomes in `game.json`, in the
 * same order: Whisper (5000 bps), Glimmer (2500), Echo (1500), Prophecy (700),
 * Oracle's Eye (300). The tier the player is shown always comes from the
 * settled outcome id — never from browser randomness.
 */

/** Outcome ids are one-based and follow `game.json` order. */
export type FortuneTierId = "whisper" | "glimmer" | "echo" | "prophecy" | "oracle-eye";

export type Fortune = Readonly<{
  /** Card face name. */
  title: string;
  /** The omen itself, in the oracle's voice. Second person, at most ~120 characters. */
  omen: string;
  /** What the oracle asks of the reader. At most ~90 characters. */
  advice: string;
}>;

export type FortuneTier = Readonly<{
  id: FortuneTierId;
  /** One-based index into `game.json` outcomes. */
  outcomeId: number;
  /** Must match the `game.json` outcome name exactly. */
  name: string;
  numeral: string;
  /** A short note on how this tier speaks. */
  voice: string;
  fortunes: readonly Fortune[];
}>;

export type FamilyFlavor = Readonly<{
  /** How the oracle names itself for this family, e.g. "the Kept Hollow". */
  epithet: string;
  /** The first line the oracle always speaks for this family. */
  opening: string;
}>;

export type FortuneReading = Readonly<{
  outcomeId: number;
  tierId: FortuneTierId;
  tierName: string;
  numeral: string;
  /** Card face label, e.g. "III · Echo". */
  card: string;
  fortune: Fortune;
  /** Family epithet, or the neutral fallback for an unknown family. */
  epithet: string;
  opening: string;
  familyName: string;
  /** True when the Friend's own family name supplied the epithet. */
  flavored: boolean;
}>;

export const FORTUNE_TIERS: readonly FortuneTier[] = Object.freeze([
  Object.freeze({
    id: "whisper",
    outcomeId: 1,
    name: "Whisper",
    numeral: "I",
    voice: "Small sounds that only the reader is meant to hear.",
    fortunes: Object.freeze([
      Object.freeze({
        title: "The Half-Heard Name",
        omen: "Something says your name from the far side of the hedge, politely, and then says it again.",
        advice: "Answer the second time. The first was only wind learning your sound.",
      }),
      Object.freeze({
        title: "A Borrowed Warmth",
        omen: "The seat you left is still warm, and nobody sat in it while you were gone.",
        advice: "Leave a light on for whoever is walking back.",
      }),
      Object.freeze({
        title: "Three Small Nails",
        omen: "You find three small nails in your coat pocket, all of them pointing the same way.",
        advice: "Follow them only as far as your own front gate.",
      }),
      Object.freeze({
        title: "The Patient Kettle",
        omen: "A kettle whistles in a house where nobody has boiled water for a long time.",
        advice: "Make the tea anyway. Company is coming, uninvited and welcome.",
      }),
      Object.freeze({
        title: "The Wind's Accounts",
        omen: "The wind goes through your coat the way a clerk goes through a drawer, item by item.",
        advice: "Charge it nothing. It only ever took lint.",
      }),
    ]),
  }),
  Object.freeze({
    id: "glimmer",
    outcomeId: 2,
    name: "Glimmer",
    numeral: "II",
    voice: "Small luck, small light, offered plainly.",
    fortunes: Object.freeze([
      Object.freeze({
        title: "The Coin at the Threshold",
        omen: "A coin waits in your door sill, face down, warmer than the floor beneath it.",
        advice: "Pocket it, and spend it before the week is out.",
      }),
      Object.freeze({
        title: "Nine Green Lights",
        omen: "Nine green lights drift over the path you walk every morning, keeping your pace.",
        advice: "Count them. The missing tenth is your own, and still lit.",
      }),
      Object.freeze({
        title: "The Guest in the Glass",
        omen: "Your reflection arrives a moment late, and looks pleased that you finally arrived.",
        advice: "Greet it. It has been waiting since the last time you meant it.",
      }),
      Object.freeze({
        title: "The Turning Garden",
        omen: "Your garden has grown one turn to the east, though nobody dug and nothing was moved.",
        advice: "Water the new part. Do not ask the old part where the wall went.",
      }),
    ]),
  }),
  Object.freeze({
    id: "echo",
    outcomeId: 3,
    name: "Echo",
    numeral: "III",
    voice: "What you have already done, returning with interest.",
    fortunes: Object.freeze([
      Object.freeze({
        title: "The Second Voice",
        omen: "Everything you say comes back to you from a room you have never once entered.",
        advice: "Say the kind version out loud. Let that be what answers you.",
      }),
      Object.freeze({
        title: "Debt of the Deep Well",
        omen: "A well you drank from long ago has begun, quietly, to drink back.",
        advice: "Return one cup. Wells keep honest ledgers.",
      }),
      Object.freeze({
        title: "The Handprint, Fading",
        omen: "A handprint on your window thickens in the rain and thins again in the sun.",
        advice: "Whose hand it is, you already know. Write to them.",
      }),
      Object.freeze({
        title: "The Repeated Step",
        omen: "You hear your own footsteps arrive a half-second after your own feet do.",
        advice: "Walk slower. It is not following you; it is catching up.",
      }),
      Object.freeze({
        title: "Two Rivers, One Name",
        omen: "The river repeats a name to the river it is arguing with, and the name is not the river's.",
        advice: "Let the water win. Go home by the long road.",
      }),
    ]),
  }),
  Object.freeze({
    id: "prophecy",
    outcomeId: 4,
    name: "Prophecy",
    numeral: "IV",
    voice: "The shape of a season, seen edge-on.",
    fortunes: Object.freeze([
      Object.freeze({
        title: "The Door That Opens Outward",
        omen: "A door in your life only opens outward, and you have spent a long time pulling it.",
        advice: "Push. Say the sentence you have been rehearsing.",
      }),
      Object.freeze({
        title: "The Harvest Left Standing",
        omen: "One row in the field is deliberately unharvested, and it happens to be your row.",
        advice: "Leave it for the birds. It was never food.",
      }),
      Object.freeze({
        title: "Three Winters, One Coat",
        omen: "You outlast three winters in the same coat, and it fits you better every year.",
        advice: "Keep the coat. Give away the colder habits.",
      }),
      Object.freeze({
        title: "The Inheritance of Hands",
        omen: "Your hands repeat a gesture nobody taught you, exactly as a stranger once made it.",
        advice: "Use it kindly. Someone has been watching for that motion.",
      }),
    ]),
  }),
  Object.freeze({
    id: "oracle-eye",
    outcomeId: 5,
    name: "Oracle's Eye",
    numeral: "V",
    voice: "The whole card, held open. Rare, and it looks back.",
    fortunes: Object.freeze([
      Object.freeze({
        title: "The Reader's Eye",
        omen: "You look into the eye, and the eye looks out of your own face, entirely unafraid.",
        advice: "Whatever you saw stays behind the glass. Live as if you are seen.",
      }),
      Object.freeze({
        title: "The Unlit Family Tree",
        omen: "Every branch above you goes dark at once, and you are the last lit window in it.",
        advice: "Be a door rather than an ending. Light the branch below you.",
      }),
      Object.freeze({
        title: "The Nine Shapes",
        omen: "Nine families of shapes cross the dark together, and every one of them knows your gait.",
        advice: "Walk your own cadence. It is how they find you at the end.",
      }),
      Object.freeze({
        title: "The Full Card",
        omen: "The card shows a small green road with no destination, and it is signed with your name.",
        advice: "Take one step along it before you ask what it costs.",
      }),
    ]),
  }),
]);

/**
 * Flavor for the canonical Generations families (see GENERATION_FAMILY_NAMES in
 * the SDK). Two different Friends therefore read differently from the same card.
 */
export const FAMILY_FLAVOR: Readonly<Record<string, FamilyFlavor>> = Object.freeze({
  Skeleton: Object.freeze({ epithet: "the Bare Branch", opening: "What has been stripped still stands." }),
  Mask: Object.freeze({ epithet: "the Two-Faced Lantern", opening: "One face watches the room; the other watches you." }),
  Family: Object.freeze({ epithet: "the Open Door", opening: "You are not the only one of you." }),
  Cellular: Object.freeze({ epithet: "the Slow Tide", opening: "Everything divides, and nothing is lost." }),
  Asymmetry: Object.freeze({ epithet: "the Tilted Beam", opening: "The crooked path is the one that fits your feet." }),
  Hoverer: Object.freeze({ epithet: "the Low Hover", opening: "You rise the moment you stop gripping the ground." }),
  Colossus: Object.freeze({ epithet: "the Warm Wall", opening: "A shadow this large is only shelter, seen from the other side." }),
  Sparkling: Object.freeze({ epithet: "the Small Fires", opening: "You glitter exactly where you were broken." }),
  Hollow: Object.freeze({ epithet: "the Kept Hollow", opening: "An empty room is a room someone can be invited into." }),
});

/** Used for any family name the deck does not know, including a failed art read. */
export const NEUTRAL_FLAVOR: FamilyFlavor = Object.freeze({
  epithet: "the Quiet Visitor",
  opening: "Every Friend wears a face the dark can read.",
});

export function familyFlavor(familyName: string): Readonly<{ flavor: FamilyFlavor; flavored: boolean }> {
  const known = FAMILY_FLAVOR[familyName];
  return known ? { flavor: known, flavored: true } : { flavor: NEUTRAL_FLAVOR, flavored: false };
}

/** Returns the tier for a one-based settled outcome id, or null when unknown. */
export function tierFor(outcomeId: number): FortuneTier | null {
  if (!Number.isInteger(outcomeId)) return null;
  return FORTUNE_TIERS.find(tier => tier.outcomeId === outcomeId) ?? null;
}

function hash(value: string): number {
  let result = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 0x01000193) >>> 0;
  }
  return result >>> 0;
}

/**
 * Deterministic deck selector. The same Friend (same seed) reading the same
 * settled outcome always draws the same card, so re-opening a reading shows the
 * fortune again instead of re-rolling it. There is no `Math.random()` here.
 *
 * Throws a RangeError for an outcome id the deck does not describe; callers
 * should check `tierFor` first.
 *
 * `seed` is the Friend's uint32 sprite seed. The SDK's `GenerationSprites.seed`
 * is a `number`; `bigint` is accepted as well so any caller works.
 */
export function selectFortune(outcomeId: number, seed: number | bigint, familyName: string): FortuneReading {
  const tier = tierFor(outcomeId);
  if (!tier) throw new RangeError(`The deck has no reading for settled outcome ${String(outcomeId)}.`);
  const fortune = tier.fortunes[hash(`${tier.id}:${String(seed)}:${familyName}`) % tier.fortunes.length];
  const { flavor, flavored } = familyFlavor(familyName);
  return Object.freeze({
    outcomeId, tierId: tier.id, tierName: tier.name, numeral: tier.numeral,
    card: `${tier.numeral} · ${tier.name}`, fortune, epithet: flavor.epithet,
    opening: flavor.opening, familyName, flavored,
  });
}