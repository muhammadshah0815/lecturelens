import type { Course } from './types';

const mmss = (m: number, s: number) => m * 60 + s;

export const course: Course = {
  id: 'pff-f26',
  code: 'FIN 101',
  title: 'Personal Finance Fundamentals',
  term: 'Fall 2026',
  instructor: 'Prof. Dana Okafor',
  institution: 'University',
  lectures: [
    {
      id: 'w1',
      week: 1,
      title: 'Money Basics & Setting Goals',
      durationSec: mmss(50, 12),
      summary: 'Needs vs wants, net worth, and turning vague wishes into concrete money goals.',
      topics: ['net worth', 'financial goals', 'smart goals', 'needs vs wants', 'assets', 'liabilities'],
    },
    {
      id: 'w2',
      week: 2,
      title: 'Budgeting That Works',
      durationSec: mmss(46, 5),
      summary: 'Tracking spending and the 50/30/20 rule as a starting budget.',
      topics: ['budget', 'budgeting', '50/30/20', 'tracking spending', 'expenses', 'zero-based budget'],
    },
    {
      id: 'w3',
      week: 3,
      title: 'Banking & Emergency Funds',
      durationSec: mmss(49, 40),
      summary: 'Checking vs savings, FDIC insurance, and how big an emergency fund should be.',
      topics: ['checking account', 'savings account', 'emergency fund', 'high-yield savings', 'fdic', 'overdraft'],
    },
    {
      id: 'w4',
      week: 4,
      title: 'Credit Scores & Credit Cards',
      durationSec: mmss(47, 18),
      summary: 'What goes into a credit score, reading a credit report, and using a card without paying interest.',
      topics: ['credit score', 'fico', 'credit report', 'credit utilization', 'credit history', 'grace period'],
    },
    {
      id: 'w5',
      week: 5,
      title: 'Borrowing: Student Loans & Debt',
      durationSec: mmss(51, 2),
      summary: 'How loans are priced, minimum payments, and the avalanche vs snowball payoff methods.',
      topics: ['student loan', 'loan', 'debt payoff', 'avalanche', 'snowball', 'refinancing', 'minimum payment'],
    },
    {
      id: 'w6',
      week: 6,
      title: 'Compound Interest',
      durationSec: mmss(48, 30),
      summary: 'Interest on interest: the formula, the Rule of 72, why starting early wins, and how debt compounds too.',
      topics: ['compound interest', 'simple interest', 'rule of 72', 'apr', 'apy', 'inflation', 'starting early'],
    },
    {
      id: 'w7',
      week: 7,
      title: 'Investing Basics',
      durationSec: mmss(50, 45),
      summary: 'Stocks, bonds and index funds, diversification, and retirement accounts like a 401(k) and Roth IRA.',
      topics: ['investing', 'stocks', 'bonds', 'index fund', 'etf', 'mutual fund', 'diversification', '401k', 'roth ira', 'retirement account'],
    },
    {
      id: 'w8',
      week: 8,
      title: 'Taxes & Your Paycheck',
      durationSec: mmss(45, 20),
      summary: 'Reading a pay stub, tax brackets, withholding and the W-4, and why a refund isn’t free money.',
      topics: ['taxes', 'tax bracket', 'paycheck', 'pay stub', 'withholding', 'w-4', 'tax refund', 'deductions'],
    },
  ],
};

export const lectureSummary = (id: string) => course.lectures.find((l) => l.id === id);
export const lectureByWeek = (week: number) => course.lectures.find((l) => l.week === week);
