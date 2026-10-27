import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FeedbackValue, ResumePoint } from './components/answer/Feedback';
import { Turn, type TurnData } from './components/answer/Turn';
import { AskBox } from './components/AskBox';
import { EvidenceDrawer, type DrawerState } from './components/drawer/EvidenceDrawer';
import { Footer } from './components/Footer';
import { DebugPanel } from './components/DebugPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Landing } from './components/Landing';
import { SettingsSheet } from './components/SettingsSheet';
import type { PlayerHandle } from './components/player/LecturePlayer';
import type { Settings, SourceRef, StillStuckItem } from './data/types';
import { msSinceSessionStart, track, type AskOrigin } from './lib/analytics';
import { answerQuestion, resultForIntent, type EngineResult } from './lib/engine';
import { EvidenceContext, type EvidenceApi } from './lib/evidence';
import { newId } from './lib/id';
import { HintsContext, noHintsSeen, type HintId, type HintsApi, type HintsSeen } from './lib/hints';
import { sourceLabel } from './lib/sources';
import { clearAllStored, objectOf, storageAvailable, storageKeys, usePersistentState, type Validator } from './lib/storage';

/** How long "Finding the moment…" shows, so the answer feels retrieved rather than instant. */
const RETRIEVAL_MS = 600;

// Demo helper: open with ?seed=stuck to preview the "Still stuck" banner.
const demoStuck: StillStuckItem[] = [
  {
    id: 'demo-1',
    question: 'where does the (1+r)^t come from',
    intentId: 'formula',
    createdAt: '2026-10-20T19:02:00Z',
    resume: { moment: { lectureId: 'w6', startSec: 1120, endSec: 1565, label: 'Building the formula A = P(1 + r)ᵗ', why: '' }, atSec: 1342 },
  },
  { id: 'demo-2', question: 'What’s the difference between APR and APY?', intentId: 'apr-vs-apy', createdAt: '2026-10-20T19:10:00Z' },
];

const defaultSettings: Settings = { notesEnabled: true };
const noStuck: StillStuckItem[] = [];

const intentIdOf = (r: EngineResult) => (r.kind === 'answer' || r.kind === 'redirect' ? r.intent.id : null);

/** Drops "Still stuck" items saved by an older or damaged build instead of crashing on them. */
const validStuck: Validator<StillStuckItem[]> = (v) =>
  Array.isArray(v) ? v.filter((s): s is StillStuckItem => !!s && typeof s.id === 'string' && typeof s.question === 'string' && s.question.length > 0) : undefined;

const debug = new URLSearchParams(window.location.search).get('debug') === '1';
let answersShown = 0;

