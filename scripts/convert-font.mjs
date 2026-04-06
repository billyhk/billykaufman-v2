import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import opentype from "opentype.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const fontPath = resolve(root, "node_modules/@fontsource/raleway/files/raleway-latin-700-normal.woff");
const outPath = resolve(root, "public/fonts/raleway-bold.typeface.json");

const font = opentype.loadSync(fontPath);

// Three.js typeface format
const glyphs = {};
const chars = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz[]^_`{|}~';

for (const char of chars) {
  const glyph = font.charToGlyph(char);
  if (!glyph) continue;

  // Use raw font-unit path (Y-up coordinate system) not getPath() which is Y-down canvas coords
  const cmds = glyph.path.commands;

  glyphs[char] = {
    ha: glyph.advanceWidth ?? 0,
    x_min: glyph.xMin ?? 0,
    x_max: glyph.xMax ?? 0,
    o: cmds.map((c) => {
      const f = (n) => (n ?? 0).toFixed(1);
      if (c.type === "M") return `m ${f(c.x)} ${f(c.y)}`;
      if (c.type === "L") return `l ${f(c.x)} ${f(c.y)}`;
      if (c.type === "C") return `b ${f(c.x1)} ${f(c.y1)} ${f(c.x2)} ${f(c.y2)} ${f(c.x)} ${f(c.y)}`;
      if (c.type === "Q") return `q ${f(c.x1)} ${f(c.y1)} ${f(c.x)} ${f(c.y)}`;
      if (c.type === "Z") return "z";
      return "";
    }).join(" "),
  };
}

const typeface = {
  glyphs,
  familyName: font.names.fontFamily?.en ?? "Raleway",
  ascender: font.ascender,
  descender: font.descender,
  underlinePosition: font.tables.post?.underlinePosition ?? -100,
  underlineThickness: font.tables.post?.underlineThickness ?? 50,
  boundingBox: {
    yMin: font.tables.head?.yMin ?? 0,
    xMin: font.tables.head?.xMin ?? 0,
    yMax: font.tables.head?.yMax ?? 0,
    xMax: font.tables.head?.xMax ?? 0,
  },
  resolution: 1000,
  original_font_information: font.names,
};

writeFileSync(outPath, JSON.stringify(typeface));
console.log(`Written to ${outPath}`);
