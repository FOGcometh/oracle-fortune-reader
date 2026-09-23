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
      Object.freeze({
        title: "The Second Doorknob",
        omen: "Tonight the door has two knobs, and both of them are cold.",
        advice: "Use the one your hand reached for first.",
      }),
      Object.freeze({
        title: "The Sanded Step",
        omen: "One stair has been quietly sanded smooth, and it is not the one you use.",
        advice: "Walk the loud stair. Let the house hear where you are.",
      }),
      Object.freeze({
        title: "The Hours Without Minutes",
        omen: "The clock in the hall keeps only the hour hand, and it has never once been wrong.",
        advice: "Stop asking it for minutes. They were never the point.",
      }),
      Object.freeze({
        title: "Grief in the Pipes",
        omen: "The pipes carry a low note through the wall in a key nobody here can sing.",
        advice: "Hum in your own key. It is only tuning the place to you.",
      }),
      Object.freeze({
        title: "The Match You Heard Later",
        omen: "You hear a match strike next door, and the sound arrives long after the flame.",
        advice: "Do not look for the fire. Look at who was standing near it.",
      }),
      Object.freeze({
        title: "The Letter That Came Unstuck",
        omen: "An envelope in your drawer has come unstuck by itself, only from being thought about.",
        advice: "Answer it in writing. Thinking is not a reply.",
      }),
      Object.freeze({
        title: "A Coat Warmer Than the Room",
        omen: "Your coat hangs warmer than the room it hangs in, unworn since morning.",
        advice: "Wear it out tonight. Something is waiting to be met halfway.",
      }),
      Object.freeze({
        title: "The Brushed Sleeve",
        omen: "Something brushes your sleeve in a doorway, going the other way.",
        advice: "Say excuse me. Politeness opens only from your side.",
      }),
      Object.freeze({
        title: "The Small Lamp Left On",
        omen: "The lamp you switched off is lit an hour before dawn, very dim, and burning calm.",
        advice: "Leave it. Someone walked home by it.",
      }),
      Object.freeze({
        title: "A Night Already Used",
        omen: "Your pillow is cold on both sides at once, as if the night had been spent already.",
        advice: "Sleep anyway. Morning does not check the accounts.",
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
      Object.freeze({
        title: "Two Coins, One Pocket",
        omen: "Two coins find each other in a coat pocket you have not worn since spring.",
        advice: "Spend one on someone else before you spend yours.",
      }),
      Object.freeze({
        title: "The Heavier Tin",
        omen: "A tin of matches on your shelf has been quietly refilled, and it weighs more.",
        advice: "Take it out in the weather. Luck likes being used.",
      }),
      Object.freeze({
        title: "The Window You Never Open",
        omen: "A window you never open stands open, and the room is warmer for it.",
        advice: "Leave it open. Some guest prefers the honest way in.",
      }),
      Object.freeze({
        title: "The Potato That Kept",
        omen: "One potato from last autumn is still firm, still good, still keeping its promise.",
        advice: "Cook it plainly. Small luck should not be hidden in a stew.",
      }),
      Object.freeze({
        title: "The Short Road Home",
        omen: "The way home is shorter than it was this morning, and nobody moved a house.",
        advice: "Take it, and do not measure the walk again.",
      }),
      Object.freeze({
        title: "The Overpaid Coin",
        omen: "A stranger overpays you by a fraction and walks off before you can correct it.",
        advice: "Let it be a gift. Correct nothing today.",
      }),
      Object.freeze({
        title: "The Bright Patch",
        omen: "A patch of your garden stays bright an hour past sundown, and beetles go there willingly.",
        advice: "Plant in it. Do not ask what is doing the lighting.",
      }),
      Object.freeze({
        title: "The Second Cup",
        omen: "The pot has poured one cup more than you measured, and the extra is exactly right.",
        advice: "Give the extra cup to the first person who knocks.",
      }),
      Object.freeze({
        title: "The Coat Returned Fitted",
        omen: "A coat you gave away comes back to you fitted better than when it left.",
        advice: "Wear it. Do not ask what happened to the shoulders.",
      }),
      Object.freeze({
        title: "Nine Steps Dry",
        omen: "Nine of the ten steps to your door are dry in the rain, always the same nine.",
        advice: "Use them. The tenth is being kept for a guest.",
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
      Object.freeze({
        title: "The Same Light Twice",
        omen: "A lamp you lit for somebody years ago is lit again tonight, by nobody.",
        advice: "Say the name out loud. Interest is paid in light.",
      }),
      Object.freeze({
        title: "Your Own Advice",
        omen: "Somebody repeats your advice back to you word for word, not knowing they heard it.",
        advice: "Take it this time. It was good when you said it.",
      }),
      Object.freeze({
        title: "The Scuff You Left",
        omen: "A scuff on your floorboard matches the heel you wore out three winters ago.",
        advice: "Sit there again. Let the old weight be a chair.",
      }),
      Object.freeze({
        title: "The Unreturned Cup",
        omen: "A cup you never gave back is washed and left on your step, clean, with no note.",
        advice: "Return it full. Debts like this settle with more, not less.",
      }),
      Object.freeze({
        title: "The Room That Kept Your Tone",
        omen: "A room answers you in your own tone, and the floor does not know it is echoing.",
        advice: "Speak the kind sentence. It has been keeping the other one.",
      }),
      Object.freeze({
        title: "The Kindness Handed Forward",
        omen: "A small kindness of yours is being handed forward by someone you will never meet.",
        advice: "Let it travel. That is what good interest looks like.",
      }),
      Object.freeze({
        title: "The Closing Crack",
        omen: "A crack in your wall has closed by half, without plaster, as if the house were repaying.",
        advice: "Do not redraw the line. Let it finish.",
      }),
      Object.freeze({
        title: "The Letter You Did Not Send",
        omen: "A letter you decided not to send arrived anyway, on a table, in your hand.",
        advice: "It was true when written. Stand behind it now.",
      }),
      Object.freeze({
        title: "The Footprint Holding Water",
        omen: "A footprint on your path fills with clean water and stays full while all else dries.",
        advice: "Put your foot back in it. That is how a mark closes.",
      }),
      Object.freeze({
        title: "The Saying Your Junior Uses",
        omen: "Somebody younger uses one of your old sayings, correctly, then laughs at it.",
        advice: "Tell them where it came from. Echoes want a return address.",
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
      Object.freeze({
        title: "The Winter You Can Afford",
        omen: "You outlast the season with wood to spare, though you stacked it as always.",
        advice: "Give the spare to the house that ran out.",
      }),
      Object.freeze({
        title: "The Field Cut Late",
        omen: "One field is cut after the frost, and it yields better than the ones cut early.",
        advice: "Stop hurrying the harvest. Late is a schedule too.",
      }),
      Object.freeze({
        title: "The Rope You Doubt",
        omen: "A rope you never trusted holds the roof through the third storm of the year.",
        advice: "Keep the things you doubt. Doubt is not uselessness.",
      }),
      Object.freeze({
        title: "The Road That Waits for Rain",
        omen: "The uphill road you avoid is passable only after the weather turns.",
        advice: "Walk it wet. The dry version was never yours.",
      }),
      Object.freeze({
        title: "The Place Set Early",
        omen: "A place at your table stays set all winter for someone who arrives in the green.",
        advice: "Keep setting it. Do not make them ask.",
      }),
      Object.freeze({
        title: "The Additional Room",
        omen: "By spring the house has a room you never built, and its door opens quietly.",
        advice: "Use it for the thing you keep putting off.",
      }),
      Object.freeze({
        title: "The Steadied Hand",
        omen: "Your writing steadies across a year nobody will describe as easy.",
        advice: "Keep the first page. It is proof this was survivable.",
      }),
      Object.freeze({
        title: "The Line That Stopped Leaking",
        omen: "The pipe that leaked since you moved in stops the week you stop complaining.",
        advice: "Repair the next one properly, before it becomes a season.",
      }),
      Object.freeze({
        title: "The Friend Back in Autumn",
        omen: "Someone you counted as gone returns in the falling month, under a different name.",
        advice: "Open the door first. Ask nothing until they are warm.",
      }),
      Object.freeze({
        title: "The Rented Ground",
        omen: "You plant the one garden you do not own, and it is the only one that feeds you.",
        advice: "Tend it anyway. Ownership was never the soil.",
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
      Object.freeze({
        title: "The Ledger Open at the Middle",
        omen: "The book of your days is open at the middle, and both halves are the same length.",
        advice: "Spend the next one on purpose. Nothing is being saved for you.",
      }),
      Object.freeze({
        title: "The Nine Who Look Back",
        omen: "Nine shapes leave your door in nine directions, and all of them look back at once.",
        advice: "Follow none. Be the door they remember.",
      }),
      Object.freeze({
        title: "The Face Worn Carefully",
        omen: "Something wears your face with more care than you do, and it is not mocking you.",
        advice: "Take the notes. That is how a face is meant to be kept.",
      }),
      Object.freeze({
        title: "The Room Behind the Reading",
        omen: "Behind this card is a small room where every fortune you were dealt is filed.",
        advice: "Leave it tidy. Someone else reads it after you.",
      }),
      Object.freeze({
        title: "The Eye That Weeps Both Ways",
        omen: "The eye on the card weeps inward and outward at once, and neither stream is grief.",
        advice: "Let it watch. You have been watched worse than this.",
      }),
      Object.freeze({
        title: "The Reading You Will Forget",
        omen: "This is the card you will not remember tomorrow, though it changes what you do.",
        advice: "Act before the forgetting. It was dealt for walking.",
      }),
      Object.freeze({
        title: "The Friend Drawn Beside You",
        omen: "The card shows your Friend walking with you, drawn at a size the world forbids.",
        advice: "Keep them in the reading. That is how the oracle counts you.",
      }),
      Object.freeze({
        title: "The Weight of the Deck",
        omen: "You feel the whole deck through this one card, and it is heavier than paper.",
        advice: "Put it down gently. It has been carried a long way.",
      }),
      Object.freeze({
        title: "The Hour the Shrine Keeps",
        omen: "The shrine keeps one hour of the day to itself, and spends it thinking of you.",
        advice: "Visit it then. Nobody else will.",
      }),
      Object.freeze({
        title: "The Card Held Open",
        omen: "The card is held open until someone looks, and you are who it waited to show.",
        advice: "Look, then close it. Reading is not the same as owing.",
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