# Crowd hands: assets and recipe

All hands use the same contract as `src/img/hand1-7.svg`: a 300x300 viewBox, wrist at the
bottom edge, wrist about 52 units wide. The arm is the `.ml-bar` element and the hand is its
`::before`. Monster hands have their wrist centred at x=150 (`--wx: .5`).

| file | what | arm (`.ml-bar` background) |
|---|---|---|
| hand-monster-claw.svg | green scaly lizard claw, black talons, yellow belly | `arm-claw.svg` (fallback `#8FCB45`) |
| hand-monster-rock.svg | magenta furry rock sign, eyes + fanged black band (the mouth) | `arm-rock.svg` (`#D25BC6`) |
| hand-monster-peace.svg | lavender spotted peace sign, yellow festival band | `arm-peace.svg` (`#A48BE0`) |
| hand-monster-eye.svg | yellow one-eyed open palm (optional 4th) | `arm-eye.svg` (`#F5CF33`) |
| hand1-band.svg / hand3-band.svg / hand6-band.svg | copies of hand1/3/6 with a festival wristband (yellow band, white tag, ribbon tails; hand6 has two bands) | same colour as the original |

The `arm-*.svg` files are 52x52 tiles with black side outlines. Use
`background: url(arm-x.svg) 0 0 / 100% auto repeat-y` so the arm stretches with bar height.

Wrist x as a fraction of the hand box (`--wx`), measured from the existing translateX values:
hand1 .486, hand2 .517, hand3 .557, hand4 .457, hand5 .457, hand6 .571, hand7 .517, monsters .5.

## Crowd recipe (22 bars)

- **Mix:** 18 human hands and 4 monsters. Keep monsters at least 4 bars apart and never at the
  outer edges. The order is claw (2), rock (8), eye (12), peace (18). With 20 bars, drop the eye.
- **Positions are irregular and fixed.** Use a hard-coded % left per bar (no runtime randomness,
  so the layout never changes between loads). Gaps vary from about 2% to 8%: tight clusters of
  2-3 overlapping hands, then a few wider gaps.
- **Tilt:** -18 to +15 degrees, alternating sign roughly but not strictly. Rotate the **bar**
  around the bottom of the arm (`transform-origin: 50% 100%`), never only the `::before`, so the
  hand stays on its arm and the arm still rises from the bottom.
- **Size jitter:** hands are 82-112 px on desktop (fists hand2/7 smaller at about 84, monsters
  larger at 104-112). Arm width follows size: `--bw: calc(var(--s) * .17)`, which equals the
  wrist width.
- **Height jitter:** each bar has a resting height `--h0` (10-46 px) plus the audio level times
  `--hr` (about 90 px). The bar animates `height` only. Because the rotation sits on the same
  element with its origin at the bottom, the arm grows along its tilted axis and the transform
  never has to be recomputed.
- **Overlap / z-order:** `--z` 1-4. Monsters and the bar in front of each cluster get the higher z.
  Run the arm 6 px past the bottom edge (`bottom: -6px`) so tilted arms do not show a gap at
  the corner.
- **Narrow (< 600 px):** hide the bars marked `narrow 0` (8 bars, which leaves 14) and scale hands
  to 0.82.

| # | hand | left % | tilt | size | z | h0 | narrow |
|---|---|---|---|---|---|---|---|
| 1 | hand1-band | 2.0 | -14 | 98 | 2 | 26 | 1 |
| 2 | **claw** | 5.6 | 6 | 112 | 3 | 38 | 1 |
| 3 | hand2 | 10.8 | -4 | 82 | 1 | 10 | 0 |
| 4 | hand5 | 13.4 | 10 | 100 | 2 | 32 | 1 |
| 5 | hand3-band | 16.2 | -8 | 96 | 1 | 20 | 0 |
| 6 | hand4 | 23.8 | 3 | 104 | 2 | 42 | 1 |
| 7 | hand7 | 27.0 | 14 | 84 | 3 | 14 | 0 |
| 8 | **rock** | 31.4 | -6 | 110 | 4 | 46 | 1 |
| 9 | hand6-band | 33.4 | 9 | 98 | 2 | 28 | 0 |
| 10 | hand1 | 38.2 | -16 | 96 | 1 | 20 | 1 |
| 11 | hand4 | 45.8 | 12 | 98 | 2 | 36 | 1 |
| 12 | **eye** | 49.0 | -3 | 104 | 3 | 24 | 0 |
| 13 | hand2 | 51.6 | 8 | 84 | 4 | 16 | 1 |
| 14 | hand3 | 57.2 | -12 | 100 | 2 | 40 | 1 |
| 15 | hand5 | 63.0 | 4 | 98 | 1 | 22 | 0 |
| 16 | hand7 | 65.6 | -9 | 84 | 3 | 12 | 1 |
| 17 | hand6 | 68.4 | 15 | 100 | 2 | 34 | 0 |
| 18 | **peace** | 75.8 | -10 | 110 | 3 | 44 | 1 |
| 19 | hand1-band | 79.6 | 7 | 96 | 2 | 26 | 1 |
| 20 | hand4 | 85.2 | -5 | 100 | 1 | 38 | 0 |
| 21 | hand3-band | 90.8 | 11 | 98 | 2 | 24 | 1 |
| 22 | hand5 | 96.4 | -18 | 100 | 3 | 30 | 1 |

Human arm colours are the same as now: hand1 `#ec9683`, hand2/5/6 `#c66e34`, hand3/7 `#e3937c`,
hand4 `#f6ba98`. The darker `#8a4a22` on hand6-band adds a deeper skin tone.

## CSS

Set the per-bar variables inline from a JS table, or with `:nth-child` rules.

```css
.meet-lolla .ml-visual { position: relative; height: 300px; overflow: hidden; container-type: inline-size; }
.meet-lolla .ml-bar {
  --bw: calc(var(--s) * .17);
  position: absolute;
  bottom: -6px;
  left: var(--x);
  width: var(--bw);
  margin-left: calc(var(--bw) / -2);
  height: calc(var(--h0) + var(--lvl, 0) * var(--hr, 90px)); /* JS sets --lvl 0..1 per frame */
  background: var(--arm);               /* colour, or url(arm-*.svg) 0 0 / 100% auto repeat-y */
  transform: rotate(var(--tilt));
  transform-origin: 50% 100%;
  z-index: var(--z, 1);
}
.meet-lolla .ml-bar::before {
  content: "";
  position: absolute;
  width: var(--s);
  height: var(--s);
  bottom: calc(100% - var(--s) * .02);  /* wrist overlaps the arm top by about 2% */
  left: calc(50% - var(--s) * var(--wx));
  background: var(--hand) top left / contain no-repeat;
}
@container (max-width: 600px) {
  .meet-lolla .ml-bar[data-narrow="0"] { display: none; }
  .meet-lolla .ml-bar { --s: calc(var(--s0) * .82) !important; }
}
/* example bar */
/* <div class="ml-bar" data-narrow="1" style="--x:31.4%;--tilt:-6deg;--s:110px;--s0:110px;--wx:.5;--z:4;--h0:46px;--hand:var(--ml-hand-rock);--arm:url(.../arm-rock.svg) 0 0/100% auto repeat-y"></div> */
```

If the visualiser sets `style.height` in px directly, keep that and fold `--h0` into the
value: `h = h0 + level * hr`. Do not animate `transform`, because that would overwrite the tilt.
