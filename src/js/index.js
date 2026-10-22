// meet Lolla as an embeddable module: mount(el, { assetBase }) => { destroy() }.
//
// Everything renders inside `el` under one .meet-lolla root that is its own scroller. Nothing
// plays until a tap: the AudioContext is created on the first press of the play/next arrow.
// destroy() is idempotent and leaves no listeners, timers, audio or DOM behind.
import css from "../css/meet-lolla.css";
import logoSvg from "../svg/logo.svg";
import chicagoSvg from "../svg/chicago.svg";
import nextSvg from "../svg/next.svg";
import { artists } from "./artists.js";

const ADVANCE_MS = 30_000;   // each preview is a 30s clip
const BAR_COUNT = 20;        // the 2017 visualiser: fftSize 64 -> 32 bins, 32 / 1.6 bars
const PARALLAX_PX = 900;     // skrollr's data-0 .. data-900

const instances = new WeakMap();

// anime.js 2's default easing (easeOutElastic, elasticity 500), sampled into CSS linear().
function elasticEasing() {
  const p = 0.5;
  const elastic = (t) => t === 0 || t === 1 ? t
    : -Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1 - (p / (Math.PI * 2)) * Math.asin(1)) * (Math.PI * 2)) / p);
  const pts = [];
  for (let i = 0; i <= 60; i++) pts.push(+(1 - elastic(1 - i / 60)).toFixed(4));
  const value = `linear(${pts.join(", ")})`;
  return typeof CSS !== "undefined" && CSS.supports?.("animation-timing-function", value)
    ? value : "cubic-bezier(0.34, 1.56, 0.64, 1)";
}

const fontFaces = (base) => `
@font-face{font-family:"ML Patua One";src:url(${JSON.stringify(base + "assets/fonts/patua-one-latin.woff2")}) format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"ML Ubuntu Condensed";src:url(${JSON.stringify(base + "assets/fonts/ubuntu-condensed-latin.woff2")}) format("woff2");font-weight:400;font-style:normal;font-display:swap}
`;

const speaker = `<span class="ml-sound-icon" aria-hidden="true"><span class="ml-sound-speaker"><span class="ml-sound-box"></span><span class="ml-sound-cone"></span><span class="ml-sound-cover"><span class="ml-sound-bar"></span><span class="ml-sound-bar"></span></span></span></span>`;

const markup = (base) => `
<header class="ml-header">
  <div class="ml-header-top">
    <div class="ml-wrapper">
      <span class="ml-site-title"><img src="${base}src/img/meet-lolla-logo.png" alt="meet Lolla" width="150" height="60"></span>
      <nav class="ml-site-nav" aria-label="meet Lolla">
        <a class="ml-link ml-link-light" href="https://en.wikipedia.org/wiki/List_of_Lollapalooza_lineups_by_year#2017" target="_blank" rel="noopener">2017 Lineup</a>
      </nav>
    </div>
    <button type="button" class="ml-mute" aria-label="Mute" aria-pressed="false">${speaker}</button>
  </div>
  <div class="ml-header-sub-wrap">
    <div class="ml-header-sub">
      <h4>Lollapalooza Festival</h4>
      <h4>August 3-6, 2017</h4>
      <h4>Grant Park, Chicago, IL</h4>
    </div>
  </div>
</header>
<main class="ml-content">
  <div class="ml-logo" role="img" aria-label="meet Lollapalooza">${logoSvg}</div>
  <div class="ml-chicago" aria-hidden="true">${chicagoSvg}</div>
  <section class="ml-shuffle" aria-label="Artist preview">
    <div class="ml-shuffle-date">
      <h4 class="ml-date"></h4> <a class="ml-link ml-youtube" target="_blank" rel="noopener">Full Song On Youtube</a>
    </div>
    <div class="ml-shuffle-artist">
      <h1 class="ml-artist" aria-live="polite"></h1>
    </div>
    <div class="ml-shuffle-next">
      <button type="button" class="ml-next" aria-label="Play">${nextSvg}</button>
    </div>
    <p class="ml-hint" aria-hidden="true">Tap to play</p>
    <audio class="ml-audio" preload="none" crossorigin="anonymous"></audio>
  </section>
  <div class="ml-visual" aria-hidden="true">${
    Array.from({ length: BAR_COUNT }, (_, i) => `<div class="ml-bar" style="left:${i * 5}%"></div>`).join("")
  }</div>
</main>
<footer class="ml-footer">
  <div class="ml-footer-item ml-credit">
    ${speaker}
    <p>Site By <a class="ml-link ml-link-light" href="https://tristantimblin.dev" target="_blank" rel="noopener">Tristan Timblin</a>. 2017</p>
  </div>
  <div class="ml-footer-item ml-about">
    <p>Built June 2017 for Lollapalooza 2017. A school project.</p>
    <p><a class="ml-link ml-link-dark" href="https://en.wikipedia.org/wiki/List_of_Lollapalooza_lineups_by_year#2017" target="_blank" rel="noopener">Lollapalooza 2017 lineup</a></p>
  </div>
</footer>`;

