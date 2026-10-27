import { course } from '../data/course';
import { answerIntents, outOfScopeTopics, redirectIntents } from '../data/intents';
import type { AnswerIntent, Intent, LectureSummary, OutOfScopeTopic, RedirectIntent } from '../data/types';

// Scripted "Campus AI": scores the question against every intent with weighted
// keywords (typo-tolerant) plus similarity to example phrasings, then decides
// between an answer, a redirect to another week, an honest "not covered", or
// "couldn't find it". Nothing is generated; every answer is pre-written.

export type EngineResult =
  | { kind: 'answer'; intent: AnswerIntent; score: number }
  | { kind: 'redirect'; intent: RedirectIntent; score: number }
  | { kind: 'topic-redirect'; lecture: LectureSummary; topic: string }
  | { kind: 'out-of-scope'; topic: OutOfScopeTopic; related?: AnswerIntent }
  | { kind: 'no-match'; suggestions: AnswerIntent[] };

/** Minimum score for a confident match. */
const MATCH = 2.5;
/** Minimum score to offer an intent as a "did you mean". */
const SUGGEST = 1;
const PHRASE_WEIGHT = 4;
const FUZZY_FACTOR = 0.7;

const STOPWORDS = new Set(
  ('a an and are as at be but by can do does did for from get got has have how i if in into is it its just me my of on or ' +
    'so than that the their them then there these they this to too us was we what whats when where which who why will with ' +
    'would you your yours im dont doesnt isnt keep keeps thing things mean means exactly really actually explain tell about ' +
    'should could much many some any more most still also very lot lots again even tho though instead between work works')
    .split(' '),
);

/** Everyday words students use, mapped to the course's vocabulary. */
const SYNONYMS: Record<string, string> = {
  young: 'early', younger: 'early', sooner: 'early', earlier: 'early', '20s': 'early', twenties: 'early',
  delay: 'wait', delaying: 'wait', procrastinate: 'wait', late: 'wait', later: 'wait', waiting: 'wait',
  doubling: 'double', doubles: 'double', doubled: 'double', twice: 'double',
  cc: 'card', visa: 'card', mastercard: 'card', diff: 'difference', differ: 'difference',
  owe: 'debt', owing: 'debt', balance: 'debt',
  intrest: 'interest', intrests: 'interest',
  prices: 'inflation', mattress: 'cash',
  stocks: 'stock', funds: 'fund',
};

