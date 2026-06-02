import fs from "node:fs";
import path from "node:path";

const appPath = path.join(process.cwd(), "src", "App.jsx");
const source = fs.readFileSync(appPath, "utf8");

const before = "const selectedTiles = hand.filter((tile) => selectedIds.includes(tile.id));";
const after = "const selectedTiles = selectedIds.map((id) => hand.find((tile) => tile.id === id)).filter(Boolean);";

if (source.includes(after)) {
  console.log("src/App.jsx already preserves selected tile click order");
  process.exit(0);
}

if (!source.includes(before)) {
  throw new Error("Could not find selectedTiles hand-order expression in src/App.jsx");
}

fs.writeFileSync(appPath, source.replace(before, after));
console.log("patched src/App.jsx to preserve selected tile click order");
