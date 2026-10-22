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
import crowdShadowSvg from "../svg/poster/crowd-shadow.svg";
import { artists } from "./artists.js";
import { days } from "./lineup.js";
import { CROWD, HANDS, BINS } from "./crowd.js";

const PREVIEW_S = 30;   // each preview plays for up to 30s, then the next artist
const USER_SCROLL_QUIET_MS = 4_000;   // auto-advance never scrolls within this long of the user scrolling

const instances = new WeakMap();
let seq = 0;   // per-mount id suffix, so two instances on one page never share ids

const bySlug = new Map(artists.map((a) => [a.slug, a]));
const playable = days.flatMap((d) =>
  [...d.rows.flat(), ...d.also].filter((e) => e.slug).map((e) => ({ ...e, day: d.id })));

const fontFaces = (base) => {
  const src = (f) => `url(${JSON.stringify(base + "assets/fonts/" + f)}) format("woff2")`;
  const face = (f, range) =>
    `@font-face{font-family:"ML Yanone";src:${src(f)};font-weight:200 700;font-style:normal;font-display:swap;unicode-range:${range}}`;
  return face("yanone-kaffeesatz-latin.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
    + face("yanone-kaffeesatz-latin-ext.woff2", "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF");
};

const speakerSvg = `<svg class="ml-speaker" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 9.5h3.6L11.5 5v14l-4.9-4.5H3z" fill="currentColor"/><g class="ml-speaker-on" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 9.2a4 4 0 0 1 0 5.6"/><path d="M17.8 6.6a7.6 7.6 0 0 1 0 10.8"/></g><g class="ml-speaker-off" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15.5 9.5l5 5M20.5 9.5l-5 5"/></g></svg>`;
const youtubeSvg = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6.5 5.5h11a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-11a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4zM10 8.8v6.4l5.4-3.2z"/></svg>`;
const shuffleSvg =`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3.5c4.5 0 6.5 10 11 10H21"/><path d="M3 17h3.5c1.8 0 3-1.6 4.1-3.5M13.4 10.5C14.5 8.6 15.7 7 17.5 7H21"/><path d="M18.5 4.5L21 7l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5"/></svg>`;
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
  <div class="ml-visual" aria-hidden="true"><div class="ml-crowd-shadow">${crowdShadowSvg}</div><div class="ml-sign">@lollapalooza</div></div>
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
      <a class="ml-youtube" target="_blank" rel="noopener" aria-label="Full song on YouTube" title="Full song on YouTube" hidden>${youtubeSvg}</a>
      <button type="button" class="ml-mute" aria-label="Mute" aria-pressed="false">${speakerSvg}</button>
    </div>
  </div>
  <audio class="ml-audio" preload="none" crossorigin="anonymous"></audio>
</div>
<footer class="ml-foot">
  <p class="ml-credit">Site by <a href="https://tristantimblin.dev" target="_blank" rel="noopener">Tristan Timblin</a> at <a href="https://drexel.edu/westphal/academics/undergraduate/user-experience/" target="_blank" rel="noopener">Drexel University</a>, original design by <a href="https://www.lollapalooza.com" target="_blank" rel="noopener">Lollapalooza</a></p>
</footer>`;

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
  for (const svg of root.querySelectorAll(".ml-logo svg, .ml-sun svg, .ml-clouds svg, .ml-city svg, .ml-crowd-shadow svg")) {
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
  const bars = CROWD.map(([k, x, tilt, size, z, h0]) => {
    const [hand, l, r, clip, arm, outline] = HANDS[k];
    const u = (v) => (v / 300).toFixed(4);   // viewBox units -> fraction of the hand size
    const bar = el("div", "ml-hand");
    const set = (p, v) => bar.style.setProperty(p, v);
    set("--x", String(x)); set("--tilt", `${tilt}deg`); set("--s0", String(size));
    set("--aw", u(r - l)); set("--wx", u((l + r) / 2)); set("--clip", u(300 - clip)); set("--ow", u(outline));
    set("--z", String(z)); set("--h0", String(h0)); set("--hand", src(hand));
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
  let lastUserScroll = -Infinity, ownScrollUntil = 0, ownScrolling = false;
  const HAS_SCROLLEND = "onscrollend" in root;

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
      if (i) row.append(el("span", "ml-dot"));
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
    let playing = null;
    for (const b of lineup.querySelectorAll("button.ml-name")) {
      const on = !!current && b.dataset.slug === current.slug;
      b.classList.toggle("ml-is-playing", on);
      if (on) { b.setAttribute("aria-current", "true"); playing = b; } else b.removeAttribute("aria-current");
    }
    setDancer(still() ? null : playing);
  }

  // --- the playing name dances -----------------------------------------------------------
  // The playing name is split into one span per letter (hidden from assistive tech; the button
  // keeps the name as its aria-label), each letter driven by its own analyser bin in frame().
  // The whole word is run through a per-mount SVG filter (turbulence + displacement) whose
  // strength follows the overall loudness, so loud passages make it wobble a little.
  const warpId = `ml-warp-${uid}`;
  root.insertAdjacentHTML("beforeend", `<svg class="ml-defs" aria-hidden="true" focusable="false" width="0" height="0"><filter id="${warpId}" x="-6%" y="-35%" width="112%" height="170%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.07" numOctaves="1" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`);
  const turb = root.querySelector(`#${warpId} feTurbulence`);
  const disp = root.querySelector(`#${warpId} feDisplacementMap`);
  // WebKit (Safari, and every browser on iOS) renders url() filters on HTML at 1x and smears them
  // when they animate: no warp there.
  const ua = navigator.userAgent;
  const canWarp = !(/AppleWebKit/.test(ua) && !/Chrome|Chromium|Android/.test(ua)) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  const NAME_SCALE = 1.34;   // keep in step with the CSS scale on .ml-name.ml-is-playing
  /** @type {null | { b: HTMLElement, name: string, ls: HTMLElement[], bins: number[], env: Float32Array, avg: Float32Array, peak: Float32Array, kick: number, bass: number, loud: number, warp: boolean }} */
  let dancer = null;

  function setDancer(b) {
    if (dancer?.b === b) return;
    if (dancer) {
      const d = dancer;
      d.b.textContent = d.name;
      d.b.removeAttribute("aria-label");
      d.b.style.removeProperty("filter");
      d.b.style.removeProperty("transform");
      d.b.style.removeProperty("transform-origin");
      dancer = null;
    }
    if (!b) return;
    const name = b.textContent;
    b.setAttribute("aria-label", name);
    const ls = [];
    const frag = document.createDocumentFragment();
    for (const ch of name) {
      if (ch === " ") { frag.append(" "); continue; }
      const s = el("span", "ml-l", ch);
      s.setAttribute("aria-hidden", "true");
      frag.append(s);
      ls.push(s);
    }
    b.replaceChildren(frag);
    // neighbouring letters listen to bins far apart, so the word bounces all over, not in a ramp
    const bins = ls.map((_, i) => 1 + ((i * 7 + 2) % 17));
    const n = ls.length;
    dancer = { b, name, ls, bins, env: new Float32Array(n), avg: new Float32Array(n), peak: new Float32Array(n).fill(0.2),
      kick: 0, bass: 0, loud: 0, warp: false };
    placeDancer();
    if (!audio.paused) startBars();
  }

  // Grow from the centre, unless that would push the name past the edge of the lineup: then
  // grow from the side that keeps it inside.
  function placeDancer() {
    if (!dancer) return;
    const b = dancer.b;
    // layout offsets, not the bounding box: the playing name is already scaled
    const left = root.getBoundingClientRect().left;
    const L = left + 6, R = L + root.clientWidth - 12;
    const w = b.offsetWidth;
    let x0 = left + b.offsetLeft;
    for (let p = b.offsetParent; p && p !== root; p = p.offsetParent) x0 += p.offsetLeft;
    const s = NAME_SCALE * 1.08 - 1;   // plus the loudest kick
    let o = 0.5;
    if (x0 - o * w * s < L) o = (x0 - L) / (w * s);
    if (x0 - o * w * s + w * (1 + s) > R) o = (x0 + w * (1 + s) - R) / (w * s);
    b.style.transformOrigin = `${(clamp(o, 0, 1) * 100).toFixed(1)}% 60%`;
  }

  // one frame of the dance; `live` is false while paused, when everything eases back to rest.
  // Returns whether anything is still moving.
  function danceFrame(t, live) {
    const d = dancer;
    if (!d) return false;
    let moving = false;
    for (let i = 0; i < d.ls.length; i++) {
      const b = d.bins[i];
      const raw = live ? Math.min(1, (freq[b] / 255) * (1 + b / 20)) : 0;
      // Each letter reacts to its band rising above its own running average (a hit), scaled
      // against its own recent peak so quiet bands dance too; a little of the steady level
      // keeps it bobbing between hits.
      d.peak[i] = Math.max(raw, d.peak[i] * 0.993, 0.2);
      const floor = d.avg[i] * 0.95;
      const hit = clamp((raw - floor) / Math.max(0.18, d.peak[i] - floor), 0, 1);
      d.avg[i] += (raw - d.avg[i]) * 0.05;
      const target = 0.7 * hit * hit + 0.3 * (raw / d.peak[i]);
      const e = d.env[i] += (target - d.env[i]) * (target > d.env[i] ? 0.55 : 0.16);
      if (e > 0.003) moving = true;
      const y = -0.22 * e;
      const r = 7 * e * Math.sin(t * 0.0045 + i * 1.9);
      const s = 1 + 0.14 * e;
      d.ls[i].style.transform = `translateY(${y.toFixed(3)}em) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
    }
    // the beat: bass jumping above its own slow average kicks the whole word
    const bass = live ? (freq[1] + freq[2] + freq[3]) / 765 : 0;
    const onset = Math.max(0, bass - d.bass * 1.04) / Math.max(0.1, d.bass);
    d.bass += (bass - d.bass) * 0.1;
    d.kick = Math.max(d.kick * 0.85, Math.min(1, onset * 10));
    let sum = 0;
    for (let b = 1; b <= 16; b++) sum += freq[b];
    const loud = live ? Math.min(1, sum / (16 * 255) * 1.35) : 0;
    d.loud += (loud - d.loud) * (loud > d.loud ? 0.3 : 0.08);
    if (d.kick > 0.003 || d.loud > 0.003) moving = true;
    const sway = 2.2 * d.loud * Math.sin(t * 0.0021);
    d.b.style.transform = `rotate(${sway.toFixed(2)}deg) scale(${(1 + 0.08 * d.kick).toFixed(3)})`;
    // the warp: the word always wobbles a little while music plays, liquefies more with the
    // loudness (squared, so loud passages warp most) and on each kick, up to about a third of
    // the font size; the noise field drifts slowly so the wobble never repeats
    if (canWarp) {
      const fs = parseFloat(d.b.parentElement?.style.getPropertyValue("--fs")) || 24;
      const amt = fs * Math.min(0.36, 0.1 * Math.min(1, d.loud * 3) + 0.2 * Math.max(0, d.loud - 0.2) ** 2 / 0.64 + 0.08 * d.kick);
      const on = amt > 0.05;
      if (on !== d.warp) { d.warp = on; d.b.style.filter = on ? `url(#${warpId})` : ""; }
      if (on) {
        disp.setAttribute("scale", amt.toFixed(2));
        turb.setAttribute("baseFrequency", `${(0.03 + 0.008 * Math.sin(t * 0.0009)).toFixed(4)} ${(0.07 + 0.015 * Math.sin(t * 0.0013 + 1)).toFixed(4)}`);
      }
    }
    return moving;
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
    // on phones a row that only just fits would span edge to edge between centred wrapped rows,
    // so rows stay at the base size, the top billing stays big, and near-full rows wrap too
    const narrow = root.clientWidth <= 600;   // the same cut as the CSS's phone layout
    const minFit = Math.min(...rows.map((r, i) => (isTop(r) || isAlso(r) ? Infinity : W / k[i])));
    const base = clamp(minFit, narrow ? 17 : 18, 34);
    rows.forEach((r, i) => {
      // rows grow to fill, like the poster, whose undercard caps run 18-24px at 792 wide
      // a day's last row grows less and is centred unless it nearly fills the width; the
      // poster's PHAM ... MAX is a size smaller than the rows above it, centred at 75% wide
      const last = !r.nextElementSibling || isAlso(/** @type {HTMLElement} */ (r.nextElementSibling));
      let fs = narrow ? base : clamp(W / k[i], base, base * (last ? 1.1 : 1.25));
      if (isTop(r)) fs = narrow ? base * 1.45 : clamp(W / k[i], base * 1.15, base * 1.48);
      if (isAlso(r)) fs = Math.max(15, base * 0.72);
      const fill = (k[i] * fs) / W;
      const wrap = fill > (narrow && !isAlso(r) ? 0.85 : 1.001);
      r.style.setProperty("--fs", `${fs.toFixed(2)}px`);
      r.classList.toggle("ml-wrap", wrap);
      r.classList.toggle("ml-justify", !wrap && fill > (last ? 0.9 : 0.8) && !isAlso(r));
      if (wrap) breakRow(r, parts[i], k[i], Math.max(2, Math.ceil(fill / 0.97)));
    });
    lineup.style.setProperty("--ml-base", `${base.toFixed(2)}px`);
    placeDancer();
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
    root.classList.add("ml-has-played");
    const info = bySlug.get(entry.slug);
    const day = days.find((d) => d.id === entry.day);
    npName.replaceChildren(el("span", "ml-sr", "Now playing: "), entry.name);
    npDay.textContent = `${day.label.slice(0, 3)} · ${day.date.replace(/, \d{4}$/, "")}`;
    if (info) {
      linkEl.href = info.link;
      linkEl.setAttribute("aria-label", `Full song by ${entry.name} on YouTube`);
      linkEl.title = `Full song by ${entry.name} on YouTube`;
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
    const target = Math.max(0, root.scrollTop + top - Math.max(8, (clearBottom - box.height) / 2));
    ownScrollUntil = performance.now() + 1500;   // or until scrollend, whichever is later
    ownScrolling = HAS_SCROLLEND && Math.abs(target - root.scrollTop) > 1;
    root.scrollTo({ top: target, behavior: still() ? "auto" : "smooth" });
  }

  function shuffle() {
    const e = pickRandom();
    play(e);
    reveal(e.slug);
  }

  // Each preview plays for up to 30s, then the next random artist. Auto-advance follows along
  // only if the listener isn't reading elsewhere: it scrolls to the new name only when that name
  // is off screen and the user hasn't scrolled for a few seconds. (Changing src drops the old
  // clip's queued events, so timeupdate and ended can't both advance one clip.)
  function advance() {
    if (destroyed) return;
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

  // While paused the loop keeps running only until the playing name has settled.
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!analyser) return;
    const live = !audio.paused;
    analyser.getByteFrequencyData(freq);
    if (live) {
      for (let i = 0; i < bars.length; i++) {
        if (bars[i].hidden) continue;   // past the screen edges (sizeCrowd)
        const b = BINS[i];
        const lvl = Math.min(1, (freq[b] / 255) * (1 + b / 30));
        bars[i].style.setProperty("--lvl", (lvl * lvl).toFixed(3));
      }
    }
    if (!danceFrame(t, live) && !live) { cancelAnimationFrame(raf); raf = 0; }
  }
  // Reduced motion: the crowd stays still and the playing name only grows.
  function startBars() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
  function stopBars() {
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
  // a clip that fails to load (404, network) would otherwise stall the shuffle for good; after a
  // few failures in a row (offline) stop trying until something plays
  let failures = 0;
  audio.addEventListener("playing", () => { failures = 0; }, { signal });
  audio.addEventListener("error", () => { if (current && ++failures < 3) advance(); }, { signal });
  reduceMotion.addEventListener?.("change", () => {
    if (still()) { cancelAnimationFrame(raf); raf = 0; stopBars(); }
    markPlaying();
    if (!still() && !audio.paused) startBars();
  }, { signal });

  // --- parallax: the root is the scroller; the skyline rises as it scrolls into view -------
  function applyScroll() {
    scrollRaf = 0;
    const view = root.scrollTop + root.clientHeight;
    const p = clamp((view - city.offsetTop) / city.offsetHeight, 0, 1);
    city.style.setProperty("--ml-p", p.toFixed(4));
  }
  const queueScroll = () => { if (!scrollRaf) scrollRaf = requestAnimationFrame(applyScroll); };
  const onScroll = () => {
    if (!ownScrolling && performance.now() > ownScrollUntil) lastUserScroll = performance.now();
    queueScroll();
  };
  root.addEventListener("scroll", onScroll, { passive: true, signal });
  // a long smooth scroll of our own can outlast the timeout; where scrollend exists it ends it
  if (HAS_SCROLLEND) root.addEventListener("scrollend", () => { ownScrolling = false; }, { signal });

  // Hands keep a size set mostly by the window's height (so a short desktop window doesn't fill
  // up with hands), and the page width decides how many show: the strip is centred and hands
  // past the edges are dropped, so they load in or out as the window resizes.
  let lastU = 0, lastHalf = 0;
  function sizeCrowd() {
    const W = root.clientWidth, H = root.clientHeight;
    if (!W || !H) return;
    const u = clamp(Math.min(H / 940, W / 1100), 0.6, 1);
    const half = W / 2 / u + 160;   // reference px either side of the centre, plus a hand's reach
    if (u === lastU && half === lastHalf) return;
    lastU = u; lastHalf = half;
    root.style.setProperty("--ml-u", `${u.toFixed(4)}px`);
    CROWD.forEach((c, i) => { bars[i].hidden = Math.abs(c[1]) > half; });
  }

  // only the root: the lineup's own height changes with every fit, which would refit twice
  const ro = new ResizeObserver(() => { fit(); sizeCrowd(); queueScroll(); });
  ro.observe(root);
  sizeCrowd();
  // Row widths depend on the font: refit once it has loaded.
  document.fonts?.load('600 20px "ML Yanone"').then(() => { if (!destroyed) fit(); }, () => {});

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
