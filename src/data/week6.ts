import type { Lecture, Slide, TranscriptSegment } from './types';

// Week 6 · Compound Interest — the deep, fully playable lecture (48:30).
//
// Numbers used in the lecture (all checked):
//   Simple, $1,000 at 10%:   +$100/yr → $1,300 after 3 yrs, $4,000 after 30
//   Compound, $1,000 at 10%: 1,100 → 1,210 → 1,331;  30 yrs → $17,449.40
//   Formula A = P(1 + r)^t:  1000 × 1.1³ = 1331
//   Rule of 72: 6% → 12 yrs (1.06¹² ≈ 2.01);  24% → 3 yrs
//   12% yearly → $1,120.00;  1% monthly → 1000 × 1.01¹² = $1,126.83
//   Ava: $2,000/yr ages 25–34 (start of year), 7% → $225,073 at 65 ($20,000 paid in)
//   Ben: $2,000/yr ages 35–64,               7% → $202,146 at 65 ($60,000 paid in)
//   Ava's first $2,000: 2000 × 1.07⁴⁰ ≈ $29,949;  Ben's first: 2000 × 1.07³⁰ ≈ $15,225
//   Credit card $1,000 at 24% APR = 2%/month, 36 months → 1000 × 1.02³⁶ = $2,039.89; APY 26.82%
//   3% inflation, 10 yrs: $1,000 cash buys ≈ $744 of today's goods;
//   $1,000 at 5% → $1,628.89 nominal ≈ $1,212 in today's dollars

const L = 'w6';
const t = (m: number, s: number) => m * 60 + s;

export const week6Slides: Slide[] = [
  {
    id: 'w6-s1',
    lectureId: L,
    number: 1,
    title: 'Compound Interest: why starting early wins',
    startSec: t(0, 0),
    blocks: [
      { type: 'text', text: 'Week 6 · Personal Finance Fundamentals' },
      {
        type: 'bullets',
        items: [
          'Simple vs compound interest',
          'Building the formula A = P(1 + r)ᵗ',
          'The Rule of 72, and APR vs APY',
          'Ava vs Ben: the cost of waiting',
          'When compounding works against you',
        ],
      },
    ],
  },
  {
    id: 'w6-s2',
    lectureId: L,
    number: 2,
    title: 'Simple interest',
    startSec: t(3, 10),
    blocks: [
      { type: 'equation', math: 'I = P × r × t', label: 'P = principal, r = yearly rate, t = years' },
      {
        type: 'table',
        headers: ['Year', 'Interest earned', 'Balance'],
        rows: [
          ['1', '$100', '$1,100'],
          ['2', '$100', '$1,200'],
          ['3', '$100', '$1,300'],
        ],
        caption: '$1,000 at 10% simple interest: interest is only ever paid on the original $1,000',
      },
    ],
  },
  {
    id: 'w6-s3',
    lectureId: L,
    number: 3,
    title: 'Compound interest: interest on interest',
    startSec: t(9, 20),
    layout: 'split',
    blocks: [
      {
        type: 'bullets',
        items: [
          'Each year’s interest is added to the balance',
          'Next year, that interest earns interest too',
          'Year 2: $100 on the $1,000 + $10 on last year’s $100',
        ],
      },
      { type: 'figure', figure: 'interest-stack', caption: '$1,000 at 10%, compounded yearly' },
    ],
  },
  {
    id: 'w6-s4',
    lectureId: L,
    number: 4,
    title: 'Over 30 years, the gap explodes',
    startSec: t(15, 45),
    blocks: [
      { type: 'figure', figure: 'growth-curves', caption: '$1,000 at 10%: simple ends at $4,000, compound at $17,449' },
      { type: 'callout', tone: 'info', text: 'Same rate, same deposit. The only difference is interest on interest.' },
    ],
  },
  {
    id: 'w6-s5',
    lectureId: L,
    number: 5,
    title: 'Building the formula',
    startSec: t(18, 40),
    blocks: [
      { type: 'text', text: 'Every year, the balance is multiplied by (1 + r):' },
      {
        type: 'steps',
        items: [
          { label: 'After 1 year', math: 'P + P·r = P(1 + r)' },
          { label: 'After 2 years', math: 'P(1 + r) × (1 + r) = P(1 + r)²' },
          { label: 'After t years', math: 'A = P(1 + r)ᵗ' },
        ],
      },
      { type: 'callout', tone: 'info', text: 'Check: 1,000 × 1.1³ = 1,331 — the same as the year-by-year table.' },
    ],
  },
  {
    id: 'w6-s6',
    lectureId: L,
    number: 6,
    title: 'Rule of 72 · how often it compounds',
    startSec: t(26, 5),
    blocks: [
      { type: 'equation', math: 'years to double ≈ 72 ÷ rate', label: 'at 6%: 72 ÷ 6 = 12 years' },
      {
        type: 'table',
        headers: ['$1,000 at 12% for 1 year', 'Ends at'],
        rows: [
          ['Compounded yearly (12% once)', '$1,120.00'],
          ['Compounded monthly (1% × 12)', '$1,126.83'],
        ],
      },
      { type: 'bullets', items: ['APR: the stated yearly rate', 'APY: what you actually earn or pay, compounding included'] },
    ],
  },
  {
    id: 'w6-s7',
    lectureId: L,
    number: 7,
    title: 'Ava vs Ben, and the credit card',
    startSec: t(31, 30),
    layout: 'split',
    blocks: [
      {
        type: 'table',
        headers: ['$2,000 a year, 7%', 'Ava', 'Ben'],
        rows: [
          ['Saves from age', '25–34', '35–64'],
          ['Total put in', '$20,000', '$60,000'],
          ['Has at 65', '$225,073', '$202,146'],
        ],
      },
      { type: 'callout', tone: 'warn', text: '$1,000 card balance at 24% APR, no payments: $2,040 after 3 years.' },
      { type: 'figure', figure: 'two-savers' },
    ],
  },
  {
    id: 'w6-s8',
    lectureId: L,
    number: 8,
    title: 'Inflation: the real return',
    startSec: t(40, 15),
    layout: 'split',
    blocks: [
      { type: 'equation', math: 'real ≈ rate − inflation', label: '5% savings − 3% inflation ≈ 2% real' },
      {
        type: 'bullets',
        items: [
          '$1,000 in cash for 10 years buys ≈ $744 of today’s goods',
          'Next week: investing to beat it',
        ],
      },
      { type: 'figure', figure: 'buying-power', caption: 'What $1,000 in cash can buy, 3% inflation' },
    ],
  },
];

