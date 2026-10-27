import type { AnswerIntent, Moment, OutOfScopeTopic, RedirectIntent, SourceRef } from './types';

// Scripted "Campus AI" answers for Week 6, plus cross-week redirects and
// topics known to be outside the course. Every recap claim cites a source.

const t = (m: number, s: number) => m * 60 + s;
const slide = (n: number): SourceRef => ({ kind: 'slide', lectureId: 'w6', slideId: `w6-s${n}` });
const at = (m: number, s: number): SourceRef => ({ kind: 'transcript', lectureId: 'w6', atSec: t(m, s) });
const note = (blockId: string): SourceRef => ({ kind: 'note', noteId: 'note-w6', blockId });
const w6 = (from: [number, number], to: [number, number], label: string, why: string): Moment => ({
  lectureId: 'w6',
  startSec: t(...from),
  endSec: t(...to),
  label,
  why,
});

// ---------------------------------------------------------------- Week 6 answers

export const answerIntents: AnswerIntent[] = [
  {
    id: 'what-is-compound',
    kind: 'answer',
    question: 'What is compound interest?',
    keywords: [['compound', 3], ['compounding', 3], 'interest on interest', 'interest', 'what', 'mean', 'grow'],
    phrases: ['what is compound interest', 'what does compounding mean', 'interest on interest', 'how does compound interest work'],
    bestMoment: w6([9, 20], [13, 20], 'Interest on interest', 'The instructor defines compound interest and walks $1,000 at 10% through three years.'),
    recap: [
      { text: 'With compound interest, each year’s interest is added to your balance.', sources: [slide(3), at(9, 20)] },
      { text: 'Next year you earn interest on that new, bigger balance: $1,000 → $1,100 → $1,210 → $1,331 at 10%.', sources: [at(11, 20)] },
      { text: 'The extra $10 in year two is interest earned on last year’s interest.', sources: [slide(3), at(11, 20)] },
    ],
    noteClaim: { text: 'Your note sums it up as “interest on interest”.', sources: [note('n1')] },
    alsoSee: [
      w6([15, 45], [18, 40], 'Over 30 years, the gap explodes', '$4,000 simple vs $17,449 compound.'),
      w6([18, 40], [26, 5], 'Building the formula', 'Where A = P(1 + r)ᵗ comes from.'),
    ],
    followUps: ['simple-vs-compound', 'formula'],
    explainDifferently: {
      simpler: [{ text: 'Your interest starts earning its own interest.', sources: [at(9, 20)] }],
      numbers: [
        { text: 'Year 2 at 10%: $100 on the original $1,000, plus $10 on last year’s $100 of interest = $110.', sources: [slide(3), at(11, 20)] },
        { text: 'Given 40 years at 7%, that effect turns Ava’s first $2,000 into about $29,949.', sources: [at(36, 10)] },
      ],
      analogy: [{ text: 'A snowball rolling downhill: the bigger it gets, the more snow it picks up each turn.', sources: [at(13, 20)] }],
    },
  },
  {
    id: 'simple-vs-compound',
    kind: 'answer',
    question: 'What’s the difference between simple and compound interest?',
    keywords: [['simple', 3], ['difference', 2], ['vs', 1], ['versus', 1], 'compound', 'compare', 'straight line'],
    phrases: ['simple vs compound interest', 'difference between simple and compound interest', 'simple interest vs compound interest', 'why is compound more than simple'],
    bestMoment: w6([15, 45], [18, 40], 'Simple vs compound over 30 years', 'The instructor compares the two on one chart and explains why the compound curve bends upward.'),
    recap: [
      { text: 'Simple interest is only ever paid on the original amount; the interest you earn never earns anything.', sources: [slide(2), at(7, 0)] },
      { text: 'Compound interest adds each year’s interest to the balance, so it earns interest too.', sources: [at(9, 20)] },
      { text: 'Over 30 years at 10%, $1,000 grows to $4,000 simple vs about $17,449 compound.', sources: [slide(4), at(15, 45)] },
    ],
    noteClaim: { text: 'Your note: “Simple = only on the original amount.”', sources: [note('n1')] },
    alsoSee: [
      w6([3, 10], [7, 0], 'Simple interest, step by step', '$100 a year on $1,000 at 10%.'),
      w6([9, 20], [13, 20], 'Compound interest, step by step', '1,100 → 1,210 → 1,331.'),
    ],
    followUps: ['formula', 'why-start-early'],
    explainDifferently: {
      simpler: [{ text: 'Simple: you earn on what you put in. Compound: you earn on what you put in and on what you’ve already earned.', sources: [at(9, 20)] }],
      numbers: [
        { text: '$1,000 at 10% for 3 years: simple gives $1,300, compound gives $1,331. After 30 years: $4,000 vs $17,449.', sources: [slide(2), slide(4)] },
        { text: 'On the credit card it runs against you: 24% simple interest for 3 years would make $1,000 into $1,720; compounding monthly makes it $2,039.89.', sources: [slide(7), at(37, 40)] },
      ],
      analogy: [{ text: 'Simple is a straight staircase. Compound is a snowball that keeps getting bigger.', sources: [at(13, 20)] }],
    },
  },
  {
    id: 'formula',
    kind: 'answer',
    question: 'Where does A = P(1 + r)ᵗ come from?',
    keywords: [['formula', 3], ['(1+r)', 3], ['1 + r', 3], ['exponent', 3], ['power', 2], ['1331', 3], ['1,331', 3], ['1.1', 2], 'p(1+r)', 'derive', 'come from', 'a =', 'equation'],
    phrases: ['where does the formula come from', 'how does a = p(1+r)^t work', 'why is it to the power of t', 'derive compound interest formula', 'what is the compound interest formula'],
    bestMoment: w6([18, 40], [26, 5], 'Building the formula A = P(1 + r)ᵗ', 'The instructor builds the formula one year at a time, then checks it against the table.'),
    recap: [
      { text: 'One year of growth is P + P·r, which is P(1 + r): multiply by (1 + r).', sources: [slide(5), at(18, 40)] },
      { text: 'Year two starts from P(1 + r), so you multiply by (1 + r) again: P(1 + r)².', sources: [at(20, 30)] },
      { text: 'After t years you’ve multiplied t times: A = P(1 + r)ᵗ. Check: 1,000 × 1.1³ = 1,331.', sources: [slide(5), at(24, 0)] },
    ],
    noteClaim: { text: 'You flagged this formula in your notes as likely on the midterm.', sources: [note('n2')] },
    alsoSee: [
      w6([11, 20], [13, 20], 'The same thing as a table', '1,100 → 1,210 → 1,331.'),
      w6([26, 5], [27, 50], 'A mental shortcut: the Rule of 72', 'Estimate doubling time without the formula.'),
    ],
    followUps: ['why-start-early', 'rule-of-72'],
    explainDifferently: {
      simpler: [{ text: 'Each year your money gets multiplied by the same number, (1 + r). Do it t times and you get (1 + r)ᵗ.', sources: [at(22, 20)] }],
      numbers: [
        { text: 'Ava’s first deposit: 2,000 × 1.07⁴⁰ ≈ 2,000 × 14.97 ≈ $29,949.', sources: [slide(7), at(36, 10)] },
        { text: 'The credit card, monthly: 1,000 × 1.02³⁶ ≈ $2,039.89. Same formula, with r per month and t in months.', sources: [slide(7), at(37, 40)] },
      ],
      analogy: [{ text: 'Like a photocopier set to 110%: copy the copy, and every pass enlarges what the last pass already enlarged.', sources: [at(20, 30)] }],
    },
  },
  {
    id: 'why-start-early',
    kind: 'answer',
    question: 'Why does starting early matter so much?',
    keywords: [['early', 3], ['start', 2], ['starting', 2], ['ava', 3], ['ben', 3], ['wait', 2], ['young', 2], 'age', 'time', 'later', 'retirement'],
    phrases: ['why does starting early matter', 'is it too late to start saving', 'ava and ben example', 'why start investing young', 'does waiting cost me'],
    bestMoment: w6([31, 30], [37, 40], 'Ava vs Ben: the cost of waiting', 'The instructor compares two savers and shows the one who started 10 years earlier ends with more, despite paying in a third as much.'),
    recap: [
      { text: 'Ava invests $2,000 a year from 25 to 34 ($20,000 total); Ben invests $2,000 a year from 35 to 64 ($60,000 total). Both earn 7%.', sources: [slide(7), at(31, 30)] },
      { text: 'At 65, Ava has about $225,000 and Ben about $202,000.', sources: [slide(7), at(34, 40)] },
      { text: 'Ava’s first $2,000 compounds for 40 years into about $29,900; Ben’s gets 30 years and becomes about $15,200.', sources: [at(36, 10)] },
    ],
    noteClaim: { text: 'Your note: “Starting 10 yrs earlier > 3× the money.”', sources: [note('n4')] },
    alsoSee: [
      w6([24, 0], [26, 5], 'Why time matters most', 'Time sits in the exponent of the formula.'),
      w6([15, 45], [18, 40], 'The 30-year growth curve', 'Why the curve bends upward.'),
    ],
    followUps: ['formula', 'rule-of-72'],
    explainDifferently: {
      simpler: [{ text: 'Money invested earlier has more years to grow, and the growth speeds up the longer it runs.', sources: [at(36, 10)] }],
      numbers: [
        { text: 'Ava pays in $20,000 and has $225,073 at 65. Ben pays in $60,000 and has $202,146.', sources: [slide(7), at(34, 40)] },
        { text: 'One $2,000 deposit at 7%: after 30 years ≈ $15,225; after 40 years ≈ $29,949. Ten extra years roughly doubles it.', sources: [at(36, 10)] },
      ],
      analogy: [{ text: 'Planting a tree ten years earlier: you don’t water it more, it just has longer to grow.', sources: [at(34, 40)] }],
    },
  },
  {
    id: 'rule-of-72',
    kind: 'answer',
    question: 'How does the Rule of 72 work?',
    keywords: [['72', 4], ['rule of 72', 4], ['double', 3], ['doubling', 3], 'how long', 'years', 'shortcut'],
    phrases: ['how does the rule of 72 work', 'how long to double my money', 'what is the rule of 72', 'doubling time'],
    bestMoment: w6([26, 5], [27, 50], 'The Rule of 72', 'The instructor introduces the shortcut and checks it for 6%.'),
    recap: [
      { text: 'Divide 72 by the interest rate to estimate how many years it takes to double your money.', sources: [slide(6), at(26, 5)] },
      { text: 'At 6%: 72 ÷ 6 = 12 years, and 1.06¹² ≈ 2.01, so it checks out.', sources: [at(26, 5)] },
      { text: 'It works on debt too: a 24% credit card doubles what you owe in about 3 years.', sources: [at(39, 10)] },
    ],
    noteClaim: { text: 'Your note has both examples: 6% → 12 years, 24% → 3 years.', sources: [note('n3')] },
    alsoSee: [
      w6([37, 40], [40, 15], 'The credit card example', '$1,000 becomes $2,040 in three years.'),
      w6([18, 40], [26, 5], 'The full formula', 'A = P(1 + r)ᵗ, when you need the exact number.'),
    ],
    followUps: ['credit-card', 'apr-vs-apy'],
    explainDifferently: {
      simpler: [{ text: '72 divided by your rate = about how many years until your money doubles.', sources: [slide(6)] }],
      numbers: [
        { text: '4% → 18 years. 6% → 12 years. 8% → 9 years. 24% → 3 years.', sources: [slide(6), at(39, 10)] },
        { text: 'Check it on the credit card: 72 ÷ 24 = 3, and $1,000 at 2% a month really is $2,039.89 after 36 months.', sources: [slide(7), at(39, 10)] },
      ],
      analogy: [{ text: 'A quick speed-to-distance estimate: you don’t need a map app to know roughly when you’ll arrive.', sources: [at(26, 5)] }],
    },
  },
  {
    id: 'apr-vs-apy',
    kind: 'answer',
    question: 'What’s the difference between APR and APY?',
    keywords: [['apr', 4], ['apy', 4], ['monthly', 3], ['daily', 2], ['yearly', 2], ['how often', 3], ['frequency', 3], 'compounded', 'annual percentage', 'savings account'],
    phrases: ['apr vs apy', 'difference between apr and apy', 'why does monthly compounding give more', 'what does compounded monthly mean', 'how often is interest compounded'],
    bestMoment: w6([27, 50], [31, 30], 'How often it compounds, and APR vs APY', 'The instructor compares yearly vs monthly compounding, then defines APR and APY.'),
    recap: [
      { text: 'At 12% a year, $1,000 compounded once becomes $1,120; compounded monthly (1% × 12) it becomes $1,126.83.', sources: [slide(6), at(27, 50)] },
      { text: 'APR is the stated yearly rate. APY is what you actually earn or pay once compounding is included.', sources: [slide(6), at(29, 40)] },
      { text: 'Compare savings accounts by APY.', sources: [at(29, 40)] },
    ],
    noteClaim: { text: 'You listed this under “Still fuzzy on” in your notes.', sources: [note('n6')] },
    alsoSee: [
      w6([37, 40], [40, 15], 'APY on a credit card', '24% APR is about 26.8% APY.'),
      w6([9, 20], [11, 20], 'Why interest on interest adds up', 'The core idea behind APY.'),
    ],
    followUps: ['credit-card', 'what-is-compound'],
    explainDifferently: {
      simpler: [{ text: 'APR is the advertised rate. APY is the real rate after compounding. APY is the one to compare.', sources: [at(29, 40)] }],
      numbers: [
        { text: '12% APR compounded monthly: 1.01¹² ≈ 1.1268, so the APY is about 12.68%.', sources: [slide(6), at(27, 50)] },
        { text: 'The lecture’s credit card: 24% APR is 2% a month, and 1.02¹² ≈ 1.2682, so you really pay about 26.82% a year.', sources: [at(39, 10)] },
      ],
      analogy: [{ text: 'APR is a price before tax; APY is what you actually pay at the till.', sources: [at(29, 40)] }],
    },
  },
  {
    id: 'credit-card',
    kind: 'answer',
    question: 'Why does credit card debt grow so fast?',
    keywords: [['credit card', 4], ['card', 2], ['debt', 3], ['owe', 2], ['24%', 2], 'balance', 'payments', 'against me'],
    phrases: ['why does credit card debt grow so fast', 'credit card interest', 'how does debt compound', 'what if i don’t pay my credit card'],
    bestMoment: w6([37, 40], [40, 15], 'Compounding against you: the credit card', 'The instructor shows a $1,000 card balance doubling in three years.'),
    recap: [
      { text: 'Debt compounds the same way savings do. A card at 24% APR charges about 2% a month.', sources: [at(37, 40)] },
      { text: 'Leave $1,000 unpaid for three years and you owe about $2,040.', sources: [slide(7), at(37, 40)] },
      { text: 'The Rule of 72 predicts it: 72 ÷ 24 = 3 years to double. That’s why high-interest debt gets paid off first.', sources: [at(39, 10)] },
    ],
    noteClaim: { text: 'Your note: “24% credit card → 3 yrs (yikes).”', sources: [note('n3')] },
    alsoSee: [
      w6([26, 5], [27, 50], 'The Rule of 72', 'The doubling shortcut used here.'),
      w6([29, 40], [31, 30], 'APR vs APY', 'Why a 24% APR card really costs about 26.8%.'),
    ],
    followUps: ['rule-of-72', 'apr-vs-apy'],
    explainDifferently: {
      simpler: [{ text: 'Unpaid interest gets added to what you owe, and then you pay interest on that too.', sources: [at(37, 40)] }],
      numbers: [
        { text: '$1,000 × 1.02³⁶ ≈ $2,039.89. Every six months the balance grows by about 12.6%.', sources: [slide(7), at(37, 40)] },
        { text: 'It’s Ava’s math in reverse: the same compounding that turns her $20,000 into $225,073 is working for the card company here.', sources: [at(37, 40)] },
      ],
      analogy: [{ text: 'The same snowball from earlier, except this one is rolling toward you.', sources: [at(37, 40)] }],
    },
  },
  {
    id: 'inflation',
    kind: 'answer',
    question: 'How does inflation affect my savings?',
    keywords: [['inflation', 4], ['real return', 4], ['buying power', 3], ['purchasing power', 3], ['buy less', 3], ['worth less', 3], ['lose value', 3], ['losing value', 3], 'prices', 'cash', 'mattress'],
    phrases: ['how does inflation affect savings', 'what is real return', 'is keeping cash bad', 'does my money lose value'],
    bestMoment: w6([40, 15], [43, 20], 'Inflation and your real return', 'The instructor shows cash losing buying power and defines real return.'),
    recap: [
      { text: 'At 3% inflation, $1,000 in cash for 10 years buys only about $744 of today’s goods.', sources: [slide(8), at(40, 15)] },
      { text: 'Your real return is roughly your rate minus inflation: 5% − 3% ≈ 2%.', sources: [slide(8), at(41, 50)] },
      { text: '$1,000 at 5% for 10 years is $1,628.89 on paper, about $1,212 in today’s dollars.', sources: [at(43, 20)] },
    ],
    alsoSee: [
      w6([44, 50], [46, 20], 'Why savings alone isn’t enough', 'Emergency fund vs long-term goals.'),
      w6([15, 45], [18, 40], 'Compound growth over 30 years', 'The other side of the same math.'),
    ],
    followUps: ['what-is-compound', 'apr-vs-apy'],
    explainDifferently: {
      simpler: [{ text: 'Prices go up every year, so money that isn’t growing slowly buys less.', sources: [at(40, 15)] }],
      numbers: [{ text: '1,000 ÷ 1.03¹⁰ ≈ 744: that’s what your $1,000 is worth in today’s prices after 10 years.', sources: [slide(8), at(40, 15)] }],
      analogy: [{ text: 'Walking up a down escalator: if your money grows slower than prices rise, you go backwards.', sources: [at(41, 50)] }],
    },
  },
];

