import type { ReactNode } from 'react';
import type { RecapClaim } from '../../data/types';
import type { AskOrigin } from '../../lib/analytics';
import { ArrowRightIcon } from '../icons';
import { SourceChip } from './SourceChip';

export function QuestionBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-ink px-5 py-3 text-lg text-white">{children}</p>
    </div>
  );
}

export function Claim({ claim, turnId, className = 'text-lg' }: { claim: RecapClaim; turnId: string; className?: string }) {
  return (
    <p className={`leading-relaxed text-ink ${className}`}>
      {claim.text}{' '}
      <span className="whitespace-nowrap">
        {claim.sources.map((s, i) => (
          <SourceChip key={i} source={s} turnId={turnId} />
        ))}
      </span>
    </p>
  );
}

/** A row of questions that, when clicked, are asked as a new turn. */
export function AskChips({ label, questions, onAsk }: { label: string; questions: string[]; onAsk: (q: string, origin?: AskOrigin) => void }) {
  if (questions.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="eyebrow">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <li key={q}>
            <button type="button" className="chip" onClick={() => onAsk(q, 'follow-up')}>
              {q}
              <ArrowRightIcon size={16} className="text-teal" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
