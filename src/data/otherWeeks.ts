import { lectureSummary } from './course';
import type { Lecture, LectureSummary } from './types';

// Short playable excerpts for the weeks that cross-week redirects point to.
// Only the slides and transcript around the redirect moment exist; the rest
// of the recording is silent in the simulated player.

const t = (m: number, s: number) => m * 60 + s;
const summary = (id: string) => lectureSummary(id) as LectureSummary;

export const week4: Lecture = {
  ...summary('w4'),
  readings: [{ id: 'w4-r1', title: 'Course text, Ch. 4: Credit', source: 'FIN 101 course text', pages: '§4.1–4.2' }],
  slides: [
    {
      id: 'w4-s1', lectureId: 'w4', number: 1, title: 'Credit Scores & Credit Cards', startSec: t(0, 0),
      blocks: [
        { type: 'text', text: 'Week 4 · Personal Finance Fundamentals' },
        { type: 'bullets', items: ['What a credit score is for', 'The five parts of a FICO score', 'Using a card without paying interest'] },
      ],
    },
    {
      id: 'w4-s2', lectureId: 'w4', number: 2, title: 'What goes into a FICO score', startSec: t(6, 20),
      blocks: [
        {
          type: 'table',
          headers: ['Factor', 'Weight', 'In plain words'],
          rows: [
            ['Payment history', '35%', 'Do you pay on time?'],
            ['Amounts owed', '30%', 'How much of your limit you use'],
            ['Length of history', '15%', 'How long you’ve had credit'],
            ['New credit', '10%', 'Recent applications'],
            ['Credit mix', '10%', 'Cards, loans, etc.'],
          ],
          caption: 'Scores range from 300 to 850',
        },
      ],
    },
    {
      id: 'w4-s3', lectureId: 'w4', number: 3, title: 'Utilization: use less than 30%', startSec: t(12, 45),
      blocks: [
        { type: 'equation', math: 'utilization = balance ÷ credit limit', label: '$600 on a $2,000 limit = 30%' },
        { type: 'callout', tone: 'info', text: 'Paying the full statement balance by the due date means you pay no interest at all.' },
      ],
    },
  ],
  transcript: [
    { id: 'w4-t01', lectureId: 'w4', slideId: 'w4-s2', startSec: t(6, 20), endSec: t(7, 50), text: "So what actually goes into your score? The most common one is FICO, and it ranges from three hundred to eight hundred fifty. It's built from five things, and they're not weighted equally." },
    { id: 'w4-t02', lectureId: 'w4', slideId: 'w4-s2', startSec: t(7, 50), endSec: t(9, 20), text: "The biggest piece, thirty-five percent, is payment history. Do you pay on time? One payment that's thirty days late can stay on your report for seven years." },
    { id: 'w4-t03', lectureId: 'w4', slideId: 'w4-s2', startSec: t(9, 20), endSec: t(10, 50), text: "Next, thirty percent, is amounts owed, mostly how much of your available credit you're using. Then length of history at fifteen percent, which is why you shouldn't close your oldest card." },
    { id: 'w4-t04', lectureId: 'w4', slideId: 'w4-s2', startSec: t(10, 50), endSec: t(12, 45), text: "The last two are ten percent each: new credit, meaning how many accounts you've applied for recently, and credit mix, whether you have different kinds of credit. Those matter much less. Pay on time and keep balances low, and you've covered two thirds of the score." },
    { id: 'w4-t05', lectureId: 'w4', slideId: 'w4-s3', startSec: t(12, 45), endSec: t(14, 30), text: "Let's make utilization concrete. If your limit is two thousand and your balance is six hundred, you're at thirty percent. A common rule of thumb is to stay under that." },
  ],
};

export const week7: Lecture = {
  ...summary('w7'),
  readings: [{ id: 'w7-r1', title: 'Course text, Ch. 7: Investing', source: 'FIN 101 course text', pages: '§7.2' }],
  slides: [
    {
      id: 'w7-s1', lectureId: 'w7', number: 1, title: 'Investing Basics', startSec: t(0, 0),
      blocks: [
        { type: 'text', text: 'Week 7 · Personal Finance Fundamentals' },
        { type: 'bullets', items: ['Stocks and bonds', 'Index funds and diversification', 'Retirement accounts'] },
      ],
    },
    {
      id: 'w7-s2', lectureId: 'w7', number: 2, title: 'Stocks vs bonds', startSec: t(6, 0),
      blocks: [
        {
          type: 'table',
          headers: ['', 'Stock', 'Bond'],
          rows: [
            ['You own…', 'a slice of a company', 'a loan to a company or government'],
            ['You earn from…', 'growth and dividends', 'fixed interest'],
            ['Risk', 'higher', 'lower'],
          ],
        },
      ],
    },
    {
      id: 'w7-s3', lectureId: 'w7', number: 3, title: 'Index funds: buy the whole market', startSec: t(14, 10),
      blocks: [
        {
          type: 'bullets',
          items: [
            'One fund holds every company in an index, e.g. the S&P 500',
            'Diversified: one company failing barely moves it',
            'Low fees, because nobody is paid to pick stocks',
            'Over long periods, most actively managed funds trail their index',
          ],
        },
      ],
    },
    {
      id: 'w7-s4', lectureId: 'w7', number: 4, title: 'Retirement accounts', startSec: t(20, 30),
      blocks: [{ type: 'bullets', items: ['401(k): through your employer, often with a match', 'Roth IRA: you pay tax now, withdrawals in retirement are tax-free'] }],
    },
  ],
  transcript: [
    { id: 'w7-t01', lectureId: 'w7', slideId: 'w7-s3', startSec: t(14, 10), endSec: t(15, 40), text: "So if you're just starting out, what do you actually buy? For most people the answer is an index fund. Instead of picking companies, you buy one fund that holds every company in an index, like the S&P 500." },
    { id: 'w7-t02', lectureId: 'w7', slideId: 'w7-s3', startSec: t(15, 40), endSec: t(17, 10), text: "That's diversification built in. If one company has a terrible year, it's one of five hundred. Your money isn't riding on any single bet." },
    { id: 'w7-t03', lectureId: 'w7', slideId: 'w7-s3', startSec: t(17, 10), endSec: t(18, 50), text: "Index funds are also cheap, because nobody is being paid to pick stocks. And remember last week: fees compound too. A one percent fee every year takes a surprisingly large bite over forty years." },
    { id: 'w7-t04', lectureId: 'w7', slideId: 'w7-s3', startSec: t(18, 50), endSec: t(20, 30), text: "And here's the uncomfortable fact for professional stock pickers: over long periods, most actively managed funds end up doing worse than the simple index they're trying to beat." },
    { id: 'w7-t05', lectureId: 'w7', slideId: 'w7-s4', startSec: t(20, 30), endSec: t(22, 0), text: "Now, where do you hold that index fund? That's what retirement accounts are for. Let's start with the 401(k)." },
  ],
};
