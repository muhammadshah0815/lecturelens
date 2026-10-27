// WCAG 2.1 contrast check for the colour pairs the UI actually uses.
// Reads the tokens from src/styles/tokens.css so the check follows any palette change.
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)].map((m) => [m[1], [+m[2], +m[3], +m[4]]]));
tokens.white = [255, 255, 255];

const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
/** Colour at `alpha` composited over `bg`, like Tailwind's text-x/80. */
const over = (fg, bg, alpha) => fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, minimum, where, alpha?]. 4.5 for text, 3 for large text, focus rings and control borders.
const pairs = [
  ['ink', 'paper', 4.5, 'body text'],
  ['ink-soft', 'paper', 4.5, 'secondary text'],
  ['ink-soft', 'surface', 4.5, 'secondary text on cards'],
  ['ink-muted', 'paper', 4.5, 'eyebrows, footer'],
  ['ink-muted', 'surface', 4.5, 'meta text on cards, placeholder'],
  ['ink-muted', 'sunken', 4.5, 'meta text on sunken panels'],
  ['ink', 'sunken', 4.5, 'closest-in-course note'],
  ['ink-muted', 'amber-soft', 4.5, 'Still stuck item meta'],
  ['ink', 'amber-soft', 4.5, 'Still stuck item question'],
  ['amber', 'amber-soft', 4.5, 'Still stuck banner heading, My note chip'],
  ['amber', 'amber-soft', 4.5, 'banner “from last time”', 0.9],
  ['amber', 'surface', 4.5, 'Still stuck button, not-covered eyebrow'],
  ['amber', 'paper', 4.5, 'resume line'],
  ['teal', 'paper', 4.5, 'teal eyebrows'],
  ['teal', 'surface', 4.5, 'clip status, in-player label'],
  ['teal-strong', 'surface', 4.5, 'links, Got it button text'],
  ['teal-strong', 'teal-tint', 4.5, 'source chips, explain heading'],
  ['teal-strong', 'teal-soft', 4.5, 'notes On badge'],
  ['ink', 'teal-tint', 4.5, 'tips, explain text'],
  ['ink-soft', 'teal-tint', 4.5, 'tip dismiss icon'],
  ['white', 'teal', 4.5, 'primary buttons, pressed chips'],
  ['white', 'teal-strong', 4.5, 'primary button hover'],
  ['white', 'ink', 4.5, 'question bubble, captions'],
  ['white', 'amber', 4.5, 'Still stuck pressed, count badge'],
  ['white', 'danger', 4.5, 'confirm clear button'],
  ['danger', 'surface', 4.5, 'Clear my data, ask box error'],
  ['danger', 'paper', 4.5, 'ask box error message'],
  ['ink', 'danger-soft', 4.5, 'clear confirm text'],
  ['ink-muted', 'sunken', 4.5, 'notes Off badge'],
  ['focus', 'paper', 3, 'focus ring on page'],
  ['focus', 'surface', 3, 'focus ring on cards'],
  ['ink-muted', 'surface', 3, 'ask box border (non-text contrast)', 0.75],
];

let failed = 0;
for (const [fg, bg, min, where, alpha] of pairs) {
  if (!tokens[fg] || !tokens[bg]) {
    console.log(`?    missing token ${fg} or ${bg}`);
    failed++;
    continue;
  }
  const f = alpha ? over(tokens[fg], tokens[bg], alpha) : tokens[fg];
  const r = ratio(f, tokens[bg]);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${fg}${alpha ? `/${alpha * 100}` : ''} on ${bg}  · ${where}`);
}
console.log(failed ? `\n${failed} pair(s) below WCAG AA` : `\nAll ${pairs.length} pairs meet WCAG AA`);
process.exit(failed ? 1 : 0);
