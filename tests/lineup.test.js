import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { artists } from "../src/js/artists.js";
import { days } from "../src/js/lineup.js";

const audioDir = resolve(import.meta.dir, "../src/audio");
const DATE_BY_DAY = { thu: "Thurs 8/03", fri: "Fri 8/04", sat: "Sat 8/05", sun: "Sun 8/06" };
const entries = days.flatMap((d) => [...d.rows.flat(), ...d.also].map((e) => ({ ...e, day: d.id })));
const linked = entries.filter((e) => e.slug);

describe("lineup", () => {
  test("days are Thursday to Sunday, in order", () => {
    expect(days.map((d) => d.id)).toEqual(["thu", "fri", "sat", "sun"]);
    expect(days.map((d) => d.date)).toEqual(["Aug 3, 2017", "Aug 4, 2017", "Aug 5, 2017", "Aug 6, 2017"]);
  });

  test("every row is a non-empty list of named entries", () => {
    for (const d of days) {
      expect(d.rows.length).toBeGreaterThan(0);
      for (const row of [...d.rows, d.also]) {
        for (const e of row) expect(typeof e.name).toBe("string");
      }
      for (const row of d.rows) expect(row.length).toBeGreaterThan(0);
    }
  });

  test("every slug is in artists.js and has a clip in src/audio", () => {
    const known = new Set(artists.map((a) => a.slug));
    expect(linked.filter((e) => !known.has(e.slug)).map((e) => e.slug)).toEqual([]);
    expect(linked.filter((e) => !existsSync(join(audioDir, `${e.slug}.mp3`))).map((e) => e.slug)).toEqual([]);
  });

  test("no artist appears twice", () => {
    const dupes = (vals) => vals.filter((v, i, all) => all.indexOf(v) !== i);
    expect(dupes(entries.map((e) => e.name.toLowerCase()))).toEqual([]);
    expect(dupes(linked.map((e) => e.slug))).toEqual([]);
  });

  test("every artists.js entry is in the lineup, on its own day", () => {
    const daysBySlug = new Map(linked.map((e) => [e.slug, e.day]));
    expect(artists.filter((a) => !daysBySlug.has(a.slug)).map((a) => a.slug)).toEqual([]);
    expect(artists.filter((a) => DATE_BY_DAY[daysBySlug.get(a.slug)] !== a.date)
      .map((a) => `${a.slug}: ${a.date} vs ${daysBySlug.get(a.slug)}`)).toEqual([]);
  });

  test("the poster prints 168 names across the four days", () => {
    expect(days.reduce((sum, d) => sum + d.rows.flat().length, 0)).toBe(168);
  });
});