export default function App() {
  const [stillStuck, setStillStuck] = usePersistentState<StillStuckItem[]>(storageKeys.stillStuck, noStuck, validStuck);
  const [settings, setSettings] = usePersistentState<Settings>(storageKeys.settings, defaultSettings, objectOf);
  const [hintsSeen, setHintsSeen] = usePersistentState<HintsSeen>(storageKeys.hints, noHintsSeen, objectOf);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const [turns, setTurns] = useState<TurnData[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, stack: [], turnId: '' });
  const [announcement, setAnnouncement] = useState('');

  const players = useRef(new Map<string, PlayerHandle>());
  const opener = useRef<HTMLElement | null>(null);
  const lastTurnRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('seed') === 'stuck') setStillStuck(demoStuck);
  }, [setStillStuck]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    track('session_start', undefined, { debug, storage: storageAvailable, width: window.innerWidth });
  }, []);

  /** Adds a turn, shows "Finding the moment…", then reveals the result. */
  const startTurn = useCallback((question: string, result: EngineResult, origin: AskOrigin, extra?: Pick<TurnData, 'feedback' | 'resume'>) => {
    const id = newId();
    const askedAt = Date.now();
    track('question_asked', id, { question, origin, resultKind: result.kind, intentId: intentIdOf(result) });
    setTurns((ts) => [...ts, { id, question, status: 'thinking', result, feedback: null, ...extra }]);
    setAnnouncement('Finding the moment…');
    timers.current.push(
      window.setTimeout(() => {
        setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, status: 'ready' } : t)));
        track('answer_shown', id, {
          resultKind: result.kind,
          msFromQuestion: Date.now() - askedAt,
          firstOfSession: ++answersShown === 1,
          msFromSessionStart: msSinceSessionStart(),
        });
        setAnnouncement(
          result.kind === 'answer' ? `Answer ready. Best moment: ${result.intent.bestMoment.label}.`
          : result.kind === 'redirect' ? `This is covered in Week ${result.intent.targetWeek}.`
          : result.kind === 'topic-redirect' ? `This is covered in Week ${result.lecture.week}.`
          : result.kind === 'out-of-scope' ? 'Not covered in this course.'
          : 'No match found in this course.',
        );
      }, RETRIEVAL_MS),
    );
  }, []);

  const ask = useCallback(
    (question: string, origin: AskOrigin = 'typed') => startTurn(question, answerQuestion(question), origin),
    [startTurn],
  );

  /** Reopens a "Still stuck" item at the moment and time the student left it. */
  const reopen = useCallback(
    (item: StillStuckItem) => {
      const result = (item.intentId && resultForIntent(item.intentId)) || answerQuestion(item.question);
      track('stuck_reopened', undefined, { question: item.question, intentId: item.intentId, atSec: item.resume?.atSec });
      startTurn(item.question, result, 'still-stuck', { feedback: 'stuck', resume: item.resume });
    },
    [startTurn],
  );

  const removeStuck = useCallback((item: StillStuckItem) => setStillStuck((items) => items.filter((s) => s.id !== item.id)), [setStillStuck]);

  // Bring each new question into view.
  useEffect(() => {
    if (turns.length) lastTurnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [turns.length]);

  // When an answer arrives, move keyboard and screen-reader focus to it (the scroll is already handled).
  const lastTurn = turns[turns.length - 1];
  const lastReadyId = lastTurn?.status === 'ready' ? lastTurn.id : null;
  useEffect(() => {
    if (lastReadyId) lastTurnRef.current?.focus({ preventScroll: true });
  }, [lastReadyId]);

  const hints = useMemo<HintsApi>(
    () => ({
      show: (id: HintId, turnId: string) => !hintsSeen[id] && turnId === lastReadyId,
      done: (id: HintId) => setHintsSeen((h) => (h[id] ? h : { ...h, [id]: true })),
    }),
    [hintsSeen, lastReadyId, setHintsSeen],
  );

  const onFeedback = useCallback(
    (turn: TurnData, v: FeedbackValue, resume?: ResumePoint) => {
      setTurns((ts) => ts.map((t) => (t.id === turn.id ? { ...t, feedback: v } : t)));
      track('feedback', turn.id, { value: v, resultKind: turn.result.kind, intentId: intentIdOf(turn.result), atSec: resume?.atSec });
      setHintsSeen((h) => (h.feedback ? h : { ...h, feedback: true }));
      const intentId = intentIdOf(turn.result);
      const isSame = (s: StillStuckItem) => s.question === turn.question || (intentId !== null && s.intentId === intentId);
      setStillStuck((items) => {
        const rest = items.filter((s) => !isSame(s));
        return v === 'stuck'
          ? [...rest, { id: newId(), question: turn.question, intentId, createdAt: new Date().toISOString(), resume }]
          : rest;
      });
    },
    [setStillStuck, setHintsSeen],
  );

  const evidence = useMemo<EvidenceApi>(
    () => ({
      openSource: (source: SourceRef, turnId: string) => {
        opener.current = document.activeElement as HTMLElement | null;
        setDrawer({ open: true, stack: [source], turnId });
        setHintsSeen((h) => (h.source ? h : { ...h, source: true }));
        track('source_opened', turnId, { kind: source.kind, label: sourceLabel(source) });
      },
      registerPlayer: (turnId, handle) => {
        if (handle) players.current.set(turnId, handle);
        else players.current.delete(turnId);
      },
    }),
    [setHintsSeen],
  );

  const closeDrawer = useCallback((opts?: { restoreFocus?: boolean }) => {
    setDrawer((d) => ({ ...d, open: false }));
    if (opts?.restoreFocus !== false) opener.current?.focus({ preventScroll: true });
  }, []);

  const goHome = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setTurns([]);
    window.scrollTo({ top: 0 });
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    settingsButton.current?.focus({ preventScroll: true });
  }, []);

  const clearData = useCallback(() => {
    clearAllStored();
    setStillStuck(noStuck);
    setSettings(defaultSettings);
    setHintsSeen(noHintsSeen);
    setDrawer((d) => ({ ...d, open: false }));
    goHome();
  }, [goHome, setHintsSeen, setSettings, setStillStuck]);

  const changeSettings = useCallback(
    (s: Settings) => {
      if (s.notesEnabled !== settings.notesEnabled) track('notes_toggled', undefined, { notesEnabled: s.notesEnabled });
      setSettings(s);
    },
    [setSettings, settings.notesEnabled],
  );

  return (
    <EvidenceContext.Provider value={evidence}>
      <HintsContext.Provider value={hints}>
      <div className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-xl bg-ink px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <Header ref={settingsButton} onHome={goHome} onOpenSettings={() => setSettingsOpen(true)} notesEnabled={settings.notesEnabled} />
        {!storageAvailable && (
          <p role="status" className="mx-auto mb-2 w-full max-w-column rounded-xl bg-amber-soft px-4 py-2 text-[0.95rem] text-ink sm:px-5">
            Your browser is blocking storage, so “Still stuck” items and settings will be forgotten when you close this tab. Everything else works.
          </p>
        )}
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-column flex-1 px-5 focus:outline-none sm:px-6">
          {turns.length === 0 ? (
            <Landing onAsk={ask} stillStuck={stillStuck} onReopen={reopen} onRemoveStuck={removeStuck} />
          ) : (
            <div className="space-y-12 pt-4">
              {turns.map((t, i) => (
                <ErrorBoundary
                  key={t.id}
                  where="turn"
                  fallback={(retry) => (
                    <div role="alert" className="card space-y-3 p-5 sm:p-7">
                      <p className="eyebrow text-danger">Something went wrong</p>
                      <p className="text-lg text-ink">This answer couldn’t be shown. Your other answers are fine.</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn-primary" onClick={retry}>Try again</button>
                        <button type="button" className="chip" onClick={() => ask(t.question)}>Ask “{t.question}” again</button>
                      </div>
                    </div>
                  )}
                >
                  <Turn
                    ref={i === turns.length - 1 ? lastTurnRef : undefined}
                    turn={t}
                    notesEnabled={settings.notesEnabled}
                    onAsk={ask}
                    onFeedback={onFeedback}
                  />
                </ErrorBoundary>
              ))}
              <section aria-labelledby="ask-again" className="space-y-3 border-t border-line pt-8">
                <h2 id="ask-again" className="text-title text-ink">
                  Still have a question?
                </h2>
                <AskBox onAsk={ask} labelledBy="ask-again" />
              </section>
            </div>
          )}
        </main>
        <Footer />
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <SettingsSheet
        open={settingsOpen}
        onClose={closeSettings}
        settings={settings}
        onChange={changeSettings}
        stuckCount={stillStuck.length}
        onClearData={clearData}
      />

      <EvidenceDrawer
        state={drawer}
        player={players.current.get(drawer.turnId) ?? null}
        onClose={closeDrawer}
        onNavigate={(src) => setDrawer((d) => ({ ...d, stack: [...d.stack, src] }))}
        onBack={() => setDrawer((d) => ({ ...d, stack: d.stack.slice(0, -1) }))}
      />

      {debug && <DebugPanel />}
      </HintsContext.Provider>
    </EvidenceContext.Provider>
  );
}
