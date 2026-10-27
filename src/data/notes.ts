import type { Note } from './types';

// The student's own notes. Pre-filled sample; the AI may read it only when
// Settings.notesEnabled is true.
export const sampleNote: Note = {
  id: 'note-w6',
  title: 'Week 6 class notes',
  lectureId: 'w6',
  updatedAt: '2026-10-08',
  blocks: [
    {
      id: 'n1',
      heading: 'Big idea',
      text: 'Compound = interest on interest. Simple = only on the original amount. $1,000 @ 10%: 1100 → 1210 → 1331 (the extra $10 in yr 2 is interest on interest).',
    },
    {
      id: 'n2',
      heading: 'Formula (prof said this will be on the midterm!)',
      text: 'A = P(1 + r)^t. Every year = multiply by (1 + r) again. Time is in the EXPONENT → that’s why it matters most.',
    },
    {
      id: 'n3',
      heading: 'Rule of 72',
      text: '72 ÷ rate = years to double. 6% → 12 yrs. 24% credit card → 3 yrs (yikes).',
    },
    {
      id: 'n4',
      heading: 'Ava vs Ben',
      text: 'Ava: $2k/yr age 25–34 = $20k in → ~$225k at 65. Ben: $2k/yr age 35–64 = $60k in → ~$202k. Starting 10 yrs earlier > 3× the money.',
    },
    {
      id: 'n5',
      heading: 'APR vs APY',
      text: 'APR = stated rate. APY = what you really get with compounding. Compare savings accounts by APY!',
    },
    {
      id: 'n6',
      heading: 'Still fuzzy on',
      text: 'Why does monthly compounding give more if the yearly rate is the same? (I think: interest starts earning sooner.)',
    },
  ],
};

export const notes: Note[] = [sampleNote];
export const noteById = (id: string) => notes.find((n) => n.id === id);
