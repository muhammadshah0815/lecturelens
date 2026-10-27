// Run with `npm run check:engine`. Each question is worded differently from the
// scripted phrasings on purpose; the expected result is what a student needs.
import { answerQuestion, rank, type EngineResult } from '../src/lib/engine';

const cases: [question: string, expected: string][] = [
  ['why should i start investing in my 20s instead of waiting', 'why-start-early'],
  ['is it too late to start saving at 35?', 'why-start-early'],
  ['can you explain the ava and ben thing again', 'why-start-early'],
  ['whats the diff between simple & compound interest', 'simple-vs-compound'],
  ['what does interest on interest mean', 'what-is-compound'],
  ['compund intrest??', 'what-is-compound'],
  ['where does the (1+r)^t thing come from', 'formula'],
  ['why is time in the exponent', 'formula'],
  ['how long does it take to double my money at 8%', 'rule-of-72'],
  ['apy vs apr — which one do i look at for a savings account', 'apr-vs-apy'],
  ['why does compounding monthly give you more money than yearly', 'apr-vs-apy'],
  ['my credit card balance keeps going up even tho i didnt spend more', 'credit-card'],
  ['what happens if i only leave my card unpaid for a few years', 'credit-card'],
  ['is keeping cash under my mattress a bad idea', 'inflation'],
  ['why does my money buy less every year', 'inflation'],
  ['how do i raise my credit score', 'redirect-credit-score'],
  ['should i put my money in index funds', 'redirect-investing'],
  ['should I buy bitcoin', 'oos:oos-crypto'],
  ['how does the 50/30/20 budget work', 'topic:w2'],
  ['what is a transformer neural network', 'no-match'],
  // Held out: written after tuning, to catch overfitting.
  ['explain the snowball thing with interest', 'what-is-compound'],
  ['how come 1000 turns into 1331', 'formula'],
  ['whats the trick with 72', 'rule-of-72'],
  ['is my savings account rate the apy or apr', 'apr-vs-apy'],
  ['if i dont pay off my visa how bad does it get', 'credit-card'],
  ['does it really matter if i wait 10 years to invest', 'why-start-early'],
  ['what is real return', 'inflation'],
  ['how do taxes on my paycheck work', 'topic:w8'],
  ['can i get a mortgage as a student', 'oos:oos-real-estate'],
  ['does compound interest work on crypto', 'oos:oos-crypto'],
  ['what is the capital of france', 'no-match'],
  ['how much should be in my emergency fund', 'topic:w3'],
];

// Every scripted question must match its own intent.
import { allIntents } from '../src/data/intents';
for (const i of allIntents) cases.push([i.question, i.id]);

const label = (r: EngineResult) =>
  r.kind === 'answer' || r.kind === 'redirect' ? r.intent.id
  : r.kind === 'out-of-scope' ? `oos:${r.topic.id}`
  : r.kind === 'topic-redirect' ? `topic:${r.lecture.id}`
  : 'no-match';

let failed = 0;
for (const [q, expected] of cases) {
  const got = label(answerQuestion(q));
  const ok = got === expected;
  if (!ok) failed++;
  const top = rank(q).slice(0, 3).map((r) => `${r.intent.id} ${r.score.toFixed(1)}`).join(', ');
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${q}\n      → ${got}${ok ? '' : `  (expected ${expected})`}   [${top}]`);
}
console.log(`\n${cases.length - failed}/${cases.length} correct`);
process.exit(failed ? 1 : 0);
