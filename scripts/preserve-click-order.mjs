import fs from "node:fs";
import path from "node:path";

const appPath = path.join(process.cwd(), "src", "App.jsx");
let source = fs.readFileSync(appPath, "utf8");

function replaceRequired(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Could not find ${label}`);
  }
  source = source.split(search).join(replacement);
}

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

replaceRequired(
  "const selectedTiles = hand.filter((tile) => selectedIds.includes(tile.id));",
  "const selectedTiles = selectedIds.map((id) => hand.find((tile) => tile.id === id)).filter(Boolean);",
  "selectedTiles hand-order expression"
);

if (!source.includes(wordsImport)) {
  throw new Error("src/App.jsx is missing words import");
}
if (!source.includes("const selectedTiles = selectedIds.map((id) => hand.find((tile) => tile.id === id)).filter(Boolean);")) {
  throw new Error("src/App.jsx does not preserve selected tile click order");
}

fs.writeFileSync(appPath, source);
console.log("patched src/App.jsx to use src/words.js and preserve selected tile click order");