// ---------------------------------------------------------------- Cross-week redirects

export const redirectIntents: RedirectIntent[] = [
  {
    id: 'redirect-credit-score',
    kind: 'redirect',
    question: 'How is my credit score calculated?',
    keywords: [['credit score', 4], ['fico', 4], ['credit report', 4], ['utilization', 3], ['credit history', 3], 'score'],
    phrases: ['how is my credit score calculated', 'what affects my credit score', 'how do i raise my credit score', 'what is a fico score'],
    topic: 'Credit scores',
    targetWeek: 4,
    moment: { lectureId: 'w4', startSec: t(6, 20), endSec: t(12, 45), label: 'The five parts of a credit score', why: 'Week 4 breaks a FICO score into payment history, utilization, length, mix and new credit.' },
    message: 'Credit scores are covered in Week 4, not Week 6.',
  },
  {
    id: 'redirect-investing',
    kind: 'redirect',
    question: 'What should I invest in?',
    keywords: [['index fund', 4], ['invest', 1.5], ['investing', 1.5], ['what to buy', 3], ['stocks', 3], ['bonds', 3], ['etf', 3], ['401k', 3], ['roth', 3], ['diversification', 3]],
    phrases: ['what should i invest in', 'what is an index fund', 'stocks vs bonds', 'should i open a roth ira', 'how do i start investing'],
    topic: 'Investing basics',
    targetWeek: 7,
    moment: { lectureId: 'w7', startSec: t(14, 10), endSec: t(20, 30), label: 'Index funds and diversification', why: 'Week 7 explains why a low-cost index fund is the usual starting point.' },
    message: 'Investing is covered in Week 7. This week explains why it matters (beating inflation), not what to buy.',
  },
];

