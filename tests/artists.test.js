import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { artists } from "../src/js/artists.js";

const audioDir = resolve(import.meta.dir, "../src/audio");
const DAYS = ["Thurs 8/03", "Fri 8/04", "Sat 8/05", "Sun 8/06"];   // Lollapalooza 2017: Thu Aug 3 - Sun Aug 6

describe("artists", () => {
  test("every entry's audio file exists in src/audio", () => {
    const missing = artists.filter((a) => !existsSync(join(audioDir, `${a.slug}.mp3`))).map((a) => a.slug);
    expect(missing).toEqual([]);
  });

  test("no duplicate artists or audio files", () => {
    const dupes = (key) => artists.map((a) => a[key].toLowerCase()).filter((v, i, all) => all.indexOf(v) !== i);
    expect(dupes("slug")).toEqual([]);
    expect(dupes("name")).toEqual([]);
  });

  test("every date is a real festival day", () => {
    expect(artists.filter((a) => !DAYS.includes(a.date))).toEqual([]);
  });

  test("every link is a YouTube watch URL", () => {
    expect(artists.filter((a) => !/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(a.link))).toEqual([]);
  });

  test("the artists overwritten by duplicate indices in 2017 are back", () => {
    const names = new Set(artists.map((a) => a.name));
    for (const n of ["Middle Kids", "White Reaper", "Whethan", "Jain", "Missio", "The London Souls", "Cobi",
      "A R I Z O N A", "Moksi", "Gibbz", "Boogie", "888", "Wingtip", "Wax Motif"]) {
      expect(names.has(n)).toBe(true);
    }
  });
});
