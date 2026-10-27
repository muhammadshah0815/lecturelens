import { forwardRef } from 'react';
import type { EngineResult } from '../../lib/engine';
import { AnswerCard } from './AnswerCard';
import { QuestionBubble } from './Bits';
import type { FeedbackValue, ResumePoint } from './Feedback';
import { NoMatchCard, OutOfScopeCard, RedirectCard, TopicRedirectCard } from './OtherCards';
import { ThinkingCard } from './ThinkingCard';

export interface TurnData {
  id: string;
  question: string;
  status: 'thinking' | 'ready';
  result: EngineResult;
  feedback: FeedbackValue;
  /** Set when reopened from the "Still stuck" list. */
  resume?: ResumePoint;
}

interface Props {
  turn: TurnData;
  notesEnabled: boolean;
  onAsk: (q: string) => void;
  onFeedback: (turn: TurnData, v: FeedbackValue, resume?: ResumePoint) => void;
}

export const Turn = forwardRef<HTMLElement, Props>(function Turn({ turn, notesEnabled, onAsk, onFeedback }, ref) {
  const { id, question, result } = turn;
  const setFeedback = (v: FeedbackValue, resume?: ResumePoint) => onFeedback(turn, v, resume);
  const fb = { turnId: id, feedback: turn.feedback, onFeedback: setFeedback };

  if (turn.status === 'thinking') {
    return (
      <article ref={ref} aria-label={`Finding an answer to: ${question}`} className="scroll-mt-6">
        <ThinkingCard question={question} notesEnabled={notesEnabled} />
      </article>
    );
  }

  return (
    <article ref={ref} tabIndex={-1} aria-label={`Answer to: ${question}`} className="scroll-mt-6 space-y-4 focus:outline-none">
      <QuestionBubble>{question}</QuestionBubble>
      {result.kind === 'answer' && (
        <AnswerCard
          turnId={id}
          question={question}
          intent={result.intent}
          notesEnabled={notesEnabled}
          feedback={turn.feedback}
          onFeedback={setFeedback}
          onAsk={onAsk}
          resume={turn.resume}
        />
      )}
      {result.kind === 'redirect' && <RedirectCard intent={result.intent} {...fb} onAsk={onAsk} resume={turn.resume} />}
      {result.kind === 'topic-redirect' && <TopicRedirectCard lecture={result.lecture} topic={result.topic} onAsk={onAsk} {...fb} />}
      {result.kind === 'out-of-scope' && <OutOfScopeCard topic={result.topic} related={result.related} onAsk={onAsk} {...fb} />}
      {result.kind === 'no-match' && <NoMatchCard suggestions={result.suggestions} onAsk={onAsk} {...fb} />}
    </article>
  );
});
