import { useState } from 'react';
import { intentById } from '../../data/intents';
import type { AnswerIntent, ExplainStyle, Moment } from '../../data/types';
import { track } from '../../lib/analytics';
import { normalize } from '../../lib/engine';
import { sameMoment } from '../../lib/moments';
import { formatTime } from '../../lib/time';
import { Hint } from '../Hint';
import { AlsoSee } from './AlsoSee';
import { BestMoment } from './BestMoment';
import { AskChips, Claim } from './Bits';
import { ExplainDifferently } from './ExplainDifferently';
import { Feedback, type FeedbackHandler, type FeedbackValue, type ResumePoint } from './Feedback';
import { usePlayer } from './usePlayer';

interface Props {
  turnId: string;
  question: string;
  intent: AnswerIntent;
  notesEnabled: boolean;
  feedback: FeedbackValue;
  onFeedback: FeedbackHandler;
  onAsk: (q: string) => void;
  /** Set when reopened from the "Still stuck" list. */
  resume?: ResumePoint;
}

export function AnswerCard({ turnId, question, intent, notesEnabled, feedback, onFeedback, onAsk, resume }: Props) {
  const [setPlayer, player] = usePlayer(turnId);
  const moments = [intent.bestMoment, ...intent.alsoSee];
  const [moment, setMoment] = useState<Moment>(() => (resume && moments.find((m) => sameMoment(m, resume.moment))) || intent.bestMoment);
  const [explain, setExplain] = useState<ExplainStyle | null>(resume ? 'simpler' : null);

  const claims = notesEnabled && intent.noteClaim ? [...intent.recap, intent.noteClaim] : intent.recap;
  const followUps = intent.followUps.map((id) => intentById(id)?.question).filter((q): q is string => !!q);
  const rephrased = normalize(question) !== normalize(intent.question);
  const showingBest = sameMoment(moment, intent.bestMoment);
  const resumeHere = resume && sameMoment(resume.moment, moment) ? resume.atSec : undefined;

  function pickExplain(s: ExplainStyle | null) {
    setExplain(s);
    if (s) track('explain_differently', turnId, { style: s, intentId: intent.id });
  }

  function pickMoment(m: Moment) {
    setMoment(m);
    if (!sameMoment(m, moment)) track('also_see_opened', turnId, { lectureId: m.lectureId, startSec: m.startSec });
  }

  function handleFeedback(v: FeedbackValue) {
    onFeedback(v, { moment, atSec: player.current?.getTime() ?? moment.startSec });
    if (v === 'stuck') setExplain('simpler');
  }

  return (
    <div className="card space-y-8 p-5 sm:p-7">
      {(rephrased || resume) && (
        <div className="-mb-4 space-y-1 text-sm text-ink-muted">
          {resume && (
            <p className="font-medium text-amber">
              You marked this as still stuck. Picking up at {formatTime(resume.atSec)}, with a simpler explanation open.
            </p>
          )}
          {rephrased && (
            <p>
              Answering: <span className="font-medium text-ink-soft">“{intent.question}”</span>
            </p>
          )}
        </div>
      )}

      <BestMoment
        ref={setPlayer}
        turnId={turnId}
        moment={moment}
        initialSec={resumeHere}
        eyebrow={showingBest ? 'Best moment' : 'Also see'}
        onBack={showingBest ? undefined : () => setMoment(intent.bestMoment)}
      />

      <section aria-labelledby={`recap-${turnId}`} className="space-y-4 border-t border-line pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id={`recap-${turnId}`} className="eyebrow">Quick recap</h3>
          <p className="text-sm text-ink-muted">Tap a source to check it</p>
        </div>
        <Hint id="source" turnId={turnId}>
          Every line has a source. Tap a chip like <strong>Slide 3</strong> or a timestamp to see exactly where it came from.
        </Hint>
        <div className="space-y-3">
          {claims.map((c, i) => (
            <Claim key={i} claim={c} turnId={turnId} />
          ))}
        </div>
        <ExplainDifferently turnId={turnId} variants={intent.explainDifferently} selected={explain} onSelect={pickExplain} />
      </section>

      <AlsoSee moments={intent.alsoSee} active={moment} onPick={pickMoment} />

      <AskChips label="Ask next" questions={followUps} onAsk={onAsk} />

      <Feedback turnId={turnId} value={feedback} onChange={handleFeedback} stuckHint="A simpler explanation is open above." />
    </div>
  );
}
