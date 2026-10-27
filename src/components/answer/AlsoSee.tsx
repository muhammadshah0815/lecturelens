import type { Moment } from '../../data/types';
import { getLecture } from '../../lib/lecture';
import { sameMoment } from '../../lib/moments';
import { formatTime } from '../../lib/time';
import { PlayIcon } from '../icons';

interface Props {
  moments: Moment[];
  active: Moment;
  onPick: (m: Moment) => void;
}

export function AlsoSee({ moments, active, onPick }: Props) {
  if (moments.length === 0) return null;
  return (
    <section className="space-y-3">
      <h3 className="eyebrow">Also see</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {moments.slice(0, 2).map((m) => {
          const lecture = getLecture(m.lectureId);
          const playing = sameMoment(m, active);
          return (
            <li key={`${m.lectureId}-${m.startSec}`}>
              <button
                type="button"
                onClick={() => onPick(m)}
                aria-pressed={playing}
                className={`flex h-full w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  playing ? 'border-teal bg-teal-tint' : 'border-line bg-surface hover:border-teal hover:bg-teal-tint'
                }`}
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal text-white">
                  <PlayIcon size={14} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">{m.label}</span>
                  <span className="block text-sm tabular-nums text-ink-muted">
                    Week {lecture?.week} · {formatTime(m.startSec)}–{formatTime(m.endSec)}
                    {playing && <span className="ml-1 font-semibold text-teal">· in player</span>}
                  </span>
                  <span className="mt-0.5 block text-[0.95rem] text-ink-soft">{m.why}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
