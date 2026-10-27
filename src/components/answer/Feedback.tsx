import type { Moment, Seconds } from '../../data/types';
import { Hint } from '../Hint';

export type FeedbackValue = 'got-it' | 'stuck' | null;
export type ResumePoint = { moment: Moment; atSec: Seconds };
/** Cards report where their player was, so a "Still stuck" item can reopen at that spot. */
export type FeedbackHandler = (v: FeedbackValue, resume?: ResumePoint) => void;

interface Props {
  turnId: string;
  value: FeedbackValue;
  onChange: (v: FeedbackValue) => void;
  /** What "Still stuck" offers next, e.g. "A simpler explanation is open above." */
  stuckHint?: string;
}

export function Feedback({ turnId, value, onChange, stuckHint }: Props) {
  const base = 'min-h-[2.75rem] rounded-xl border-2 px-5 font-semibold transition-colors';
  return (
    <div className="space-y-2 border-t border-line pt-5">
      <Hint id="feedback" turnId={turnId} className="mb-3">
        Tell us if this helped. <strong>Still stuck</strong> saves the question to your home screen so you can pick it up later.
      </Hint>
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-1 font-semibold text-ink">Did this help?</p>
        <button
          type="button"
          aria-pressed={value === 'got-it'}
          onClick={() => onChange(value === 'got-it' ? null : 'got-it')}
          className={`${base} ${value === 'got-it' ? 'border-teal bg-teal text-white' : 'border-teal/40 text-teal-strong hover:border-teal hover:bg-teal-tint'}`}
        >
          ✓ Got it
        </button>
        <button
          type="button"
          aria-pressed={value === 'stuck'}
          onClick={() => onChange(value === 'stuck' ? null : 'stuck')}
          className={`${base} ${value === 'stuck' ? 'border-amber bg-amber text-white' : 'border-amber/40 text-amber hover:border-amber hover:bg-amber-soft'}`}
        >
          Still stuck
        </button>
      </div>
      <p className="min-h-[1.5rem] text-[0.95rem] text-ink-soft" aria-live="polite">
        {value === 'got-it' && 'Nice. Marked as understood.'}
        {value === 'stuck' && `In your “Still stuck” list on the home screen until you mark it Got it.${stuckHint ? ` ${stuckHint}` : ''}`}
      </p>
    </div>
  );
}
