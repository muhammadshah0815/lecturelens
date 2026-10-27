import type { ReactNode } from 'react';
import type { HintId } from '../lib/hints';
import { useHints } from '../lib/hints';
import { CloseIcon } from './icons';

/** A small first-run tip. Hidden once used or dismissed; never shown again in this browser. */
export function Hint({ id, turnId, children, className = '' }: { id: HintId; turnId: string; children: ReactNode; className?: string }) {
  const hints = useHints();
  if (!hints.show(id, turnId)) return null;
  return (
    <div className={`flex items-start gap-2 rounded-xl border border-teal/30 bg-teal-tint py-2 pl-3 pr-1 text-[0.95rem] text-ink ${className}`}>
      <span aria-hidden="true" className="mt-[0.1rem] font-bold text-teal-strong">Tip</span>
      <p className="flex-1 pt-px">{children}</p>
      <button
        type="button"
        onClick={() => hints.done(id)}
        aria-label="Dismiss tip"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-teal-soft hover:text-ink"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
