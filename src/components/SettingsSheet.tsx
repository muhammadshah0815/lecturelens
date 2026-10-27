import { useEffect, useRef, useState } from 'react';
import { sampleNote } from '../data/notes';
import type { Settings } from '../data/types';
import { useDialog } from '../lib/useDialog';
import { CloseIcon, NoteIcon } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (s: Settings) => void;
  stuckCount: number;
  onClearData: () => void;
}

const edited = new Date(`${sampleNote.updatedAt}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** "My notes" settings: the sample note, the AI-access toggle, and clearing stored data. */
export function SettingsSheet({ open, onClose, settings, onChange, stuckCount, onClearData }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState('');
  const trapTab = useDialog(open, onClose, panelRef, closeRef);
  const on = settings.notesEnabled;

  // Reset the confirm step and status line each time the sheet opens.
  useEffect(() => {
    if (open) {
      setConfirming(false);
      setStatus('');
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  function clear() {
    onClearData();
    setConfirming(false);
    setStatus('Your data was cleared from this browser.');
  }

  // Visible at once on open (a hidden element can't take focus); hidden only after the close animation.
  return (
    <div className={`fixed inset-0 z-50 ${open ? 'visible' : 'pointer-events-none invisible transition-[visibility] duration-300'}`}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onKeyDown={trapTab}
        className={`absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-3xl bg-paper shadow-lift transition-[transform,opacity] duration-300 ease-out sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[86vh] sm:w-[40rem] sm:-translate-x-1/2 sm:rounded-3xl ${
          open ? 'translate-y-0 opacity-100 sm:-translate-y-1/2' : 'translate-y-full opacity-100 sm:-translate-y-[45%] sm:opacity-0'
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <h2 id="settings-title" className="text-title text-ink">
            My notes & data
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close settings (Esc)"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-sunken hover:text-ink"
          >
            <CloseIcon size={20} />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Notes toggle */}
          <section aria-labelledby="notes-heading" className="space-y-4">
            <h3 id="notes-heading" className="eyebrow">
              Your notes
            </h3>
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-4">
              <div className="min-w-0">
                <p id="notes-toggle-label" className="text-lg font-semibold text-ink">
                  AI may use my notes
                </p>
                <p id="notes-toggle-desc" className="mt-1 text-ink-soft">
                  {on
                    ? 'Recaps can quote your notes. Those lines are marked with a “My note” chip.'
                    : 'Answers use course materials only. Your notes stay private and unused.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-labelledby="notes-toggle-label"
                aria-describedby="notes-toggle-desc"
                onClick={() => onChange({ ...settings, notesEnabled: !on })}
                className={`relative mt-1 inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 transition-colors ${
                  on ? 'border-teal bg-teal' : 'border-line-strong bg-sunken'
                }`}
              >
                <span className="sr-only">{on ? 'On' : 'Off'}</span>
                <span
                  aria-hidden="true"
                  className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-[1.6rem]' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            <article aria-label={sampleNote.title} className={`rounded-2xl border border-line bg-surface transition-opacity ${on ? '' : 'opacity-70'}`}>
              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-soft text-amber">
                  <NoteIcon size={18} />
                </span>
                <div>
                  <p className="font-semibold text-ink">{sampleNote.title}</p>
                  <p className="text-sm text-ink-muted">Edited {edited} · Only you can see this</p>
                </div>
              </div>
              <ul className="max-h-48 space-y-3 overflow-y-auto px-4 py-3">
                {sampleNote.blocks.map((b) => (
                  <li key={b.id}>
                    {b.heading && <p className="font-semibold text-ink">{b.heading}</p>}
                    <p className="text-ink-soft">{b.text}</p>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          {/* Data */}
          <section aria-labelledby="data-heading" className="space-y-3">
            <h3 id="data-heading" className="eyebrow">
              Your data
            </h3>
            <p className="text-ink-soft">
              LectureLens keeps your “Still stuck” list ({stuckCount} {stuckCount === 1 ? 'item' : 'items'}), these settings, which tips you’ve seen,
              and a usage log (questions asked, clips played, sources opened) in this browser only. Nothing is sent anywhere.
            </p>
            {!confirming ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="min-h-[2.75rem] rounded-xl border-2 border-danger/40 px-5 font-semibold text-danger transition-colors hover:border-danger hover:bg-danger-soft"
              >
                Clear my data
              </button>
            ) : (
              <div role="group" aria-labelledby="confirm-text" className="space-y-3 rounded-2xl border-2 border-danger/40 bg-danger-soft p-4">
                <p id="confirm-text" className="font-medium text-ink">
                  Clear your “Still stuck” list, settings, tips, usage log and this session’s answers? This can’t be undone.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    ref={confirmRef}
                    type="button"
                    onClick={clear}
                    className="min-h-[2.75rem] rounded-xl bg-danger px-5 font-semibold text-white hover:bg-danger/90"
                  >
                    Yes, clear my data
                  </button>
                  <button type="button" className="chip" onClick={() => setConfirming(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <p className="min-h-[1.5rem] font-medium text-teal-strong" role="status">
              {status}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
