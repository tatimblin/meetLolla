// meet Lolla as an embeddable module: mount(el, { assetBase }) => { destroy() }.
//
// The 2017 Lollapalooza poster, as a player: the whole four-day lineup as one long poster, tap a
// name to hear its 30s preview or shuffle across all of it. A crowd of hands pinned to the bottom
// is the audio visualiser, standing on a poster-blue player bar; the city skyline closes the page.
//
// Everything renders inside `el` under one .meet-lolla root that is its own scroller. Nothing
// plays until a tap: the AudioContext is created on the first press of a name or Shuffle.
// destroy() is idempotent and leaves no listeners, observers, timers, audio or DOM behind.
import css from "../css/meet-lolla.css";
import logoSvg from "../svg/logo.svg";
import sunSvg from "../svg/poster/sunburst.svg";
import cloudsSvg from "../svg/poster/clouds.svg";
import skylineBackSvg from "../svg/poster/skyline-back.svg";
import skylineFrontSvg from "../svg/poster/skyline-front.svg";
import { artists } from "./artists.js";
import { days } from "./lineup.js";

const PREVIEW_S = 30;   // each preview plays for up to 30s, then the next artist
const USER_SCROLL_QUIET_MS = 4_000;   // auto-advance never scrolls within this long of the user scrolling

const instances = new WeakMap();
let seq = 0;   // per-mount id suffix, so two instances on one page never share ids

