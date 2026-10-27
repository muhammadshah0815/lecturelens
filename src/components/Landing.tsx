import { course } from '../data/course';
import { suggestedQuestions } from '../data/intents';
import type { StillStuckItem } from '../data/types';
import type { AskOrigin } from '../lib/analytics';
import { AskBox } from './AskBox';
import { CampusBadge } from './CampusBadge';
import { StillStuckBanner } from './StillStuckBanner';
import { PlayIcon, QuestionIcon, SourceIcon } from './icons';

interface Props {
  onAsk: (question: string, origin?: AskOrigin) => void;
  stillStuck: StillStuckItem[];
  onReopen: (item: StillStuckItem) => void;
  onRemoveStuck: (item: StillStuckItem) => void;
}

const steps = [
  { icon: QuestionIcon, title: 'Ask in your own words', body: 'Type the exact thing that’s confusing you.' },
  { icon: PlayIcon, title: 'Watch the moment', body: 'Jump to where the instructor explained it in lecture.' },
  { icon: SourceIcon, title: 'Check the sources', body: 'Every line of the recap links back to a slide or timestamp.' },
];

export function Landing({ onAsk, stillStuck, onReopen, onRemoveStuck }: Props) {
  return (
    <section aria-labelledby="ask-heading" className="flex flex-col items-center gap-8 pt-6 sm:pt-14">
      <StillStuckBanner items={stillStuck} onReopen={onReopen} onRemove={onRemoveStuck} />

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="eyebrow">
          {course.title} <span aria-hidden="true">·</span> {course.term}
        </p>
        <h1 id="ask-heading" className="text-display text-ink">
          What are you stuck on?
        </h1>
        <p className="max-w-xl text-lg text-ink-soft">
          Ask a question and go straight to the moment in lecture where it was explained.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        <AskBox onAsk={onAsk} labelledBy="ask-heading" autoFocus />
        <div className="flex flex-col items-center gap-2 text-center">
          <CampusBadge />
          <span className="text-sm text-ink-muted">Answers come only from this course’s lectures, slides, readings and your notes.</span>
        </div>
      </div>

      <div className="w-full">
        <h2 id="try-heading" className="mb-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Or try one of these
        </h2>
        <ul aria-labelledby="try-heading" className="grid gap-3 sm:grid-cols-2">
          {suggestedQuestions.map((q) => (
            <li key={q}>
              <button type="button" className="chip w-full" onClick={() => onAsk(q, 'suggestion')}>
                <span aria-hidden="true" className="text-teal">→</span>
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ol aria-label="How LectureLens works" className="mt-4 grid w-full gap-6 border-t border-line pt-8 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="flex gap-3 sm:flex-col sm:gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-tint text-teal">
              <Icon size={18} />
            </span>
            <div>
              <p className="font-semibold text-ink">
                <span className="sr-only">Step {i + 1}: </span>
                {title}
              </p>
              <p className="text-[0.95rem] text-ink-soft">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
