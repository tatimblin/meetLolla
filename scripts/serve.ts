// bun run dev [port]: serves the repo root (index.html, src/audio, src/img, assets/fonts) on
// port 4471 and rebuilds /dist/index.js from source on every request, so edits show on reload
// without touching the committed dist/.
import { join, resolve } from "node:path";
import { bundle } from "./build.ts";

const root = resolve(import.meta.dir, "..");
const port = Number(process.argv[2] ?? 4471);
const headers = { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" };

Bun.serve({
  port,
  async fetch(req) {
    let path = decodeURIComponent(new URL(req.url).pathname);
    if (path === "/dist/index.js") {
      try {
        const out = await bundle();
        return new Response(out.outputs[0], { headers: { ...headers, "Content-Type": "text/javascript" } });
      } catch (e) {
        return new Response(String(e), { status: 500 });
      }
    }
    if (path.endsWith("/")) path += "index.html";
    const file = Bun.file(join(root, path));
    if (!path.startsWith("/") || path.includes("..") || !(await file.exists())) {
      return new Response("not found", { status: 404 });
    }
    // Bun.file responses honour Range requests, which <audio> seeking needs.
    return new Response(file, { headers });
  },
});
console.log(`http://localhost:${port}/`);
