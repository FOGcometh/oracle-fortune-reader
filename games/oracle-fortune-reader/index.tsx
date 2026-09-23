"use client";

/**
 * Oracle Fortune Reader — a hybrid: a walkable shrine in the SDK's garden world
 * that opens a full-screen card reading.
 *
 * The component only calls the SDK's fixed action client. Wallet connection,
 * Friend discovery, the ownership gate and the identity of the selected Friend
 * all belong to the SDK runtime. Every RF amount, card and outcome here is
 * simulated, and the tier the player is shown comes from the settled
 * `client.settle()` result rather than from browser randomness.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameComponentProps } from "@rarefriends/friendsdk/runtime";
import { GameWorld, type GameWorldInteraction } from "@rarefriends/friendsdk/world-view";
import { getWorldPreset, project, validateWorld, type WorldPoint } from "@rarefriends/friendsdk/world";
import { GameMenu } from "@rarefriends/friendsdk/frame";
import { formatGameAmount } from "@rarefriends/friendsdk/ui";
import { maximumPrize, type GamePlay, type GameSnapshot } from "@rarefriends/friendsdk/game";
import { createFriendSoundKit, type FriendSoundCue, type FriendSoundKit } from "@rarefriends/friendsdk/sounds";
import { createFriendReader, spriteFrame, type GenerationSprites } from "@rarefriends/friendsdk/sprites";
import { FORTUNE_TIERS, familyFlavor, selectFortune, tierFor } from "./deck.js";
import "@rarefriends/friendsdk/frame.css";
import "@rarefriends/friendsdk/world-view.css";
import "./style.css";

/** The shrine corner of the supplied garden world: darker, quieter, green-lit. */
const SHRINE: WorldPoint = [196, 146];
const SPAWN: WorldPoint = [232, 176];
const REACH = 96;

const garden = getWorldPreset("01-garden-oval-complete");
const world = validateWorld({
  ...garden,
  actors: [],
  props: [...garden.props,
    { type: "crystal", x: SHRINE[0], y: SHRINE[1], scale: 1.35 },
    { type: "rock", x: 152, y: 178, scale: 0.9 },
    { type: "reeds", x: 248, y: 114, scale: 0.7 },
    { type: "flower", x: 176, y: 104, scale: 0.7 }],
});
const interactions: readonly GameWorldInteraction[] = [
  { id: "shrine", label: "Oracle shrine", position: SHRINE, reach: REACH, labelOffset: -64 },
];
/** Screen position of the shrine inside the 960 × 640 reference viewport. */
const SHRINE_SCREEN = project(SHRINE[0], SHRINE[1]);
const VIEW = { x: 320, y: 330 };

type Screen = "offer" | "casting" | "revealed";

const rf = (value: bigint) => `${formatGameAmount(value, 18)} RF`;

/** Presentation cue for a settled tier. The tier itself still comes from settle(). */
function tierCue(outcomeId: number): FriendSoundCue {
  return outcomeId >= 5 ? "reveal-legendary" : outcomeId >= 3 ? "reveal-rare" : "reveal-common";
}

/** The canonical one-bit sprite mask drawn as scaled pixels, with a soft halo. */
function OracleFigure({ rows, scale, label }: { rows: readonly string[]; scale: number; label: string }) {
  const width = Math.max(1, ...rows.map(row => row.length));
  const height = rows.length;
  const { ink, halo } = useMemo(() => {
    const drawn: string[] = [];
    const around = new Set<string>();
    rows.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel !== "#") return;
      drawn.push(`M${x} ${y}h1v1h-1z`);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) around.add(`${x + dx} ${y + dy}`);
    }));
    return { ink: drawn.join(""), halo: [...around].map(point => {
      const [x, y] = point.split(" ");
      return `M${x} ${y}h1v1h-1z`;
    }).join("") };
  }, [rows]);
  return <svg className="ofr-oracle" viewBox={`0 0 ${width} ${height}`} width={width * scale} height={height * scale}
    role={label ? "img" : "presentation"} aria-label={label || undefined} aria-hidden={label ? undefined : true}
    shapeRendering="crispEdges" focusable="false">
    {halo && <path d={halo} className="ofr-oracle-halo" />}
    <path d={ink} className="ofr-oracle-ink" />
  </svg>;
}

