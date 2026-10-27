import { useEffect, useState, useSyncExternalStore } from 'react';
import { clearEvents, computeMetrics, readEvents, subscribeEvents, type LoggedEvent } from '../lib/analytics';
import { CloseIcon } from './icons';

// Hidden researcher panel: open the app with ?debug=1. Reads the local usage log
// and turns it into the three success signals from SPEC.md.

let snapshot = readEvents();
let version = 0;
const subscribe = (fn: () => void) =>
  subscribeEvents(() => {
    snapshot = readEvents();
    version++;
    fn();
  });
const getVersion = () => version;

const secs = (ms: number | null) => (ms == null ? '—' : `${(ms / 1000).toFixed(1)} s`);
const percent = (n: number | null) => (n == null ? '—' : `${n}%`);
const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function describe(e: LoggedEvent) {
  const d = e.data ?? {};
  switch (e.type) {
    case 'question_asked':
      return `“${d.question}” → ${d.resultKind}${d.intentId ? ` (${d.intentId})` : ''} · ${d.origin}`;
    case 'answer_shown':
      return `${d.resultKind} in ${secs(Number(d.msFromQuestion))}${d.firstOfSession ? ` · first answer, ${secs(Number(d.msFromSessionStart))} after load` : ''}`;
    case 'moment_played':
      return `${d.lectureId} @ ${d.startSec}s (${d.eyebrow})`;
    case 'source_opened':
      return String(d.label ?? d.kind);
    case 'feedback':
      return String(d.value ?? 'cleared');
    default:
      return Object.entries(d)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ');
  }
}

export function DebugPanel() {
  useSyncExternalStore(subscribe, getVersion);
  const events = snapshot;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const m = computeMetrics(events);

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(''), 2500);
    return () => clearTimeout(t);
  }, [status]);

  const json = () => JSON.stringify({ exportedAt: new Date().toISOString(), metrics: m, events }, null, 2);

  async function copy() {
    try {
      await navigator.clipboard.writeText(json());
      setStatus('Copied to clipboard');
    } catch {
      setStatus('Copy blocked by the browser. Use Download instead.');
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([json()], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `lecturelens-events-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const rows: [string, string, string][] = [
    ['Questions asked', String(m.questions), `${m.sessions} session${m.sessions === 1 ? '' : 's'}`],
    ['Time to answer (median)', secs(m.medianMsToAnswer), 'question → answer on screen'],
    ['Time to first useful action (median)', secs(m.medianMsToUseful), 'question → play, source or Got it'],
    ['Answers where the moment was played', percent(m.playedPct), `of ${m.answersWithClip} answers with a clip`],
    ['Answers marked Got it', percent(m.gotItPct), 'latest choice per answer'],
    ['Answers marked Still stuck', percent(m.stuckPct), 'latest choice per answer'],
    ['Source chips opened', String(m.sourcesOpened), `on ${m.answersWithSource} answer${m.answersWithSource === 1 ? '' : 's'}`],
  ];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lift"
      >
        Debug · {events.length} events
      </button>
    );
  }

  return (
    <aside
      aria-label="Debug: success signals"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex max-h-[70vh] w-[min(30rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface text-sm shadow-lift"
    >
      <header className="flex items-center justify-between gap-2 border-b border-line bg-sunken px-4 py-2">
        <p className="font-bold text-ink">Debug · success signals</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Minimize debug panel" className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface">
          <CloseIcon size={14} />
        </button>
      </header>
      <div className="overflow-y-auto px-4 py-3">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Success signals from the local usage log</caption>
          <tbody>
            {rows.map(([label, value, note]) => (
              <tr key={label} className="border-b border-line last:border-0">
                <th scope="row" className="py-1.5 pr-2 font-medium text-ink-soft">
                  {label}
                  <span className="block text-xs font-normal text-ink-muted">{note}</span>
                </th>
                <td className="py-1.5 text-right font-semibold tabular-nums text-ink">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="chip min-h-[2.25rem] py-1" onClick={copy}>Copy JSON</button>
          <button type="button" className="chip min-h-[2.25rem] py-1" onClick={download}>Download JSON</button>
          <button type="button" className="chip min-h-[2.25rem] py-1 text-danger" onClick={() => { clearEvents(); setStatus('Log cleared'); }}>
            Clear log
          </button>
          <span role="status" className="text-xs font-medium text-teal-strong">{status}</span>
        </div>

        <h2 className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">Event log ({events.length}, newest first)</h2>
        {events.length === 0 ? (
          <p className="mt-1 text-ink-muted">No events yet. Ask a question to start logging.</p>
        ) : (
          <ol className="mt-1 space-y-1 font-mono text-xs">
            {[...events].reverse().slice(0, 60).map((e, i) => (
              <li key={`${e.t}-${i}`} className="break-words text-ink-soft">
                <span className="text-ink-muted">{clock(e.t)}</span> <span className="font-semibold text-ink">{e.type}</span> {describe(e)}
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}
