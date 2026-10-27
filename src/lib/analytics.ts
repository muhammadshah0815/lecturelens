// Local-only usage log for reporting the success signals (time to first useful
// answer, % of answers where the moment is played, % marked "Got it").
// Events stay in this browser's localStorage; nothing is sent anywhere.
// Open the app with ?debug=1 to see the metrics and export the log.

const KEY = 'lecturelens:v1:events';
const MAX_EVENTS = 2000;

export type EventType =
  | 'session_start'
  | 'question_asked'
  | 'answer_shown'
  | 'moment_played'
  | 'source_opened'
  | 'feedback'
  | 'explain_differently'
  | 'also_see_opened'
  | 'notes_toggled'
  | 'stuck_reopened'
  | 'error';

/** Where a question came from: typed, a landing suggestion, an "Ask next" chip, or the Still stuck list. */
export type AskOrigin = 'typed' | 'suggestion' | 'follow-up' | 'still-stuck';

export interface LoggedEvent {
  type: EventType;
  /** ms since epoch */
  t: number;
  session: string;
  /** Turn the event belongs to, when there is one. */
  turnId?: string;
  data?: Record<string, string | number | boolean | null | undefined>;
}

const session = Math.random().toString(36).slice(2, 10);
const sessionStart = Date.now();
let sessionLogged = false;

export function readEvents(): LoggedEvent[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((e): e is LoggedEvent => !!e && typeof e === 'object' && typeof e.type === 'string' && typeof e.t === 'number') : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();

/** Notifies the debug panel when the log changes. */
export function subscribeEvents(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function track(type: EventType, turnId?: string, data?: LoggedEvent['data']) {
  if (type !== 'session_start' && !sessionLogged) track('session_start', undefined, { path: window.location.pathname });
  if (type === 'session_start') {
    if (sessionLogged) return;
    sessionLogged = true;
  }
  const event: LoggedEvent = { type, t: Date.now(), session, ...(turnId && { turnId }), ...(data && { data }) };
  try {
    const events = readEvents();
    events.push(event);
    window.localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // Storage blocked or full: the prototype keeps working without a log.
  }
  listeners.forEach((fn) => fn());
}

export function clearEvents() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  sessionLogged = false;
  listeners.forEach((fn) => fn());
}

export const msSinceSessionStart = () => Date.now() - sessionStart;

// ---------------------------------------------------------------- Metrics

export interface Metrics {
  sessions: number;
  questions: number;
  answers: number;
  /** Median ms from asking to the answer appearing. */
  medianMsToAnswer: number | null;
  /** Median ms from asking to the first play / source open / Got it on that answer. */
  medianMsToUseful: number | null;
  /** Answers that came with a lecture clip (answers and cross-week redirects). */
  answersWithClip: number;
  playedPct: number | null;
  gotItPct: number | null;
  stuckPct: number | null;
  sourcesOpened: number;
  answersWithSource: number;
}

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : null);

export function computeMetrics(events: LoggedEvent[]): Metrics {
  const asked = new Map<string, number>();
  const shown = new Map<string, number>();
  const withClip = new Set<string>();
  const firstUseful = new Map<string, number>();
  const played = new Set<string>();
  const sourced = new Set<string>();
  /** Latest feedback per turn: a student can change their mind. */
  const feedback = new Map<string, string | null>();
  let sourcesOpened = 0;

  for (const e of events) {
    const id = e.turnId;
    if (e.type === 'question_asked' && id) asked.set(id, e.t);
    if (e.type === 'answer_shown' && id) {
      shown.set(id, e.t);
      if (e.data?.resultKind === 'answer' || e.data?.resultKind === 'redirect') withClip.add(id);
    }
    if (e.type === 'source_opened') sourcesOpened++;
    if (!id) continue;
    if (e.type === 'moment_played') played.add(id);
    if (e.type === 'source_opened') sourced.add(id);
    if (e.type === 'feedback') feedback.set(id, (e.data?.value as string | null) ?? null);
    const useful = e.type === 'moment_played' || e.type === 'source_opened' || (e.type === 'feedback' && e.data?.value === 'got-it');
    if (useful && !firstUseful.has(id)) firstUseful.set(id, e.t);
  }

  const answered = [...shown.keys()];
  const toAnswer = answered.filter((id) => asked.has(id)).map((id) => shown.get(id)! - asked.get(id)!);
  const toUseful = [...firstUseful].filter(([id]) => asked.has(id)).map(([id, t]) => t - asked.get(id)!);
  const fb = answered.map((id) => feedback.get(id));

  return {
    sessions: new Set(events.map((e) => e.session)).size,
    questions: asked.size,
    answers: answered.length,
    medianMsToAnswer: median(toAnswer),
    medianMsToUseful: median(toUseful),
    answersWithClip: withClip.size,
    playedPct: pct([...withClip].filter((id) => played.has(id)).length, withClip.size),
    gotItPct: pct(fb.filter((v) => v === 'got-it').length, answered.length),
    stuckPct: pct(fb.filter((v) => v === 'stuck').length, answered.length),
    sourcesOpened,
    answersWithSource: answered.filter((id) => sourced.has(id)).length,
  };
}
