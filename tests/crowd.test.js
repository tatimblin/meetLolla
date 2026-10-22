import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { BINS, CROWD, HANDS } from "../src/js/crowd.js";

const srcDir = resolve(import.meta.dir, "../src");
const MONSTERS = ["claw", "rock", "peace", "eye"];

describe("crowd", () => {
  test("every hand and arm tile it draws exists in src/", () => {
    const files = Object.values(HANDS).flatMap(([hand, , , , arm]) => [hand, ...(arm.startsWith("#") ? [] : [arm])]);
    expect(files.filter((f) => !existsSync(join(srcDir, f)))).toEqual([]);
  });

  test("every crowd entry is a known hand", () => {
    expect(CROWD.filter(([k]) => !HANDS[k]).map(([k]) => k)).toEqual([]);
  });

  test("each monster stands once, upright, in front, near the middle; one within phone width", () => {
    const monsters = CROWD.filter(([k]) => MONSTERS.includes(k));
    expect(monsters.map(([k]) => k).sort()).toEqual([...MONSTERS].sort());
    for (const [, x, tilt, , z] of monsters) {
      expect(tilt).toBe(0);
      expect(z).toBe(6);
      expect(Math.abs(x)).toBeLessThan(10 * 72);
    }
    expect(monsters.some(([, x]) => Math.abs(x) < 4 * 72)).toBe(true);
  });

  test("the strip is far wider than any screen, centred on the page", () => {
    const xs = CROWD.map(([, x]) => x);
    expect(Math.min(...xs)).toBeLessThan(-2000);
    expect(Math.max(...xs)).toBeGreaterThan(2000);
  });

  test("every hand listens to a bin with signal (1-22 of 32)", () => {
    expect(BINS.length).toBe(CROWD.length);
    expect(BINS.every((b) => b >= 1 && b <= 22)).toBe(true);
  });
});
