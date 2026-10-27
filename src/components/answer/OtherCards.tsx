import type { ReactNode } from 'react';
import { lectureSummary } from '../../data/course';
import { suggestedQuestions } from '../../data/intents';
import type { AnswerIntent, LectureSummary, OutOfScopeTopic, RedirectIntent } from '../../data/types';
import { BestMoment } from './BestMoment';
import { AskChips } from './Bits';
import { Feedback, type FeedbackHandler, type FeedbackValue, type ResumePoint } from './Feedback';
import { usePlayer } from './usePlayer';

const thisWeek = suggestedQuestions.slice(0, 2);

function Notice({ tone, eyebrow, title, children }: { tone: 'teal' | 'amber'; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className={`eyebrow ${tone === 'teal' ? 'text-teal' : 'text-amber'}`}>{eyebrow}</p>
      <h3 className="text-title text-ink">{title}</h3>
      {children}
    </div>
  );
}

/** Covered by the course, in another week, with a playable moment. */
export function RedirectCard({ turnId, intent, feedback, onFeedback, onAsk, resume }: {
  turnId: string;
  intent: RedirectIntent;
  feedback: FeedbackValue;
  onFeedback: FeedbackHandler;
  onAsk: (q: string) => void;
  resume?: ResumePoint;
}) {
  const [setPlayer, player] = usePlayer(turnId);
  const lecture = lectureSummary(intent.moment.lectureId);
  const report = (v: FeedbackValue) => onFeedback(v, { moment: intent.moment, atSec: player.current?.getTime() ?? intent.moment.startSec });

  return (
    <div className="card space-y-8 p-5 sm:p-7">
      <Notice tone="teal" eyebrow={`Covered in Week ${intent.targetWeek}`} title={`That’s covered in Week ${intent.targetWeek}`}>
        <p className="text-lg text-ink-soft">
          {intent.message} Here’s where it’s explained in <span className="font-semibold text-ink">Week {lecture?.week}: {lecture?.title}</span>.
        </p>
      </Notice>
      <BestMoment ref={setPlayer} turnId={turnId} moment={intent.moment} initialSec={resume?.atSec} eyebrow={`Week ${intent.targetWeek} moment`} />
      <AskChips label="Or ask about this week" questions={thisWeek} onAsk={onAsk} />
      <Feedback turnId={turnId} value={feedback} onChange={report} />
    </div>
  );
}

interface SimpleFeedback {
  turnId: string;
  feedback: FeedbackValue;
  onFeedback: FeedbackHandler;
}

/** Mentions a topic from another week's syllabus that has no scripted answer. */
export function TopicRedirectCard({ turnId, lecture, topic, onAsk, feedback, onFeedback }: { lecture: LectureSummary; topic: string; onAsk: (q: string) => void } & SimpleFeedback) {
  return (
    <div className="card space-y-6 p-5 sm:p-7">
      <Notice tone="teal" eyebrow={`Covered in Week ${lecture.week}`} title={`That’s in Week ${lecture.week}: ${lecture.title}`}>
        <p className="text-lg text-ink-soft">
          “{topic[0].toUpperCase() + topic.slice(1)}” is covered in Week {lecture.week}, not this week. That week covers: {lecture.summary[0].toLowerCase() + lecture.summary.slice(1)}
        </p>
        <p className="text-sm text-ink-muted">This prototype only includes lecture clips for Weeks 4, 6 and 7.</p>
      </Notice>
      <AskChips label="Or ask about this week" questions={thisWeek} onAsk={onAsk} />
      <Feedback turnId={turnId} value={feedback} onChange={(v) => onFeedback(v)} />
    </div>
  );
}

/** Known gap: answered honestly, with no guessing. */
export function OutOfScopeCard({ turnId, topic, related, onAsk, feedback, onFeedback }: { topic: OutOfScopeTopic; related?: AnswerIntent; onAsk: (q: string) => void } & SimpleFeedback) {
  const nearest = topic.nearest && lectureSummary(`w${topic.nearest.week}`);
  return (
    <div className="card space-y-6 p-5 sm:p-7">
      <Notice tone="amber" eyebrow="Not covered in this course" title={`This course doesn’t cover ${topic.topic.toLowerCase()}`}>
        <p className="text-lg text-ink-soft">
          Campus AI only answers from this course’s lectures, slides, readings and your notes, so it won’t guess. Your instructor or TA is the
          best person to ask.
        </p>
      </Notice>
      {topic.nearest && nearest && (
        <p className="rounded-xl bg-sunken px-4 py-3 text-ink">
          <span className="font-semibold">Closest in the course: Week {nearest.week}, {nearest.title}.</span> {topic.nearest.note}
        </p>
      )}
      <AskChips label={related ? 'Related, from this week' : 'Or ask about this week'} questions={related ? [related.question] : thisWeek} onAsk={onAsk} />
      <Feedback turnId={turnId} value={feedback} onChange={(v) => onFeedback(v)} stuckHint="Your instructor or TA can help with this one." />
    </div>
  );
}

/** Nothing matched: say so plainly and offer the nearest answerable questions. */
export function NoMatchCard({ turnId, suggestions, onAsk, feedback, onFeedback }: { suggestions: AnswerIntent[]; onAsk: (q: string) => void } & SimpleFeedback) {
  return (
    <div className="card space-y-6 p-5 sm:p-7">
      <Notice tone="amber" eyebrow="No match in this course" title="I couldn’t find that in this course">
        <p className="text-lg text-ink-soft">
          Nothing in the lectures, slides, readings or your notes answers this, so I won’t guess. Try rephrasing with words from the lecture.
        </p>
      </Notice>
      <AskChips
        label={suggestions.length ? 'Did you mean' : 'Questions this course can answer'}
        questions={suggestions.length ? suggestions.map((s) => s.question) : suggestedQuestions}
        onAsk={onAsk}
      />
      <Feedback turnId={turnId} value={feedback} onChange={(v) => onFeedback(v)} stuckHint="Try rephrasing, or ask your instructor or TA." />
    </div>
  );
}
