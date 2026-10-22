// bun run build: bundles src/js/index.js (its mount()) into dist/index.js, one minified ESM file
// with the CSS and SVGs inlined as strings. Fonts and media are NOT bundled: mount() loads them
// from `assetBase` (assets/fonts/, src/audio/, src/img/), so dist/ is a single file.
//
// Reproducible: pinned svgo (bun.lock) and Bun's bundler; the same sources give the same bytes.
import { rm, mkdir, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { optimize } from "svgo";
import type { BunPlugin } from "bun";

const root = resolve(import.meta.dir, "..");
const dist = join(root, "dist");
const minify = !process.env.NOMINIFY;   // NOMINIFY=1 for readable stacks while debugging

// svgo at build time keeps the source SVGs readable. Every id is prefixed per file so nothing
// collides with the host page (cleanupIds drops the ids nothing references).
const svgo = (path: string, text: string) => {
  const prefix = "ml-" + path.split("/").pop()!.replace(/\.svg$/, "");
  return optimize(text, {
    path,
    multipass: true,
    plugins: [
      { name: "preset-default", params: { overrides: { removeViewBox: false } } },
      "removeDimensions",
      "removeXMLNS",
      { name: "prefixIds", params: { prefix, delim: "-", prefixClassNames: false } },
    ],
  }).data;
};

// CSS: minified by Bun's own CSS bundler first (a Bun.build nested inside a plugin deadlocks),
// then handed to the JS bundle as a string.
async function minifyCss(path: string) {
  const out = await Bun.build({ entrypoints: [path], minify });
  if (!out.success) throw new AggregateError(out.logs, "css build failed");
  return (await out.outputs[0].text()).trim();
}

const textAssets = (cssText: string): BunPlugin => ({
  name: "meet-lolla-text-assets",
  setup(build) {
    build.onLoad({ filter: /\.svg$/ }, async ({ path }) => ({
      contents: svgo(path, await Bun.file(path).text()),
      loader: "text",
    }));
    build.onLoad({ filter: /\.css$/ }, () => ({ contents: cssText, loader: "text" }));
  },
});

export async function bundle(opts: { outdir?: string } = {}) {
  const cssText = await minifyCss(join(root, "src/css/meet-lolla.css"));
  const result = await Bun.build({
    entrypoints: [join(root, "src/js/index.js")],
    outdir: opts.outdir,
    naming: "index.js",
    format: "esm",
    target: "browser",
    minify,
    plugins: [textAssets(cssText)],
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error("build failed");
  }
  return result;
}

if (import.meta.main) {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await bundle({ outdir: dist });
  const kb = async (p: string) => ((await stat(p)).size / 1024).toFixed(1) + " KB";
  console.log("dist/index.js", await kb(join(dist, "index.js")));
}