// ---------------------------------------------------------------- Text helpers

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ᵗ/g, ' t')
    .replace(/[’‘'`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9%]+/g, ' ')
    .trim();
}

function stem(word: string): string {
  if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

const canon = (w: string) => SYNONYMS[w] ?? stem(w);

function contentTokens(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((w) => w && !STOPWORDS.has(w))
    .map(canon);
}

function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Typo tolerance grows with word length; short words must match exactly. */
function fuzzyEqual(a: string, b: string): boolean {
  const len = Math.min(a.length, b.length);
  if (len < 5) return false;
  return levenshtein(a, b) <= (len >= 8 ? 2 : 1);
}

function dice(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  const shared = new Set(a.filter((w) => setB.has(w))).size;
  return (2 * shared) / (new Set(a).size + setB.size);
}

// ---------------------------------------------------------------- Scoring

interface Query {
  /** " normalized text " padded for whole-phrase lookups. */
  padded: string;
  tokens: string[];
}

function toQuery(question: string): Query {
  return { padded: ` ${normalize(question)} `, tokens: contentTokens(question) };
}

function keywordScore(q: Query, keyword: string, weight: number): number {
  const kw = normalize(keyword);
  if (!kw) return 0;
  if (kw.includes(' ')) return q.padded.includes(` ${kw} `) ? weight : 0;
  if (STOPWORDS.has(kw)) return 0;
  const k = canon(kw);
  if (q.tokens.includes(k) || q.padded.includes(` ${kw} `)) return weight;
  return q.tokens.some((tok) => fuzzyEqual(tok, k)) ? weight * FUZZY_FACTOR : 0;
}

export function scoreIntent(q: Query, intent: Intent): number {
  // Keywords that share a stem ("compound", "compounding") count once, at their best.
  const best = new Map<string, number>();
  for (const entry of intent.keywords) {
    const [kw, w] = typeof entry === 'string' ? [entry, 1] : entry;
    const key = normalize(kw).split(' ').map(canon).join(' ');
    best.set(key, Math.max(best.get(key) ?? 0, keywordScore(q, kw, w)));
  }
  let score = 0;
  for (const s of best.values()) score += s;
  const phraseSim = Math.max(0, ...[intent.question, ...intent.phrases].map((p) => dice(q.tokens, contentTokens(p))));
  return score + phraseSim * PHRASE_WEIGHT;
}

function matchOutOfScope(q: Query): OutOfScopeTopic | undefined {
  let best: { topic: OutOfScopeTopic; len: number } | undefined;
  for (const topic of outOfScopeTopics) {
    for (const kw of topic.keywords) {
      const k = normalize(kw);
      if (q.padded.includes(` ${k} `) && (!best || k.length > best.len)) best = { topic, len: k.length };
    }
  }
  return best?.topic;
}

/** Topics from the course map that belong to other weeks, e.g. "budget" → Week 2. */
function matchCourseTopic(q: Query): { lecture: LectureSummary; topic: string } | undefined {
  let best: { lecture: LectureSummary; topic: string } | undefined;
  for (const lecture of course.lectures) {
    if (lecture.id === 'w6') continue;
    for (const topic of lecture.topics) {
      const k = normalize(topic);
      const hit = q.padded.includes(` ${k} `) || (!k.includes(' ') && q.tokens.includes(canon(k)));
      if (hit && (!best || k.length > best.topic.length)) best = { lecture, topic };
    }
  }
  return best;
}

// ---------------------------------------------------------------- Public API

export interface Ranked {
  intent: Intent;
  score: number;
}

export function rank(question: string): Ranked[] {
  const q = toQuery(question);
  return [...answerIntents, ...redirectIntents]
    .map((intent) => ({ intent, score: scoreIntent(q, intent) }))
    .sort((a, b) => b.score - a.score);
}

export function answerQuestion(question: string): EngineResult {
  const q = toQuery(question);
  const ranked = rank(question);
  const best = ranked[0];
  const bestAnswer = ranked.find((r) => r.intent.kind === 'answer') as { intent: AnswerIntent; score: number } | undefined;

  // 1. Known gaps win: never guess about something the course doesn't teach.
  const gap = matchOutOfScope(q);
  if (gap) return { kind: 'out-of-scope', topic: gap, related: bestAnswer && bestAnswer.score >= MATCH ? bestAnswer.intent : undefined };

  // 2. A confident match: answer it here, or send the student to the right week.
  if (best && best.score >= MATCH) {
    return best.intent.kind === 'answer'
      ? { kind: 'answer', intent: best.intent, score: best.score }
      : { kind: 'redirect', intent: best.intent, score: best.score };
  }

  // 3. Mentions a topic another week covers.
  const topic = matchCourseTopic(q);
  if (topic) return { kind: 'topic-redirect', ...topic };

  // 4. Couldn't find it: say so, and offer the closest questions we can answer.
  const suggestions = ranked
    .filter((r): r is { intent: AnswerIntent; score: number } => r.intent.kind === 'answer' && r.score >= SUGGEST)
    .slice(0, 2)
    .map((r) => r.intent);
  return { kind: 'no-match', suggestions };
}

/** Rebuilds the result for a known intent, e.g. when reopening a "Still stuck" item. */
export function resultForIntent(id: string): EngineResult | undefined {
  const answer = answerIntents.find((i) => i.id === id);
  if (answer) return { kind: 'answer', intent: answer, score: Infinity };
  const redirect = redirectIntents.find((i) => i.id === id);
  if (redirect) return { kind: 'redirect', intent: redirect, score: Infinity };
  return undefined;
}
