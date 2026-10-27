import { forwardRef } from 'react';
import type { Moment } from '../../data/types';
import { track } from '../../lib/analytics';
import { useHints } from '../../lib/hints';
import { getLecture } from '../../lib/lecture';
import { formatTime } from '../../lib/time';
import { Hint } from '../Hint';
import { PlayIcon } from '../icons';
import { LecturePlayer, type PlayerHandle } from '../player/LecturePlayer';

interface Props {
  /** The answer this moment belongs to (for tips and the usage log). */
  turnId: string;
  moment: Moment;
  /** Cue the player here instead of the start of the moment (resuming). */
  initialSec?: number;
  /** Section label; "Best moment" unless an "Also see" moment is loaded. */
  eyebrow?: string;
  /** Shown when another moment replaced the best one. */
  onBack?: () => void;
}

export const BestMoment = forwardRef<PlayerHandle, Props>(function BestMoment({ turnId, moment, initialSec, eyebrow = 'Best moment', onBack }, ref) {
  const hints = useHints();
  const lecture = getLecture(moment.lectureId);
  if (!lecture) {
    return (
      <p role="status" className="rounded-xl bg-sunken px-4 py-3 text-ink-soft">
        This lecture clip isn’t available in the prototype yet. The recap below still links to the slides and transcript.
      </p>
    );
  }
  const onFirstPlay = () => {
    hints.done('play');
    track('moment_played', turnId, { lectureId: moment.lectureId, startSec: moment.startSec, eyebrow });
  };
  const mins = Math.max(1, Math.round((moment.endSec - moment.startSec) / 60));

  return (
    <section aria-labelledby={`bm-${moment.lectureId}-${moment.startSec}`} className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow inline-flex items-center gap-2 text-teal">
            <PlayIcon size={14} /> {eyebrow}
          </p>
          {onBack && (
            <button type="button" onClick={onBack} className="text-[0.95rem] font-semibold text-teal-strong underline-offset-2 hover:underline">
              ← Back to best moment
            </button>
          )}
        </div>
        <h3 id={`bm-${moment.lectureId}-${moment.startSec}`} className="text-title text-ink">
          {moment.label}
        </h3>
        <p className="flex flex-wrap items-center gap-x-2 text-[0.95rem] text-ink-soft">
          <span className="font-semibold text-ink">Week {lecture.week} · {lecture.title}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {formatTime(moment.startSec)}–{formatTime(moment.endSec)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{mins} min</span>
        </p>
        <p className="text-ink-soft">
          <span className="font-semibold text-ink">Why this moment: </span>
          {moment.why}
        </p>
      </div>
      <Hint id="play" turnId={turnId}>
        Press <strong>Play</strong> to watch just the part of the lecture that answers your question. It stops at the end of the clip.
      </Hint>
      <LecturePlayer key={`${moment.lectureId}-${moment.startSec}`} ref={ref} lecture={lecture} moment={moment} initialSec={initialSec} onFirstPlay={onFirstPlay} />
    </section>
  );
});