// ---------------------------------------------------------------- Not in this course

export const outOfScopeTopics: OutOfScopeTopic[] = [
  {
    id: 'oos-crypto',
    topic: 'Cryptocurrency',
    keywords: ['crypto', 'cryptocurrency', 'bitcoin', 'btc', 'ethereum', 'nft', 'blockchain', 'dogecoin'],
    nearest: { week: 7, note: 'Week 7 covers diversification and risk in general.' },
  },
  {
    id: 'oos-stock-picks',
    topic: 'Picking individual stocks',
    keywords: ['individual stock', 'which stock', 'stock pick', 'pick stocks', 'tesla', 'apple stock', 'nvidia', 'stock tip', 'day trading', 'options trading'],
    nearest: { week: 7, note: 'Week 7 covers index funds, not individual stock picks.' },
  },
  {
    id: 'oos-real-estate',
    topic: 'Real estate investing and mortgages',
    keywords: ['mortgage', 'real estate', 'rental property', 'buy a house', 'landlord'],
    nearest: { week: 5, note: 'Week 5 covers how loans are priced in general.' },
  },
  {
    id: 'oos-insurance',
    topic: 'Insurance',
    keywords: ['insurance', 'premium', 'deductible', 'life insurance', 'health insurance'],
  },
];

const byId = Object.fromEntries(answerIntents.map((i) => [i.id, i]));

export const suggestedQuestions: string[] = [
  byId['why-start-early'].question,
  byId['simple-vs-compound'].question,
  byId['rule-of-72'].question,
  byId['credit-card'].question,
];

export const allIntents = [...answerIntents, ...redirectIntents];
export const intentById = (id: string) => allIntents.find((i) => i.id === id);