/** Only the requested game. The SDK runtime supplies the selected, verified Friend. */
export default function OracleFortuneReader({ friendId, client, paused }: GameComponentProps) {
  const definition = client.definition;
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [oracle, setOracle] = useState<GenerationSprites | null>(null);
  const [screen, setScreen] = useState<Screen | null>(null);
  const [settled, setSettled] = useState<GamePlay | null>(null);
  const [error, setError] = useState("");
  const [artError, setArtError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [settings, setSettings] = useState(false);
  const [revision, setRevision] = useState(0);
  const [worldRevision, setWorldRevision] = useState(0);
  const [surface, setSurface] = useState({ width: 960, height: 640 });
  const epoch = useRef(0);
  const locked = useRef(false);
  const open = useRef(false);
  const sound = useRef<FriendSoundKit | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const restore = useRef<HTMLElement | null>(null);

  // Session and artwork load. Both reads are epoch-guarded.
  useEffect(() => {
    const version = ++epoch.current;
    locked.current = false; open.current = false;
    sound.current = createFriendSoundKit({ muted: true });
    setSnapshot(null); setOracle(null); setScreen(null); setSettled(null);
    setError(""); setArtError(""); setMessage(""); setBusy(false); setMuted(true); setSettings(false);
    void client.read().then(value => {
      if (version === epoch.current) setSnapshot(value);
    }).catch(cause => {
      if (version === epoch.current) setError(cause instanceof Error ? cause.message : "The oracle could not open this session.");
    });
    void createFriendReader().read(friendId).then(sprites => {
      if (version === epoch.current) setOracle(sprites);
    }).catch(cause => {
      if (version === epoch.current) setArtError(cause instanceof Error ? cause.message : "Your Friend's artwork could not be read.");
    });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update(); preference.addEventListener("change", update);
    return () => {
      epoch.current++;
      sound.current?.dispose(); sound.current = null;
      preference.removeEventListener("change", update);
    };
  }, [client, friendId, revision]);

  // The world viewport size, mirrored from GameWorld so the shrine overlay aligns.
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.min(entry.contentRect.width, entry.contentRect.height * 1.5);
      setSurface({ width, height: width / 1.5 });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Move focus into the reading, and back to the shrine when it closes.
  useEffect(() => {
    if (screen && !open.current) { open.current = true; dialog.current?.focus(); }
    else if (!screen && open.current) { open.current = false; restore.current?.focus(); }
  }, [screen]);

  // The runtime's own menus take the frame: drop the in-frame settings list.
  useEffect(() => { if (paused) setSettings(false); }, [paused]);

  /** Lock + epoch guard: a stale result can never land after unmount or an identity change. */
  async function act(work: (version: number) => Promise<void>) {
    if (locked.current || paused) return;
    const version = epoch.current;
    locked.current = true; setBusy(true); setError(""); setMessage("");
    void sound.current?.unlock();
    try {
      await work(version);
      const value = await client.read();
      if (version === epoch.current) setSnapshot(value);
    } catch (cause) {
      const failure = cause instanceof Error ? cause.message : "The reading failed.";
      if (version === epoch.current) setError(failure);
      try {
        const value = await client.read();
        if (version === epoch.current) setSnapshot(value);
      } catch { /* Keep the original failure; the retry control re-reads. */ }
    } finally {
      if (version === epoch.current) { locked.current = false; setBusy(false); }
    }
  }

  async function settlePlay(play: GamePlay, version: number) {
    const outcome = await client.settle(play.id);
    if (version !== epoch.current) return;
    if (outcome.outcomeId === null) {
      // Live mode can return an unsettled play. Never reveal an unknown tier.
      setSettled(null); setScreen("offer");
      setMessage(`Reading #${outcome.id} is still being drawn. Resume it without paying again.`);
      return;
    }
    setSettled(outcome); setScreen("revealed"); setMessage("");
    sound.current?.play(tierCue(outcome.outcomeId));
  }

  const pending = snapshot?.plays.find(play => play.outcomeId === null) ?? null;
  const maxPrize = maximumPrize(definition);
  const affordable = snapshot !== null && snapshot.rfBalance >= definition.price &&
    snapshot.freeStake >= maxPrize && snapshot.freeStake + definition.price >= maxPrize;
  const kept = snapshot?.inventory.reduce((total, amount) => total + amount, 0n) ?? 0n;
  const keptValue = snapshot?.inventory.reduce((sum, amount, index) => sum + amount * definition.outcomes[index].reward, 0n) ?? 0n;

  const enterShrine = () => {
    if (paused || busy) return;
    restore.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setError(""); setMessage(""); setSettled(null); setScreen("offer");
    void sound.current?.unlock();
    sound.current?.play("select");
  };
  const leaveShrine = () => {
    if (busy || paused) return;
    setScreen(null); setSettled(null); setMessage(""); setError("");
  };

  /** Buy one card, then play and settle it. A pending play is always resumed instead. */
  const drawCard = () => act(async version => {
    if (version !== epoch.current) return;
    setScreen("casting");
    const waiting = snapshot?.plays.find(play => play.outcomeId === null);
    if (waiting) { await settlePlay(waiting, version); return; }
    const allowed = await client.canBuy(1n);
    if (!allowed) throw new Error("This Friend needs more simulated free stake before another card can be drawn.");
    await client.buy(1n);
    sound.current?.play("purchase");
    const [play] = await client.play(1n);
    if (!play) throw new Error("No card was drawn. Refresh the shrine before trying again.");
    await settlePlay(play, version);
  });

  const resumeReading = () => act(async version => {
    setScreen("casting");
    const waiting = snapshot?.plays.find(play => play.outcomeId === null);
    if (!waiting) throw new Error("This reading has already been settled.");
    await settlePlay(waiting, version);
  });

  const redeem = (outcomeId: number, note: string) => act(async version => {
    await client.redeem(outcomeId, 1n);
    if (version === epoch.current) setMessage(note);
  });

  const redeemAll = () => act(async version => {
    let total = 0n;
    for (let index = 0; index < definition.outcomes.length; index++) {
      const amount = snapshot?.inventory[index] ?? 0n;
      if (amount > 0n && definition.outcomes[index].reward > 0n) { await client.redeem(index + 1, amount); total += amount; }
    }
    if (version === epoch.current) setMessage(total > 0n
      ? `Redeemed ${total} kept card${total === 1n ? "" : "s"} for simulated RF.`
      : "No kept card has a simulated value to redeem.");
  });

  const answer = settled?.outcomeId ?? null;
  const outcome = answer !== null ? definition.outcomes[answer - 1] : null;
  const reading = answer !== null && oracle && tierFor(answer) ? selectFortune(answer, oracle.seed, oracle.familyName) : null;
  const rows = useMemo(() => oracle ? spriteFrame(oracle, "down", false, 0, "right").frame.rows : null, [oracle]);
  const flavor = oracle ? familyFlavor(oracle.familyName) : null;
  const shrineLeft = `${((SHRINE_SCREEN[0] - VIEW.x) / 9.6).toFixed(2)}%`;
  const shrineTop = `${((SHRINE_SCREEN[1] - VIEW.y - 34) / 6.4).toFixed(2)}%`;
  const feedback = <p className="ofr-feedback" role={error ? "alert" : "status"}>
    {error || message || (busy ? "The oracle is turning the card…"
      : pending ? `Reading #${pending.id} is waiting to be finished.`
        : `Simulated economy · ${rf(snapshot?.rfBalance ?? 0n)} · ${(snapshot?.consumables ?? 0n).toString()} card${snapshot?.consumables === 1n ? "" : "s"} held`)}
  </p>;

  if (!snapshot) {
    return <div className="ofr-loading" role={error ? "alert" : "status"}>
      <span className="ofr-loading-mark" aria-hidden="true">✧</span>
      <p>{error || "Lighting the shrine…"}</p>
      {error && <button type="button" disabled={busy || paused} onClick={() => setRevision(value => value + 1)}>Retry</button>}
    </div>;
  }
  if (snapshot.friendId !== friendId) {
    return <p className="ofr-loading" role="alert">This game session does not match the selected Friend. The runtime must supply the verified Friend for this reading.</p>;
  }

  return <section className="ofr" aria-label={definition.name} aria-busy={busy}>
    <div className="ofr-stage" ref={stage}>
      <div className="ofr-world" inert={Boolean(screen) || paused || undefined}>
        <GameWorld key={worldRevision} friendId={friendId} world={world} spawn={SPAWN} interactions={interactions}
          paused={Boolean(screen) || paused} reducedMotion={reducedMotion} onInteract={() => enterShrine()} />
      </div>
      <div className="ofr-glow" aria-hidden="true" />
      <div className="ofr-vignette" aria-hidden="true" />
      <div className="ofr-motes" aria-hidden="true"><i /><i /><i /><i /></div>
      {rows && <div className="ofr-spirit" style={{ width: surface.width, height: surface.height }} aria-hidden="true">
        <span className="ofr-spirit-figure" style={{ left: shrineLeft, top: shrineTop }}>
          <OracleFigure rows={rows} scale={3} label="" />
        </span>
      </div>}
      <div className="ofr-hud">
        <p className="ofr-status" role="status">
          <span className="ofr-chip">Simulated</span>
          <span>{rf(snapshot.rfBalance)}</span>
          <span>{snapshot.consumables.toString()} card{snapshot.consumables === 1n ? "" : "s"}</span>
          {pending && <span className="ofr-chip ofr-chip-warn">1 pending reading</span>}
          {kept > 0n && <span>{kept.toString()} kept</span>}
        </p>
        <div className="ofr-hud-actions">
          <button type="button" className="ofr-primary" disabled={paused || busy} onClick={enterShrine}>
            {pending ? `Finish reading #${pending.id}` : "Enter the shrine"}
          </button>
          <button type="button" disabled={paused} onClick={() => setSettings(true)}>Settings</button>
          <button type="button" aria-pressed={!muted} aria-label={muted ? "Turn sound on" : "Mute sound"}
            onClick={() => { const next = !muted; setMuted(next); sound.current?.setMuted(next); if (!next) void sound.current?.unlock(); }}>{muted ? "Sound off" : "Sound on"}</button>
        </div>
      </div>
      <p className="ofr-hint">
        <span className="ofr-hint-wide">WASD / arrows to walk · Tap a destination · E near the shrine</span>
        <span className="ofr-hint-narrow">Tap to walk · Tap the shrine prompt</span>
      </p>
      {!screen && feedback}
    </div>

    {settings && <GameMenu title="Settings" onClose={busy ? undefined : () => setSettings(false)}>
      <button type="button" aria-pressed={!muted} onClick={() => { const next = !muted; setMuted(next); sound.current?.setMuted(next); if (!next) void sound.current?.unlock(); }}>{muted ? "Sound off" : "Sound on"}</button>
      <label className="ofr-setting"><input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} /> Reduce motion (skip the card turn and the drifting motes)</label>
      <button type="button" disabled={busy || paused} onClick={() => { setWorldRevision(value => value + 1); setMessage("Returned to the garden path."); }}>Reset walking position</button>
      <p className="ofr-note">Reading the deck:{FORTUNE_TIERS.map(tier => ` ${tier.numeral} ${tier.name}`).join(" ·")}.</p>
      <p className="ofr-note">All RF, cards, tiers and redemptions in this preview are simulated. No transaction is sent, and the runtime still requires a connected wallet that owns a hardwired Generations Friend.</p>
    </GameMenu>}

    {screen && <div className="ofr-reading" role="dialog" aria-modal="true" aria-labelledby="ofr-reading-title"
      ref={dialog} tabIndex={-1} data-screen={screen}
      onKeyDown={event => { if (event.key === "Escape" && !busy && !paused) { event.preventDefault(); leaveShrine(); } }}>
      <div className="ofr-reading-inner">
        <header className="ofr-reading-head">
          <p className="ofr-kicker">Oracle Fortune Reader · simulated preview</p>
          <h2 id="ofr-reading-title">{oracle ? `${oracle.familyName} reads` : "The oracle reads"}</h2>
          {!busy && !paused && <button type="button" className="ofr-close" onClick={leaveShrine} aria-label="Leave the shrine">×</button>}
        </header>

        {screen === "casting" && <div className="ofr-casting" role="status">
          <span className="ofr-casting-mark" aria-hidden="true">✧</span>
          <p>The oracle turns the card…</p>
          <p className="ofr-note">One card is one reading. The tier is settled by the runtime, not by this window.</p>
        </div>}

        {screen === "offer" && <div className="ofr-offer">
          <div className="ofr-oracle-panel">
            {rows ? <OracleFigure rows={rows} scale={6} label={`Your Friend, the oracle${oracle ? `: ${oracle.familyName}` : ""}`} />
              : <p className="ofr-art-missing" role={artError ? "alert" : "status"}>{artError || "Reading your Friend's artwork…"}
                {artError && <button type="button" disabled={busy || paused} onClick={() => setRevision(value => value + 1)}>Retry artwork</button>}</p>}
            <div className="ofr-oracle-copy">
              <p className="ofr-epithet">{flavor ? flavor.flavor.epithet : "the Quiet Visitor"}</p>
              <p className="ofr-opening">“{flavor ? flavor.flavor.opening : "Every Friend wears a face the dark can read."}”</p>
              <p className="ofr-note">Your own Friend is the oracle. This reading is drawn through {oracle ? `the ${oracle.familyName} family` : "your Friend's family"}{flavor && !flavor.flavored ? " (neutral voice)" : ""}.</p>
            </div>
          </div>
          <p className="ofr-offer-copy">One card is one reading · {rf(definition.price)} per card. Every card reserves {rf(maxPrize)} of simulated stake.</p>
          <div className="ofr-actions">
            {pending ? <button type="button" className="ofr-primary" disabled={busy || paused} onClick={resumeReading}>Finish reading #{pending.id}</button>
              : <button type="button" className="ofr-primary" disabled={busy || paused || !affordable} onClick={drawCard}>Draw one card · {rf(definition.price)}</button>}
            <button type="button" disabled={busy || paused} onClick={leaveShrine}>Step back</button>
            {kept > 0n && keptValue > 0n && <button type="button" disabled={busy || paused} onClick={redeemAll}>Redeem kept cards · {rf(keptValue)}</button>}
          </div>
          {!pending && !affordable && <p className="ofr-note">Not enough simulated RF or free stake for another card. {snapshot.freeStake >= maxPrize ? "Redeem a kept card to free simulated RF." : "New purchases are paused until there is enough free backing."}</p>}
          <table className="ofr-odds">
            <caption>Deck odds · the runtime settles the card</caption>
            <thead><tr><th scope="col">Card</th><th scope="col">Chance</th><th scope="col">Value</th><th scope="col">Kept</th></tr></thead>
            <tbody>{definition.outcomes.map((item, index) => <tr key={item.name}>
              <th scope="row">{item.name}</th>
              <td>{item.chanceBps / 100}%</td>
              <td>{rf(item.reward)}</td>
              <td>{snapshot.inventory[index].toString()}</td>
            </tr>)}</tbody>
          </table>
        </div>}

        {screen === "revealed" && <div className="ofr-reveal">
          {reading && outcome && answer !== null && settled ? <>
            <article className={`ofr-card${reducedMotion ? "" : " ofr-card-turn"}`} aria-labelledby="ofr-card-title">
              <p className="ofr-card-numeral" aria-hidden="true">{reading.numeral}</p>
              <p className="ofr-card-tier">{reading.tierName} · {outcome.chanceBps / 100}% · {rf(outcome.reward)}</p>
              <h3 id="ofr-card-title">{reading.fortune.title}</h3>
              <p className="ofr-card-opening">“{reading.opening}”</p>
              <p className="ofr-card-omen">{reading.fortune.omen}</p>
              <p className="ofr-card-advice"><strong>The oracle asks:</strong> {reading.fortune.advice}</p>
              <p className="ofr-card-source">{reading.epithet} · {reading.familyName}{reading.flavored ? "" : " · neutral voice"} · settled outcome #{answer}</p>
            </article>
            <p className="ofr-announce" role="status">{reading.tierName} — {reading.fortune.title}. {reading.fortune.advice}</p>
            <div className="ofr-actions">
              <button type="button" className="ofr-primary" disabled={busy || paused} onClick={leaveShrine}>Keep this reading</button>
              {snapshot.inventory[answer - 1] > 0n && outcome.reward > 0n && <button type="button" disabled={busy || paused}
                onClick={() => redeem(answer, `Redeemed one ${outcome.name} for ${rf(outcome.reward)} of simulated RF.`)}>Redeem the omen · {rf(outcome.reward)}</button>}
              {!pending && <button type="button" disabled={busy || paused || !affordable} onClick={drawCard}>Draw another · {rf(definition.price)}</button>}
            </div>
          </> : <>
            <p className="ofr-art-missing" role="alert">The oracle has no reading for this settled outcome.
              {artError && <button type="button" disabled={busy || paused} onClick={() => setRevision(value => value + 1)}>Retry artwork</button>}</p>
            <div className="ofr-actions"><button type="button" className="ofr-primary" disabled={busy} onClick={leaveShrine}>Step back</button></div>
          </>}
        </div>}

        {feedback}
      </div>
    </div>}
  </section>;
}