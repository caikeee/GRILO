// Stills de revisão do story: node scripts/story-stills.cjs <A|B> <quadro,quadro,...>
const path = require("path");
const { bundle } = require("@remotion/bundler");
const { renderStill, selectComposition } = require("@remotion/renderer");

(async () => {
  const id = `StoryMobile-${process.argv[2] || "A"}`;
  const frames = (process.argv[3] || "0").split(",").map(Number);
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
  const composition = await selectComposition({ serveUrl, id });
  for (const frame of frames) {
    const output = path.resolve(`out/stills/${id}-${String(frame).padStart(4, "0")}.png`);
    await renderStill({ composition, serveUrl, output, frame, scale: 0.5 });
    console.log("ok", frame);
  }
})();
