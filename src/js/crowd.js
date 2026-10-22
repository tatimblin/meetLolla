// The crowd of hands that is the audio visualiser: who stands where (CROWD), what each hand is
// drawn with (HANDS) and which analyser bin moves it (BINS). Pure data, the same on every load;
// mount() turns each CROWD entry into a .ml-hand.

// The crowd, as dense as the poster's: big hands packed edge to edge and overlapping, in two
// rows, mostly just hand and wristband with the arms cut off low. The back row is a little
// smaller and stands a little higher; the crowd shadow fills in behind them. Positions, sizes
// and rest heights are irregular but come from a fixed seed, so the crowd is identical on every
// load. Entries: [hand, x from the page centre, tilt deg, size, z, rest height]; x, size and rest
// height are in reference px, scaled by --u. About one human hand in eight leans, 3-5 degrees;
// monsters never lean, and each of the four appears once.
export const CROWD = (() => {
  let seed = 20170803;
  const rnd = () => {   // mulberry32
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // fists, peace and rock signs dominate, as in the poster; an open palm now and then
  const humans = ["h2", "h1", "h3b", "h7", "h6", "h1b", "h4", "h2", "h3", "h6b", "h7", "h1", "h5"];
  const small = new Set(["h2", "h7"]);   // fists read bigger, so draw them a little smaller
  // A strip much wider than any screen, centred on the page: a screen shows the middle of it
  // and hands load in or drop out at the edges as it resizes (mount()'s sizeCrowd). Pitch is in
  // reference px. Each monster appears exactly once, in the front row within nine hands of the
  // middle, at seeded random slots (the same on every load) with irregular gaps, never side by
  // side, in a shuffled order; one stands within three hands of the middle so a phone shows it.
  // The draw is made off a copy of the seed, so the rest of the crowd keeps its own draws.
  const HALF = 2400;
  const MONSTERS = (() => {   // slot from the middle -> monster
    const s0 = seed;
    const kinds = ["claw", "rock", "peace", "eye"];
    for (let i = kinds.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
    }
    let slots;
    for (;;) {
      const pick = new Set();
      while (pick.size < 4) pick.add(Math.floor(rnd() * 19) - 9);
      slots = [...pick].sort((a, b) => a - b);
      const gaps = slots.slice(1).map((s, i) => s - slots[i]);
      if (Math.min(...gaps) >= 2 && new Set(gaps).size > 1 && slots.some((s) => Math.abs(s) <= 3)) break;
    }
    seed = s0;
    return Object.fromEntries(slots.map((s, i) => [s, kinds[i]]));
  })();
  const rows = [
    // pitch, x jitter and offset (fractions of the pitch), size, rest height and z ranges; the
    // front row holds the monsters
    { pitch: 72, jitter: 0.55, shift: 0, s: [228, 252], h: [0, 26], z: [3, 5], front: true },
    { pitch: 103, jitter: 0.7, shift: 0.25, s: [206, 228], h: [24, 62], z: [1, 2], front: false },
  ];
  const out = [];
  let h = 0;
  for (const { pitch, jitter, shift, s, h: rest, z: zs, front } of rows) {
    const n = Math.ceil((2 * HALF) / pitch);
    const mid = Math.floor(n / 2);
    for (let i = 0; i < n; i++) {
      const x = -HALF + (i + 0.5) * pitch + (rnd() - 0.5) * pitch * jitter + pitch * shift;
      const monster = (front && MONSTERS[i - mid]) || null;
      let kind = monster;
      if (!kind) { kind = humans[h % humans.length]; h += 1 + (rnd() < 0.3 ? 1 : 0); }
      let size = s[0] + rnd() * (s[1] - s[0]);
      if (small.has(kind)) size *= 0.86;
      if (monster) size *= 1.06;
      const leans = rnd() < 0.09 && !monster;
      const lean = leans ? Math.round((3 + rnd() * 2) * (rnd() < 0.5 ? -1 : 1)) : 0;
      const h0 = Math.round(rest[0] + rnd() * (rest[1] - rest[0]));
      // front-row monsters stand in front of their neighbours, as in the poster
      const z = monster ? 6 : zs[0] + Math.floor(rnd() * (zs[1] - zs[0] + 1));
      out.push([kind, +x.toFixed(1), lean, Math.round(size), z, h0]);
    }
  }
  return out;
})();

// hand -> [file under src/, wrist left and right outer edge, clip line (all in the 300-unit
// viewBox, measured from the rendered SVGs), arm: skin colour sampled at the wrist or an arm tile,
// outline width in units]. The human hands are src/img's hands redrawn at the poster's line weight
// (4.2 units, about 8% of the wrist width, as in the poster); their wrist edges are the outer
// edges of that stroke. The arm is exactly as wide as the wrist and centred on it, with the same
// outline down its sides; the hand is clipped at the clip line (below it some hands draw a
// closing stroke) and overlaps the arm by 2 units, so hand and arm read as one limb. Every monster
// wrist is the same 102 units, centred, with no closing stroke; its outline is in its arm tile.
const dir = "svg/poster/hands/";
const human = (file, l, r, clip, skin) => [`${dir}${file}.svg`, l, r, clip, skin, 4.2];
const monster = (kind, arm = kind) => [`${dir}hand-monster-${kind}.svg`, 99, 201, 300, `${dir}arm-${arm}.svg`, 0];
export const HANDS = {
  h1: human("hand1", 117.15, 177.35, 290.5, "#ec9683"),
  h1b: human("hand1-band", 117.15, 177.35, 290.5, "#ec9683"),
  h2: human("hand2", 117.4, 191.1, 296.5, "#c66e34"),
  h3: human("hand3", 143.4, 195.1, 296.5, "#e3937c"),
  h3b: human("hand3-band", 143.4, 195.1, 296.5, "#e3937c"),
  h4: human("hand4", 109.4, 165.1, 296.5, "#f6ba98"),
  h5: human("hand5", 109.4, 165.1, 296.5, "#c66e34"),
  h6: human("hand6", 143.4, 195.1, 296.5, "#c66e34"),
  h6b: human("hand6-band", 143.4, 195.1, 296.5, "#c66e34"),
  h7: human("hand7", 117.4, 191.1, 296.5, "#e3937c"),
  claw: monster("claw"),
  rock: monster("rock"),
  eye: monster("eye", "claw"),   // the second green monster: same scaly arm as the claw
  peace: monster("peace"),
};

// hand -> analyser bin (fftSize 64 gives 32 bins; an mp3 has little above bin 22). Scrambled and
// repeated across the crowd so the bass does not all land on one side.
export const BINS = CROWD.map((_, i) => 1 + ((i * 7 + 3) % 22));