export const week6Transcript: TranscriptSegment[] = [
  // Slide 1 — intro
  {
    id: 'w6-t01', lectureId: L, slideId: 'w6-s1', startSec: t(0, 0), endSec: t(1, 15),
    text: "Okay, let's get started. Last week was about borrowing money. Today we flip it around and look at what happens when money grows, and honestly, this is the single most important idea in the whole course.",
  },
  {
    id: 'w6-t02', lectureId: L, slideId: 'w6-s1', startSec: t(1, 15), endSec: t(3, 10),
    text: "Here's the plan. Simple interest first, then compound interest. We'll build the formula ourselves, learn a shortcut called the Rule of 72, and then meet two savers, Ava and Ben. At the end we'll see the same math working against you on a credit card.",
  },
  // Slide 2 — simple interest
  {
    id: 'w6-t03', lectureId: L, slideId: 'w6-s2', startSec: t(3, 10), endSec: t(5, 0),
    text: "Interest is what you get paid for letting someone else use your money, or what you pay for using theirs. With simple interest, it's just principal times rate times time. P is the amount you start with, r is the yearly rate, t is the number of years.",
  },
  {
    id: 'w6-t04', lectureId: L, slideId: 'w6-s2', startSec: t(5, 0), endSec: t(7, 0),
    text: "Say you put a thousand dollars somewhere paying ten percent simple interest. Ten percent of a thousand is a hundred. Year one, a hundred dollars. Year two, another hundred. Year three, another hundred. After three years you have thirteen hundred.",
  },
  {
    id: 'w6-t05', lectureId: L, slideId: 'w6-s2', startSec: t(7, 0), endSec: t(9, 20),
    text: "Notice what never happens: the interest you already earned just sits there. It never earns anything itself. Every year you're paid on the original thousand and nothing else. Keep that in mind, because that's exactly what changes next.",
  },
  // Slide 3 — compound
  {
    id: 'w6-t06', lectureId: L, slideId: 'w6-s3', startSec: t(9, 20), endSec: t(11, 20),
    text: "Compound interest has one difference. At the end of each year, the interest is added to your balance. And next year, you earn interest on the whole new balance, including the interest. That's it. Interest on interest.",
  },
  {
    id: 'w6-t07', lectureId: L, slideId: 'w6-s3', startSec: t(11, 20), endSec: t(13, 20),
    text: "Same thousand dollars, ten percent, compounded yearly. Year one: eleven hundred, same as before. Year two: ten percent of eleven hundred is a hundred and ten, so twelve hundred ten. That extra ten dollars is interest earned on last year's interest. Year three: thirteen thirty-one.",
  },
  {
    id: 'w6-t08', lectureId: L, slideId: 'w6-s3', startSec: t(13, 20), endSec: t(15, 45),
    text: "Thirty-one dollars more than simple interest after three years. I know, not very exciting. Think of a snowball rolling downhill. At first it barely grows, but the bigger it gets, the more snow it picks up on every turn. Give it time.",
  },
  // Slide 4 — 30 years
  {
    id: 'w6-t09', lectureId: L, slideId: 'w6-s4', startSec: t(15, 45), endSec: t(17, 10),
    text: "So let's give it time. Here's thirty years. Simple interest: a straight line, a hundred dollars a year, ending at four thousand. Compound interest at the same rate ends at about seventeen thousand four hundred fifty.",
  },
  {
    id: 'w6-t10', lectureId: L, slideId: 'w6-s4', startSec: t(17, 10), endSec: t(18, 40),
    text: "Why does the compound curve bend upward? Because every year it's growing from a bigger base. The gap between the two lines grows faster every single year. The ingredient doing the work here isn't the rate. It's time.",
  },
  // Slide 5 — formula
  {
    id: 'w6-t11', lectureId: L, slideId: 'w6-s5', startSec: t(18, 40), endSec: t(20, 30),
    text: "Let's build the formula ourselves so you never have to memorize it. Start with P. After one year you have P plus the interest, P times r. Factor out the P and you get P times one plus r. So one year of growth means multiplying by one plus r.",
  },
  {
    id: 'w6-t12', lectureId: L, slideId: 'w6-s5', startSec: t(20, 30), endSec: t(22, 20),
    text: "Year two starts from P times one plus r, not from P. That's the compounding. So we multiply by one plus r again, and we get P times one plus r, squared.",
  },
  {
    id: 'w6-t13', lectureId: L, slideId: 'w6-s5', startSec: t(22, 20), endSec: t(24, 0),
    text: "See the pattern? Every year is another multiplication by one plus r. After t years you've multiplied t times. So the amount A equals P times one plus r, to the power t.",
  },
  {
    id: 'w6-t14', lectureId: L, slideId: 'w6-s5', startSec: t(24, 0), endSec: t(26, 5),
    text: "Quick check. A thousand times one point one cubed is thirteen thirty-one. Same as our table. And look where time lives in this formula: in the exponent. That's why time matters more than anything else you control.",
  },
  // Slide 6 — Rule of 72, frequency, APR/APY
  {
    id: 'w6-t15', lectureId: L, slideId: 'w6-s6', startSec: t(26, 5), endSec: t(27, 50),
    text: "Now a shortcut you can do in your head. The Rule of 72: divide seventy-two by the interest rate, and that's roughly how many years it takes to double your money. At six percent, seventy-two divided by six is twelve years. Check it: one point oh six to the twelfth is about two point oh one.",
  },
  {
    id: 'w6-t16', lectureId: L, slideId: 'w6-s6', startSec: t(27, 50), endSec: t(29, 40),
    text: "Next: how often does it compound? Take twelve percent a year. Compounded once a year, a thousand becomes eleven twenty. Compounded monthly, it's one percent a month, twelve times, and you end up with eleven twenty-six eighty-three. More often means slightly more, because the interest starts earning sooner.",
  },
  {
    id: 'w6-t17', lectureId: L, slideId: 'w6-s6', startSec: t(29, 40), endSec: t(31, 30),
    text: "That's the difference between APR and APY. APR is the stated yearly rate. APY is what you actually earn or pay once compounding is included. When you compare savings accounts, compare APY. Banks love to advertise whichever number looks better.",
  },
  // Slide 7 — Ava vs Ben, credit card
  {
    id: 'w6-t18', lectureId: L, slideId: 'w6-s7', startSec: t(31, 30), endSec: t(33, 10),
    text: "Okay, meet Ava and Ben. Ava invests two thousand dollars a year from age twenty-five to thirty-four. Ten years, then she stops completely. Ben waits. He starts at thirty-five and invests two thousand a year all the way to sixty-four. Both earn seven percent a year.",
  },
  {
    id: 'w6-t19', lectureId: L, slideId: 'w6-s7', startSec: t(33, 10), endSec: t(34, 40),
    text: "Ava puts in twenty thousand dollars total. Ben puts in sixty thousand, three times as much. Before I show you, make a guess. Who has more at sixty-five?",
  },
  {
    id: 'w6-t20', lectureId: L, slideId: 'w6-s7', startSec: t(34, 40), endSec: t(36, 10),
    text: "Ava has about two hundred twenty-five thousand. Ben has about two hundred two thousand. Ava put in a third of the money and still ends up ahead. Her ten-year head start beats thirty years of contributions.",
  },
  {
    id: 'w6-t21', lectureId: L, slideId: 'w6-s7', startSec: t(36, 10), endSec: t(37, 40),
    text: "Why? Look at the very first deposit. Ava's first two thousand compounds for forty years and turns into almost thirty thousand. Ben's first two thousand only gets thirty years and becomes about fifteen thousand. Same deposit, ten more years, double the result.",
  },
  {
    id: 'w6-t22', lectureId: L, slideId: 'w6-s7', startSec: t(37, 40), endSec: t(39, 10),
    text: "Now the dark side. Compounding doesn't care whose side it's on. A thousand dollars on a credit card at twenty-four percent APR is two percent a month. Make no payments for three years and you owe about two thousand forty.",
  },
  {
    id: 'w6-t23', lectureId: L, slideId: 'w6-s7', startSec: t(39, 10), endSec: t(40, 15),
    text: "It doubled. And the Rule of 72 saw it coming: seventy-two divided by twenty-four is three years. With monthly compounding the APY on that card is about twenty-six point eight percent. That's why high-interest debt gets paid off first.",
  },
  // Slide 8 — inflation
  {
    id: 'w6-t24', lectureId: L, slideId: 'w6-s8', startSec: t(40, 15), endSec: t(41, 50),
    text: "Last idea: inflation. Prices go up over time, which is compounding working against your cash. At three percent inflation, a thousand dollars under your mattress for ten years will only buy about seven hundred forty-four dollars' worth of what it buys today.",
  },
  {
    id: 'w6-t25', lectureId: L, slideId: 'w6-s8', startSec: t(41, 50), endSec: t(43, 20),
    text: "So what matters is your real return: roughly your interest rate minus inflation. A savings account paying five percent with inflation at three percent is really growing your buying power by about two percent a year.",
  },
  {
    id: 'w6-t26', lectureId: L, slideId: 'w6-s8', startSec: t(43, 20), endSec: t(44, 50),
    text: "In numbers: a thousand at five percent for ten years is sixteen twenty-eight eighty-nine on paper. In today's dollars, after three percent inflation, that's about twelve hundred twelve. Still a gain, just a smaller one than it looks.",
  },
  {
    id: 'w6-t27', lectureId: L, slideId: 'w6-s8', startSec: t(44, 50), endSec: t(46, 20),
    text: "That's why a savings account is great for an emergency fund but not enough for goals that are decades away. To beat inflation over the long run you usually need to invest, and that's exactly where we're going next week.",
  },
  {
    id: 'w6-t28', lectureId: L, slideId: 'w6-s8', startSec: t(46, 20), endSec: t(47, 30),
    text: "To wrap up. Compound interest is interest on interest. The formula is P times one plus r to the t, and time sits in the exponent. Start early, even with small amounts. And keep high-interest debt away, because it compounds too.",
  },
  {
    id: 'w6-t29', lectureId: L, slideId: 'w6-s8', startSec: t(47, 30), endSec: t(48, 5),
    text: "For reading, chapter six in the course text, sections one through three. Problem set four is posted and covers today.",
  },
  {
    id: 'w6-t30', lectureId: L, slideId: 'w6-s8', startSec: t(48, 5), endSec: t(48, 30),
    text: "Office hours are Thursday afternoon. See you next week.",
  },
];

export const week6: Lecture = {
  id: L,
  week: 6,
  title: 'Compound Interest',
  durationSec: t(48, 30),
  summary: 'Interest on interest: the formula, the Rule of 72, why starting early wins, and how debt compounds too.',
  topics: ['compound interest', 'simple interest', 'rule of 72', 'apr', 'apy', 'inflation', 'starting early'],
  slides: week6Slides,
  transcript: week6Transcript,
  readings: [
    { id: 'w6-r1', title: 'Course text, Ch. 6: The Time Value of Money', source: 'FIN 101 course text', pages: '§6.1–6.3' },
  ],
};
