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
    // <audio> seeking needs Range support (GitHub Pages has it; a plain Bun.file response here
    // answers 200 with the whole file, which makes the clip unseekable).
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
    if (range && (range[1] || range[2])) {
      const size = file.size;
      const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start > end || start >= size) {
        return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
      }
      return new Response(file.slice(start, end + 1), {
        status: 206,
        headers: { ...headers, "Accept-Ranges": "bytes", "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Type": file.type },
      });
    }
    return new Response(file, { headers: { ...headers, "Accept-Ranges": "bytes" } });
  },
});
console.log(`http://localhost:${port}/`);
