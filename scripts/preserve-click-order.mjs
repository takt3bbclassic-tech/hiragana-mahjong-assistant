import fs from "node:fs";
import path from "node:path";

const appPath = path.join(process.cwd(), "src", "App.jsx");
let source = fs.readFileSync(appPath, "utf8");

const reactImport = 'import React, { useMemo, useState } from "react";';
const wordsImport = 'import { BASE_WORDS, BASE_WORD_COUNT } from "./words.js";';

if (!source.includes(wordsImport)) {
  if (!source.includes(reactImport)) {
    throw new Error("React import line was not found in src/App.jsx");
  }
  source = source.replace(reactImport, `${reactImport}\n${wordsImport}`);
}

source = source.replace(
  /\nconst BASE_WORDS_TEXT = "[^"]*";\nconst BASE_WORDS = BASE_WORDS_TEXT\.split\(\/\\s\+\/\)\.filter\(Boolean\);/,
  ""
);

if (source.includes("const BASE_WORDS_TEXT =") || source.includes("BASE_WORDS_TEXT.split")) {
  throw new Error("src/App.jsx still contains inline BASE_WORDS_TEXT");
}

const handOrderSelectedTiles = "const selectedTiles = hand.filter((tile) => selectedIds.includes(tile.id));";
const clickOrderSelectedTiles = "const selectedTiles = selectedIds.map((id) => hand.find((tile) => tile.id === id)).filter(Boolean);";

if (source.includes(handOrderSelectedTiles)) {
  source = source.replace(handOrderSelectedTiles, clickOrderSelectedTiles);
}

if (!source.includes(wordsImport)) {
  throw new Error("src/App.jsx is missing words import");
}
if (!source.includes(clickOrderSelectedTiles)) {
  throw new Error("src/App.jsx does not preserve selected tile click order");
}

fs.writeFileSync(appPath, source);
console.log("patched src/App.jsx to use src/words.js and preserve selected tile click order");
