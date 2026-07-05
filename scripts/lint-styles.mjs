#!/usr/bin/env node
/**
 * Anti-"AI-slop" style guard. Fails the build if forbidden Tailwind patterns
 * reappear, keeping the design system consistent:
 *   - oversized radii (rounded-2xl/3xl) and arbitrary radii (rounded-[..])
 *   - heavy multi-layer shadows (shadow-2xl)
 *   - gradient fills (from-*-to-*)
 *   - non-existent Tailwind classes that silently render nothing
 *
 * Use the design tokens instead: rounded-sm|md|lg|xl, shadow-card|pop, brand/*.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "src";
const SKIP_FILES = new Set(["index.css"]); // tokens/legacy live here intentionally

const FORBIDDEN = [
  { re: /\brounded-(2xl|3xl)\b/, msg: "oversized radius — use rounded-md/lg/xl" },
  { re: /\brounded-\[[^\]]+\]/, msg: "arbitrary radius — use the radius scale" },
  { re: /\bshadow-2xl\b/, msg: "heavy shadow — use shadow-card/shadow-pop" },
  { re: /\b(from|via|to)-[a-z]+-\d{2,3}\b/, msg: "gradient fill — use a solid brand/neutral" },
  // invalid Tailwind fractional classes: only 0.5/1.5/2.5/3.5 exist, so N.5 with N>=4 is fake:
  { re: /\b(w|h|p|m|gap|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr)-([4-9]|\d{2,})\.5\b/, msg: "invalid fractional class — no such spacing step" },
  { re: /\btext-stone-(350|605|850)\b/, msg: "non-existent stone shade" },
  // valid opacity single digits are only 0 and 5; 1-4/6-9 render nothing:
  { re: /\bopacity-([1-4]|[6-9])\b/, msg: "invalid opacity step — use opacity-5/10/20/…" },
];

let violations = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if ([".tsx", ".ts", ".jsx", ".js"].includes(extname(p)) && !SKIP_FILES.has(name)) {
      const lines = readFileSync(p, "utf8").split("\n");
      lines.forEach((line, i) => {
        for (const { re, msg } of FORBIDDEN) {
          const m = line.match(re);
          if (m) {
            violations++;
            console.error(`  ${p}:${i + 1}  "${m[0]}" — ${msg}`);
          }
        }
      });
    }
  }
}

walk(ROOT);

if (violations > 0) {
  console.error(`\n✗ style guard: ${violations} forbidden pattern(s). See design tokens in src/index.css.\n`);
  process.exit(1);
} else {
  console.log("✓ style guard: no forbidden patterns.");
}