/**
 * @param {HTMLElement} el  a full-size box; meet Lolla fills it and scrolls inside it
 * @param {{ assetBase?: string }} opts  repo root ending in "/", e.g.
 *   https://tatimblin.github.io/meetLolla/ ; media is ${assetBase}src/...
 * @returns {{ destroy(): void }}
 */
export function mount(el, { assetBase = "" } = {}) {
  if (!el) throw new Error("meet-lolla: mount(el) needs an element");
  if (assetBase && !assetBase.endsWith("/")) assetBase += "/";
  instances.get(el)?.destroy();

  const ac = new AbortController();
  const { signal } = ac;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const easing = elasticEasing();

  const root = document.createElement("div");
  root.className = "meet-lolla";
  for (let i = 1; i <= 7; i++) {
    root.style.setProperty(`--ml-hand-${i}`, `url(${JSON.stringify(`${assetBase}src/img/hand${i}.svg`)})`);
  }
  const style = document.createElement("style");
  style.textContent = fontFaces(assetBase) + css;
  root.append(style);
  root.insertAdjacentHTML("beforeend", markup(assetBase));
  el.append(root);

  const $ = (sel) => root.querySelector(sel);
  const audio = /** @type {HTMLAudioElement} */ ($(".ml-audio"));
  const nextBtn = $(".ml-next");
  const muteBtn = $(".ml-mute");
  const nameEl = $(".ml-artist");
  const dateEl = $(".ml-date");
  const linkEl = $(".ml-youtube");
  const arrow = nextBtn.querySelector("svg");
  const chicago = $(".ml-chicago");
  const bars = [...root.querySelectorAll(".ml-bar")];
  for (const svg of root.querySelectorAll(".ml-logo svg, .ml-chicago svg, .ml-next svg")) {
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
  }

  let current = Math.max(0, artists.findIndex((a) => a.slug === "chance-the-rapper"));
  let started = false;
  let destroyed = false;
  /** @type {AudioContext | null} */ let ctx = null;
  /** @type {AnalyserNode | null} */ let analyser = null;
  let freq = new Uint8Array(0);
  let timer = 0, raf = 0, scrollRaf = 0, swapTimer = 0;
  /** @type {Animation[]} */ let anims = [];

  // --- artist name, letter by letter ---------------------------------------------------
  function showName(name, animate) {
    for (const a of anims) a.cancel();
    anims = [];
    const sr = document.createElement("span");
    sr.className = "ml-sr";
    sr.textContent = name;
    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    const letters = [];
    name.split(" ").forEach((word, w) => {
      if (w) visual.append(" ");
      const wordEl = document.createElement("span");
      wordEl.className = "ml-word";
      for (const ch of word) {
        const l = document.createElement("span");
        l.className = "ml-letter";
        l.textContent = ch;
        wordEl.append(l);
        letters.push(l);
      }
      visual.append(wordEl);
    });
    nameEl.replaceChildren(sr, visual);
    if (!animate) return;
    letters.forEach((l, i) => {
      anims.push(l.animate(
        [
          { transform: "translateY(120px) scale(0)", maxWidth: "0px", opacity: 0 },
          { transform: "translateY(0) scale(1)", maxWidth: "1.2em", opacity: 1 },
        ],
        { duration: 700 + i * Math.random() * 500, easing, fill: "backwards" },
      ));
    });
    anims.push(nameEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 }));
  }

  function render(i, animate) {
    const a = artists[i];
    dateEl.textContent = a.date;
    linkEl.href = a.link;
    linkEl.setAttribute("aria-label", `Full song by ${a.name} on YouTube`);
    if (!animate) return showName(a.name, false);
    // the 2017 fadeOut("fast") before the swap
    const out = nameEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
    anims.push(out);
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => { out.cancel(); showName(a.name, true); }, 200);
  }

  // --- audio ---------------------------------------------------------------------------
  function ensureGraph() {
    if (ctx) return;
    const AC = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const source = ctx.createMediaElementSource(audio);   // exactly once per <audio>
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    freq = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(ctx.destination);
  }

  function play(i) {
    current = i;
    const animate = !reduceMotion.matches;
    render(i, animate);
    if (animate) {
      anims.push(arrow.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(-720deg)" }],
        { duration: 3000, easing },
      ));
    }
    audio.src = `${assetBase}src/audio/${encodeURIComponent(artists[i].slug)}.mp3`;
    audio.play().catch(() => { /* aborted by the next tap, or blocked; the next tap retries */ });
    restartTimer();
  }

  function next() {
    if (artists.length < 2) return play(0);
    let i;
    do i = Math.floor(Math.random() * artists.length); while (i === current);
    play(i);
  }

  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(next, ADVANCE_MS);
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!analyser) return;
    analyser.getByteFrequencyData(freq);
    for (let i = 0; i < bars.length; i++) bars[i].style.height = `${freq[i] / 2}px`;
  }
  function startBars() { if (!raf) raf = requestAnimationFrame(frame); }
  function stopBars() {
    cancelAnimationFrame(raf);
    raf = 0;
    for (const b of bars) b.style.height = "";
  }

  nextBtn.addEventListener("click", () => {
    ensureGraph();
    ctx?.resume().catch(() => {});
    if (!started) {
      started = true;
      root.classList.add("ml-has-played");
      nextBtn.setAttribute("aria-label", "Next artist");
      play(current);      // the first tap plays the artist already on screen
    } else {
      next();
    }
  }, { signal });

  function setMuted(m) {
    audio.muted = m;
    muteBtn.setAttribute("aria-pressed", String(m));
    root.classList.toggle("ml-is-muted", m);
  }
  muteBtn.addEventListener("click", () => setMuted(!audio.muted), { signal });
  // leaving for the full song: hush the preview (2017 behaviour)
  linkEl.addEventListener("click", () => { if (started) setMuted(true); }, { signal });

  audio.addEventListener("playing", startBars, { signal });
  audio.addEventListener("pause", stopBars, { signal });
  audio.addEventListener("ended", stopBars, { signal });

  // --- parallax: the root is the scroller ---------------------------------------------
  function applyScroll() {
    scrollRaf = 0;
    const p = Math.min(1, Math.max(0, root.scrollTop / PARALLAX_PX));
    chicago.style.setProperty("--ml-p", p.toFixed(4));
  }
  root.addEventListener("scroll", () => {
    if (!scrollRaf && !reduceMotion.matches) scrollRaf = requestAnimationFrame(applyScroll);
  }, { passive: true, signal });

  render(current, false);

  const instance = {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      ac.abort();
      clearInterval(timer);
      clearTimeout(swapTimer);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      for (const a of anims) a.cancel();
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      ctx?.close().catch(() => {});
      ctx = null;
      analyser = null;
      root.remove();
      if (instances.get(el) === instance) instances.delete(el);
    },
  };
  instances.set(el, instance);
  return instance;
}

export default mount;