// The crowd, as dense as the poster's: about 38 hands across, shoulder to shoulder, in two rows.
// The back row is smaller, stands a little higher and sits behind the front row; together the
// arms make a near-solid wall. Positions, sizes and rest heights are irregular but come from a
// fixed seed, so the crowd is identical on every load. Rows: [hand, left %, tilt deg, size px,
// z, rest height px, kept on narrow screens]. About one hand in five leans, 4-7 degrees; about
// one in eight is a monster, never two side by side.
const CROWD = (() => {
  let seed = 20170803;
  const rnd = () => {   // mulberry32
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const humans = ["h1", "h4", "h2", "h5", "h3b", "h6", "h1b", "h7", "h3", "h6b", "h4", "h5"];
  const small = new Set(["h2", "h7"]);   // fists read bigger, so draw them a little smaller
  const rows = [
    // count, size range, rest height range, z range, monster slots, which to keep on phones
    { n: 22, s: [150, 170], h: [8, 30], z: [3, 5], monsters: { 2: "claw", 8: "rock", 13: "eye", 19: "peace" }, keep: (i) => i % 3 !== 0 },
    { n: 16, s: [130, 148], h: [18, 46], z: [1, 2], monsters: { 3: "claw" }, keep: (i) => i % 5 === 2 },
  ];
  const out = [];
  let h = 0;
  rows.forEach((row, r) => {
    const pitch = 100 / row.n;
    for (let i = 0; i < row.n; i++) {
      const x = clampN((i + 0.5) * pitch + (rnd() - 0.5) * pitch * (r ? 0.7 : 0.55) + (r ? pitch * 0.25 : 0), 1, 99);
      let kind = row.monsters[i];
      if (!kind) { kind = humans[h % humans.length]; h += 1 + (rnd() < 0.3 ? 1 : 0); }
      const lo = row.s[0], hi = row.s[1];
      let size = lo + rnd() * (hi - lo);
      if (small.has(kind)) size *= 0.86;
      if (row.monsters[i]) size *= 1.06;
      const lean = rnd() < 0.2 ? Math.round((4 + rnd() * 3) * (rnd() < 0.5 ? -1 : 1)) : 0;
      const h0 = Math.round(row.h[0] + rnd() * (row.h[1] - row.h[0]));
      const z = row.z[0] + Math.floor(rnd() * (row.z[1] - row.z[0] + 1));
      out.push([kind, +x.toFixed(1), lean, Math.round(size), z, h0, row.keep(i) ? 1 : 0]);
    }
  });
  return out;
})();
function clampN(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
// hand -> [file under src/, wrist left and right edge, clip line (all in the 300-unit viewBox,
// measured from the rendered SVGs), arm: skin colour sampled at the wrist or an arm tile, outline
// width in units]. The arm is exactly as wide as the wrist and centred on it; the hand is clipped
// at the clip line (below it some hands draw a closing stroke) and overlaps the arm by 2 units,
// so hand and arm read as one limb.
const HANDS = {
  h1: ["img/hand1.svg", 119, 175.5, 291, "#ec9683", 0.5],
  h1b: ["svg/poster/hands/hand1-band.svg", 119, 175.5, 291, "#ec9683", 0.5],
  h2: ["img/hand2.svg", 119, 189.5, 300, "#c66e34", 1],
  h3: ["img/hand3.svg", 145, 193.5, 300, "#e3937c", 1],
  h3b: ["svg/poster/hands/hand3-band.svg", 145, 193.5, 300, "#e3937c", 1],
  h4: ["img/hand4.svg", 111, 163.5, 300, "#f6ba98", 1],
  h5: ["img/hand5.svg", 111, 163.5, 300, "#c66e34", 1],
  h6: ["img/hand6.svg", 145, 193.5, 300, "#c66e34", 1],
  h6b: ["svg/poster/hands/hand6-band.svg", 145, 193.5, 300, "#c66e34", 1],
  h7: ["img/hand7.svg", 119, 189.5, 300, "#e3937c", 1],
  claw: ["svg/poster/hands/hand-monster-claw.svg", 99, 201, 300, "svg/poster/hands/arm-claw.svg", 0],
  rock: ["svg/poster/hands/hand-monster-rock.svg", 99, 201, 300, "svg/poster/hands/arm-rock.svg", 0],
  eye: ["svg/poster/hands/hand-monster-eye.svg", 99, 201, 300, "svg/poster/hands/arm-eye.svg", 0],
  peace: ["svg/poster/hands/hand-monster-peace.svg", 99, 201, 300, "svg/poster/hands/arm-peace.svg", 0],
};
// bar -> analyser bin (fftSize 64 gives 32 bins; an mp3 has little above bin 22). Scrambled and
// repeated across the crowd so the bass does not all land on one side.
const BINS = CROWD.map((_, i) => 1 + ((i * 7 + 3) % 22));

const bySlug = new Map(artists.map((a) => [a.slug, a]));
const playable = days.flatMap((d) =>
  [...d.rows.flat(), ...d.also].filter((e) => e.slug).map((e) => ({ ...e, day: d.id })));

const fontFaces = (base) => {
  const src = (f) => `url(${JSON.stringify(base + "assets/fonts/" + f)}) format("woff2")`;
  const face = (f, range) =>
    `@font-face{font-family:"ML Antonio";src:${src(f)};font-weight:100 700;font-style:normal;font-display:swap;unicode-range:${range}}`;
  return face("antonio-latin.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
    + face("antonio-latin-ext.woff2", "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF");
};

const speakerSvg = `<svg class="ml-speaker" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 9.5h3.6L11.5 5v14l-4.9-4.5H3z" fill="currentColor"/><g class="ml-speaker-on" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 9.2a4 4 0 0 1 0 5.6"/><path d="M17.8 6.6a7.6 7.6 0 0 1 0 10.8"/></g><g class="ml-speaker-off" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15.5 9.5l5 5M20.5 9.5l-5 5"/></g></svg>`;
const shuffleSvg = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3.5c4.5 0 6.5 10 11 10H21"/><path d="M3 17h3.5c1.8 0 3-1.6 4.1-3.5M13.4 10.5C14.5 8.6 15.7 7 17.5 7H21"/><path d="M18.5 4.5L21 7l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5"/></svg>`;
const playSvg = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="ml-icon-play" d="M8 5.5v13l10.5-6.5z" fill="currentColor"/><g class="ml-icon-pause" fill="currentColor"><rect x="6.5" y="5.5" width="4" height="13" rx="1"/><rect x="13.5" y="5.5" width="4" height="13" rx="1"/></g></svg>`;
const star =`<span class="ml-star" aria-hidden="true">★</span>`;

const markup = (uid) => `
<header class="ml-top">
  <div class="ml-sun" aria-hidden="true">${sunSvg}</div>
  <div class="ml-clouds" aria-hidden="true">${cloudsSvg}</div>
  <div class="ml-masthead">
    <h1 class="ml-logo"><span class="ml-sr">meet Lollapalooza</span>${logoSvg}</h1>
    <p class="ml-info">
      <span class="ml-when"><span class="ml-when-days">August 3-6</span> <span class="ml-when-year">${star} 2017 ${star}</span></span>
      <span class="ml-where"><span>Grant Park</span> <span>Chicago</span></span>
    </p>
  </div>
</header>
<main class="ml-lineup" aria-label="Lineup">${days.map((d) => `
  <section class="ml-dayblock" data-day="${d.id}" aria-labelledby="ml-day-${uid}-${d.id}">
    <h2 class="ml-day" id="ml-day-${uid}-${d.id}"><span>${d.label}</span><span class="ml-sr">, ${d.date}</span></h2>
  </section>`).join("")}
</main>
<div class="ml-city" aria-hidden="true">
  <div class="ml-sky ml-sky-back">${skylineBackSvg}</div>
  <div class="ml-sky ml-sky-front">${skylineFrontSvg}</div>
</div>
<div class="ml-crowd">
  <div class="ml-visual" aria-hidden="true"></div>
  <div class="ml-player" role="region" aria-label="Player">
    <div class="ml-controls">
      <button type="button" class="ml-shuffle">${shuffleSvg}<span>Shuffle</span></button>
      <button type="button" class="ml-play" aria-label="Play">${playSvg}</button>
    </div>
    <div class="ml-np">
      <p class="ml-np-line"><span class="ml-np-name" aria-live="polite">Tap a name or shuffle</span><span class="ml-np-day"></span></p>
      <div class="ml-progress-row">
        <div class="ml-progress" role="slider" tabindex="-1" aria-label="Position in the 30-second preview" aria-valuemin="0" aria-valuemax="30" aria-valuenow="0" aria-valuetext="0 of 30 seconds" aria-disabled="true"><span class="ml-progress-fill"></span></div>
        <span class="ml-time" aria-hidden="true">0:00 / 0:30</span>
      </div>
    </div>
    <div class="ml-extras">
      <a class="ml-youtube" target="_blank" rel="noopener" hidden>Full song on YouTube</a>
      <button type="button" class="ml-mute" aria-label="Mute" aria-pressed="false">${speakerSvg}</button>
    </div>
    <p class="ml-credit">Site by <a href="https://tristantimblin.dev" target="_blank" rel="noopener">Tristan Timblin</a>, 2017 · a school project, restyled in 2026 after the official poster.</p>
  </div>
  <audio class="ml-audio" preload="none" crossorigin="anonymous"></audio>
</div>`;

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * @param {HTMLElement} host  a full-size box; meet Lolla fills it and scrolls inside it
 * @param {{ assetBase?: string }} opts  repo root ending in "/", e.g.
 *   https://tatimblin.github.io/meetLolla/ ; media is ${assetBase}src/...
 * @returns {{ destroy(): void }}
 */
export function mount(host, { assetBase = "" } = {}) {
  if (!host) throw new Error("meet-lolla: mount(el) needs an element");
  if (assetBase && !assetBase.endsWith("/")) assetBase += "/";
  instances.get(host)?.destroy();

  const ac = new AbortController();
  const { signal } = ac;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const still = () => reduceMotion.matches;

  const root = el("div", "meet-lolla");
  const style = document.createElement("style");
  style.textContent = fontFaces(assetBase) + css;
  root.append(style);
  const uid = ++seq;
  root.insertAdjacentHTML("beforeend", markup(uid));
  host.append(root);

  const $ = (sel) => root.querySelector(sel);
  const audio = /** @type {HTMLAudioElement} */ ($(".ml-audio"));
  const muteBtn = $(".ml-mute");
  const shuffleBtn = $(".ml-shuffle");
  const lineup = $(".ml-lineup");
  const playBtn = $(".ml-play");
  const player = $(".ml-player");
  const npName = $(".ml-np-name");
  const npDay = $(".ml-np-day");
  const progress = $(".ml-progress");
  const progressFill = $(".ml-progress-fill");
  const timeEl = $(".ml-time");
  const linkEl = /** @type {HTMLAnchorElement} */ ($(".ml-youtube"));
  const city = $(".ml-city");
  const visual = $(".ml-visual");
  for (const svg of root.querySelectorAll(".ml-logo svg, .ml-sun svg, .ml-clouds svg, .ml-city svg")) {
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
  }

  // --- wordmark sticker outline ----------------------------------------------------------
  // Each letter gets a white halo: a copy of it, stroked thick in white, in a layer behind all
  // the letters. The copy keeps the letter's class, so it pops in with its letter (same
  // keyframes, timing and origin), and the halos merge into one white border once all are in.
  const logo = $(".ml-logo svg");
  const halos = document.createElementNS("http://www.w3.org/2000/svg", "g");
  halos.setAttribute("class", "ml-halos");
  for (const letter of logo.querySelectorAll(':scope > [class^="ml-logo-"]')) {
    const copy = /** @type {Element} */ (letter.cloneNode(true));
    copy.classList.add("ml-halo");
    halos.append(copy);
  }
  logo.prepend(halos);

  // --- the crowd -----------------------------------------------------------------------
  const src = (f) => `url(${JSON.stringify(assetBase + "src/" + f)})`;
  const bars = CROWD.map(([k, x, tilt, size, z, h0, keep]) => {
    const [hand, l, r, clip, arm, outline] = HANDS[k];
    const u = (v) => (v / 300).toFixed(4);   // viewBox units -> fraction of the hand size
    const bar = el("div", "ml-hand");
    bar.dataset.narrow = String(keep);
    const set = (p, v) => bar.style.setProperty(p, v);
    set("--x", `${x}%`); set("--tilt", `${tilt}deg`); set("--s0", `${size}px`);
    set("--aw", u(r - l)); set("--wx", u((l + r) / 2)); set("--clip", u(300 - clip)); set("--ow", u(outline));
    set("--z", String(z)); set("--h0", `${h0}px`); set("--hand", src(hand));
    set("--arm", arm.startsWith("#") ? arm : `${src(arm)} 0 0 / 100% auto repeat-y`);
    visual.append(bar);
    return bar;
  });

  // --- state ---------------------------------------------------------------------------
  /** @type {(typeof playable)[number] | null} */ let current = null;
  let destroyed = false;
  /** @type {AudioContext | null} */ let ctx = null;
  /** @type {AnalyserNode | null} */ let analyser = null;
  let freq = new Uint8Array(0);
  let raf = 0, scrollRaf = 0, fitRaf = 0;
  let advancing = false;   // one advance per clip, even if timeupdate and ended both fire
  let lastUserScroll = -Infinity, ownScrollUntil = 0;

  // --- lineup: all four days, like the admat -------------------------------------------
  function nameNode(entry) {
    if (!entry.slug) return el("span", "ml-name ml-name-off", entry.name);
    const b = el("button", "ml-name", entry.name);
    b.type = "button";
    b.dataset.slug = entry.slug;
    return b;
  }
  function rowNode(entries, cls) {
    const row = el("p", cls);
    entries.forEach((e, i) => {
      if (i) row.append(el("span", "ml-dot", "•"));
      row.append(nameNode(e));
    });
    for (const dot of row.querySelectorAll(".ml-dot")) dot.setAttribute("aria-hidden", "true");
    return row;
  }
  for (const block of lineup.querySelectorAll(".ml-dayblock")) {
    const day = days.find((d) => d.id === block.dataset.day);
    block.append(...day.rows.map((r, i) => rowNode(r, i ? "ml-row" : "ml-row ml-row-top")));
    if (day.also.length) {
      const also = rowNode(day.also, "ml-row ml-row-also");
      also.prepend(el("span", "ml-also-label", "Also:"));
      block.append(also);
    }
  }

  function markPlaying() {
    for (const b of lineup.querySelectorAll("button.ml-name")) {
      const on = !!current && b.dataset.slug === current.slug;
      b.classList.toggle("ml-is-playing", on);
      if (on) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    }
  }

  // Rows are sized like the poster: one base size for the whole lineup, chosen so the rows fit
  // the width (each may grow a little to fill); a row that nearly fills it is justified, shorter
  // ones are centred, and on narrow screens a row that would get too small is split into
  // balanced lines. Widths scale linearly with font size: one measurement per row suffices.
  function fit() {
    if (destroyed || fitRaf) return;
    fitRaf = requestAnimationFrame(() => { fitRaf = 0; fitNow(); });
  }
  function fitNow() {
    const rows = [...lineup.querySelectorAll(".ml-row")];
    const cs = getComputedStyle(lineup);
    const W = lineup.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (!rows.length || W <= 0) return;
    const REF = 20;
    for (const br of lineup.querySelectorAll(".ml-br")) br.remove();
    for (const d of lineup.querySelectorAll(".ml-dot-br")) d.classList.remove("ml-dot-br");
    lineup.classList.add("ml-measuring");
    for (const r of rows) r.style.setProperty("--fs", `${REF}px`);
    const k = rows.map((r) => r.scrollWidth / REF);
    // each child's left edge, in em
    const parts = rows.map((r) => {
      const x0 = r.getBoundingClientRect().left;
      return [...r.children].map((c) => ({ c, x: (c.getBoundingClientRect().left - x0) / REF }));
    });
    lineup.classList.remove("ml-measuring");
    const isTop = (r) => r.classList.contains("ml-row-top");
    const isAlso = (r) => r.classList.contains("ml-row-also");
    const minFit = Math.min(...rows.filter((r) => !isTop(r) && !isAlso(r)).map((r) => W / k[rows.indexOf(r)]));
    const base = clamp(minFit, W < 520 ? 17 : 18, 34);
    rows.forEach((r, i) => {
      let fs = clamp(W / k[i], base, base * 1.18);   // rows may grow a little to fill, like the poster
      if (isTop(r)) fs = clamp(W / k[i], base * 1.15, base * 1.6);
      if (isAlso(r)) fs = Math.max(15, base * 0.72);
      const fill = (k[i] * fs) / W;
      r.style.setProperty("--fs", `${fs.toFixed(2)}px`);
      r.classList.toggle("ml-wrap", fill > 1.001);
      r.classList.toggle("ml-justify", fill <= 1.001 && fill > 0.8 && !isAlso(r));
      if (fill > 1.001) breakRow(r, parts[i], k[i], Math.ceil(fill / 0.97));
    });
    lineup.style.setProperty("--ml-base", `${base.toFixed(2)}px`);
  }

  // Split a row that is too wide into `lines` balanced, centred lines, breaking at bullets
  // (the bullet at a break is hidden) rather than letting flex-wrap leave a dangling bullet.
  function breakRow(row, items, total, lines) {
    const dots = items.filter((p) => p.c.classList.contains("ml-dot"));
    let prev = -Infinity;
    for (let m = 1; m < lines; m++) {
      const target = (total * m) / lines;
      let best = null;
      for (const d of dots) {
        if (d.x <= prev) continue;
        if (!best || Math.abs(d.x - target) < Math.abs(best.x - target)) best = d;
      }
      if (!best) break;
      prev = best.x;
      best.c.classList.add("ml-dot-br");
      best.c.after(el("span", "ml-br"));
    }
  }

  // --- audio ---------------------------------------------------------------------------
  function ensureGraph() {
    if (!ctx) {
      const AC = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      const source = ctx.createMediaElementSource(audio);   // exactly once per <audio>
      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      freq = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      analyser.connect(ctx.destination);
    }
    ctx.resume().catch(() => {});
  }

  function play(entry) {
    current = entry;
    advancing = false;
    root.classList.add("ml-has-played");
    const info = bySlug.get(entry.slug);
    const day = days.find((d) => d.id === entry.day);
    npName.replaceChildren(el("span", "ml-sr", "Now playing: "), entry.name);
    npDay.textContent = `${day.label.slice(0, 3)} · ${day.date.replace(/, \d{4}$/, "")}`;
    if (info) {
      linkEl.href = info.link;
      linkEl.setAttribute("aria-label", `Full song by ${entry.name} on YouTube`);
      linkEl.hidden = false;
    }
    progress.tabIndex = 0;
    progress.setAttribute("aria-disabled", "false");
    showProgress(0);
    markPlaying();
    audio.src = `${assetBase}src/audio/${encodeURIComponent(entry.slug)}.mp3`;
    audio.play().catch(() => { /* aborted by the next tap, or blocked; the next tap retries */ });
  }

  function pickRandom() {
    let e;
    do e = playable[Math.floor(Math.random() * playable.length)];
    while (playable.length > 1 && e === current);
    return e;
  }

  // Bring the playing name into view inside the root (never scrollIntoView: it would scroll the
  // host page too), between the top and the crowd standing on the player bar. Quiet if visible.
  function reveal(slug) {
    const b = lineup.querySelector(`button.ml-name[data-slug="${CSS.escape(slug)}"]`);
    if (!b) return;
    const r = root.getBoundingClientRect();
    const box = b.getBoundingClientRect();
    const top = box.top - r.top;
    const clearBottom = player.getBoundingClientRect().top - r.top - visual.offsetHeight * 0.6;
    if (top >= 8 && box.bottom - r.top <= clearBottom) return;
    ownScrollUntil = performance.now() + 1500;
    root.scrollTo({
      top: Math.max(0, root.scrollTop + top - Math.max(8, (clearBottom - box.height) / 2)),
      behavior: still() ? "auto" : "smooth",
    });
  }

  function shuffle() {
    const e = pickRandom();
    play(e);
    reveal(e.slug);
  }

  // Each preview plays for up to 30s, then the next random artist. Auto-advance follows along
  // only if the listener isn't reading elsewhere: it scrolls to the new name only when that name
  // is off screen and the user hasn't scrolled for a few seconds.
  function advance() {
    if (advancing || destroyed) return;
    advancing = true;
    const e = pickRandom();
    play(e);
    if (performance.now() - lastUserScroll > USER_SCROLL_QUIET_MS) reveal(e.slug);
  }

  // --- progress: a 30s bar, seekable by click and arrow keys --------------------------
  const clipLength = () => Math.min(PREVIEW_S, Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : PREVIEW_S);
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  function showProgress(t) {
    const max = clipLength();
    const v = clamp(t, 0, max);
    progressFill.style.transform = `scaleX(${(v / max).toFixed(4)})`;
    timeEl.textContent = `${mmss(v)} / ${mmss(max)}`;
    progress.setAttribute("aria-valuemax", String(Math.round(max)));
    progress.setAttribute("aria-valuenow", String(Math.round(v)));
    progress.setAttribute("aria-valuetext", `${Math.round(v)} of ${Math.round(max)} seconds`);
  }
  function seek(t) {
    // only when the server allows it (Range requests); otherwise setting currentTime restarts
    if (!current || !Number.isFinite(audio.duration) || !audio.seekable.length || audio.seekable.end(0) <= 0) return;
    audio.currentTime = clamp(t, 0, clipLength() - 0.25);
    showProgress(audio.currentTime);
  }

  function setPlayButton(playing) {
    playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    root.classList.toggle("ml-is-playing", playing);
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!analyser) return;
    analyser.getByteFrequencyData(freq);
    for (let i = 0; i < bars.length; i++) {
      const b = BINS[i];
      const lvl = Math.min(1, (freq[b] / 255) * (1 + b / 30));
      bars[i].style.setProperty("--lvl", (lvl * lvl).toFixed(3));
    }
  }
  // Reduced motion: the crowd stays still.
  function startBars() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
  function stopBars() {
    cancelAnimationFrame(raf);
    raf = 0;
    for (const b of bars) b.style.removeProperty("--lvl");
  }

  // --- events --------------------------------------------------------------------------
  lineup.addEventListener("click", (ev) => {
    const b = /** @type {HTMLElement} */ (ev.target).closest?.("button.ml-name");
    if (!b) return;
    const entry = playable.find((e) => e.slug === b.dataset.slug);
    if (!entry) return;
    ensureGraph();
    play(entry);
    reveal(entry.slug);   // e.g. tapped while half behind the crowd
  }, { signal });

  shuffleBtn.addEventListener("click", () => { ensureGraph(); shuffle(); }, { signal });
  playBtn.addEventListener("click", () => {
    ensureGraph();
    if (!current) return shuffle();   // before anything has played, Play starts a shuffle
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, { signal });

  progress.addEventListener("click", (ev) => {
    const b = progress.getBoundingClientRect();
    seek(((ev.clientX - b.left) / b.width) * clipLength());
  }, { signal });
  progress.addEventListener("keydown", (ev) => {
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[ev.key];
    if (step != null) seek(audio.currentTime + step);
    else if (ev.key === "Home") seek(0);
    else if (ev.key === "End") seek(clipLength());
    else return;
    ev.preventDefault();
  }, { signal });

  function setMuted(m) {
    audio.muted = m;
    muteBtn.setAttribute("aria-pressed", String(m));
    root.classList.toggle("ml-is-muted", m);
  }
  muteBtn.addEventListener("click", () => setMuted(!audio.muted), { signal });
  // leaving for the full song: hush the preview (2017 behaviour)
  linkEl.addEventListener("click", () => setMuted(true), { signal });

  audio.addEventListener("playing", () => { setPlayButton(true); startBars(); }, { signal });
  audio.addEventListener("pause", () => { setPlayButton(false); stopBars(); }, { signal });
  audio.addEventListener("timeupdate", () => {
    showProgress(audio.currentTime);
    if (audio.currentTime >= PREVIEW_S) advance();
  }, { signal });
  audio.addEventListener("loadedmetadata", () => showProgress(audio.currentTime), { signal });
  audio.addEventListener("ended", () => { stopBars(); advance(); }, { signal });
  reduceMotion.addEventListener?.("change", () => {
    if (still()) stopBars(); else if (!audio.paused) startBars();
  }, { signal });

  // --- parallax: the root is the scroller; the skyline rises as it scrolls into view -------
  function applyScroll() {
    scrollRaf = 0;
    const view = root.scrollTop + root.clientHeight;
    const p = clamp((view - city.offsetTop) / city.offsetHeight, 0, 1);
    city.style.setProperty("--ml-p", p.toFixed(4));
  }
  const onScroll = () => {
    if (performance.now() > ownScrollUntil) lastUserScroll = performance.now();
    if (!scrollRaf) scrollRaf = requestAnimationFrame(applyScroll);
  };
  root.addEventListener("scroll", onScroll, { passive: true, signal });

  const ro = new ResizeObserver(() => { fit(); if (!scrollRaf) scrollRaf = requestAnimationFrame(applyScroll); });
  ro.observe(lineup);
  // Row widths depend on the font: refit once it has loaded.
  document.fonts?.load('600 20px "ML Antonio"').then(() => { if (!destroyed) fit(); }, () => {});

  fitNow();
  applyScroll();

  const instance = {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      ac.abort();
      ro.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      cancelAnimationFrame(fitRaf);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      ctx?.close().catch(() => {});
      ctx = null;
      analyser = null;
      root.remove();
      if (instances.get(host) === instance) instances.delete(host);
    },
  };
  instances.set(host, instance);
  return instance;
}

export default mount;
