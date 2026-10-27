import { useId, useState } from 'react';
import type { StillStuckItem } from '../data/types';
import { getLecture } from '../lib/lecture';
import { formatTime } from '../lib/time';
import { ChevronIcon, CloseIcon, PlayIcon } from './icons';

interface Props {
  items: StillStuckItem[];
  onReopen: (item: StillStuckItem) => void;
  onRemove: (item: StillStuckItem) => void;
}

function where(item: StillStuckItem) {
  if (!item.resume) return null;
  const { moment, atSec } = item.resume;
  const lecture = getLecture(moment.lectureId);
  return `Week ${lecture?.week} · ${moment.label} · at ${formatTime(atSec)}`;
}

/** Carries "Still stuck" answers over to the next visit. Hidden when there are none. */
export function StillStuckBanner({ items, onReopen, onRemove }: Props) {
  const [open, setOpen] = useState(true);
  const listId = useId();
  if (items.length === 0) return null;

  return (
    <section aria-label="Still stuck" className="w-full rounded-2xl border border-amber/25 bg-amber-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={listId}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-3 text-left font-semibold text-amber"
      >
        <span className="inline-flex items-center gap-3">
          <span className="grid h-7 min-w-[1.75rem] place-items-center rounded-full bg-amber px-2 text-sm text-white">{items.length}</span>
          Still stuck on {items.length} {items.length === 1 ? 'thing' : 'things'}
          <span className="hidden font-normal text-amber/90 sm:inline">from last time</span>
        </span>
        <ChevronIcon size={20} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <ul id={listId} hidden={!open} className="space-y-1 px-2 pb-2">
        {items.map((item) => {
          const at = where(item);
          return (
            <li key={item.id} className="flex items-stretch gap-1 rounded-xl hover:bg-surface/70">
              <button type="button" onClick={() => onReopen(item)} className="flex min-w-0 flex-1 items-start gap-3 rounded-xl px-3 py-2.5 text-left">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-amber">
                  <PlayIcon size={12} />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-ink">“{item.question}”</span>
                  <span className="block text-sm text-ink-muted">{at ? `Reopen ${at}` : 'Ask again'}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(item)}
                aria-label={`Remove “${item.question}” from Still stuck`}
                className="grid w-11 shrink-0 place-items-center rounded-xl text-ink-muted hover:bg-surface hover:text-ink"
              >
                <CloseIcon size={16} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
