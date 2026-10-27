import { useLayoutEffect, useRef, useState } from 'react';
import { noteById } from '../../data/notes';
import type { Seconds, SourceRef } from '../../data/types';
import { getLecture, segmentIndexAt, slideById, slideRange } from '../../lib/lecture';
import { formatTime } from '../../lib/time';
import { useDialog } from '../../lib/useDialog';
import { BackIcon, BookIcon, ClockIcon, CloseIcon, NoteIcon, PlayIcon, SlideIcon } from '../icons';
import type { PlayerHandle } from '../player/LecturePlayer';
import { ScaledStage } from '../slides/ScaledStage';
import { SlideView } from '../slides/SlideView';

export interface DrawerState {
  open: boolean;
  /** Navigation stack; the last entry is shown. */
  stack: SourceRef[];
  turnId: string;
}

interface Props {
  state: DrawerState;
  player: PlayerHandle | null;
  onClose: (opts?: { restoreFocus?: boolean }) => void;
  onNavigate: (src: SourceRef) => void;
  onBack: () => void;
}

export function EvidenceDrawer({ state, player, onClose, onNavigate, onBack }: Props) {
  const { open, stack } = state;
  const src = stack[stack.length - 1];
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const trapTab = useDialog(open, onClose, panelRef, closeRef);

  // When the shown source changes, start at the top, scrolling only if the cited item would be out of view.
  useLayoutEffect(() => {
    const box = scrollRef.current;
    if (!box || !src) return;
    const cited = box.querySelector<HTMLElement>('[data-cited]');
    const hidden = cited && cited.offsetTop + cited.offsetHeight > box.clientHeight - 24;
    box.scrollTop = hidden ? cited.offsetTop - 80 : 0;
  }, [src]);

  const canJump = (lectureId: string) => !!player && player.lectureId === lectureId;
  const jump = (sec: Seconds) => {
    player?.seek(sec, { play: true, reveal: true });
    onClose({ restoreFocus: false });
  };

  const view = src ? describe(src) : null;

  // Visible at once on open (a hidden element can't take focus); hidden only after the close animation.
  return (
    <div className={`fixed inset-0 z-40 ${open ? 'visible' : 'pointer-events-none invisible transition-[visibility] duration-300'}`}>
      <div
        aria-hidden="true"
        onClick={() => onClose()}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onKeyDown={trapTab}
        className={`absolute right-0 top-0 flex h-full w-full flex-col bg-paper shadow-lift transition-transform duration-300 ease-out sm:w-[34rem] lg:w-[38rem] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-start gap-3 border-b border-line bg-surface px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          {stack.length > 1 && (
            <button type="button" onClick={onBack} aria-label="Back" className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-sunken hover:text-ink">
              <BackIcon size={20} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            {view && (
              <p className="eyebrow inline-flex items-center gap-1.5">
                <view.Icon size={14} /> {view.eyebrow}
              </p>
            )}
            <h2 id="drawer-title" className="mt-0.5 text-title text-ink">
              {view?.title ?? 'Source'}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onClose()}
            aria-label="Close source (Esc)"
            className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-sunken hover:text-ink"
          >
            <CloseIcon size={20} />
          </button>
        </header>

        <div ref={scrollRef} className="relative flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {src?.kind === 'slide' && <SlidePanel src={src} canJump={canJump(src.lectureId)} onJump={jump} onNavigate={onNavigate} />}
          {src?.kind === 'transcript' && (
            <TranscriptPanel key={`${src.lectureId}-${src.atSec}`} src={src} canJump={canJump(src.lectureId)} onJump={jump} onNavigate={onNavigate} />
          )}
          {src?.kind === 'note' && <NotePanel src={src} />}
          {src?.kind === 'reading' && <ReadingPanel src={src} />}
        </div>

        <p className="hidden border-t border-line bg-surface px-5 py-2 text-sm text-ink-muted sm:block">
          Press <kbd className="rounded border border-line-strong px-1.5 font-sans text-xs">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Header text

function describe(src: SourceRef) {
  switch (src.kind) {
    case 'slide': {
      const lecture = getLecture(src.lectureId);
      const slide = lecture && slideById(lecture, src.slideId);
      return { Icon: SlideIcon, eyebrow: `Slide ${slide?.number} · Week ${lecture?.week}`, title: slide?.title ?? 'Slide' };
    }
    case 'transcript': {
      const lecture = getLecture(src.lectureId);
      return { Icon: ClockIcon, eyebrow: `Transcript · Week ${lecture?.week}`, title: `What was said around ${formatTime(src.atSec)}` };
    }
    case 'note':
      return { Icon: NoteIcon, eyebrow: 'My note · private to you', title: noteById(src.noteId)?.title ?? 'Note' };
    case 'reading':
      return { Icon: BookIcon, eyebrow: 'Course reading', title: getLecture(src.lectureId)?.readings.find((r) => r.id === src.readingId)?.title ?? 'Reading' };
  }
}

// ---------------------------------------------------------------- Panels

interface PanelNav {
  canJump: boolean;
  onJump: (sec: Seconds) => void;
  onNavigate: (src: SourceRef) => void;
}

function SlidePanel({ src, canJump, onJump, onNavigate }: { src: Extract<SourceRef, { kind: 'slide' }> } & PanelNav) {
  const lecture = getLecture(src.lectureId);
  const slide = lecture && slideById(lecture, src.slideId);
  if (!lecture || !slide) return <p className="text-ink-soft">This slide isn’t available.</p>;
  const [from, to] = slideRange(lecture, slide);

  return (
    <div className="space-y-5">
      <ScaledStage className="rounded-xl border border-line shadow-card">
        <SlideView slide={slide} weekLabel={`Week ${lecture.week}`} />
      </ScaledStage>
      <p className="text-ink-soft">
        On screen from <span className="font-semibold tabular-nums text-ink">{formatTime(from)}</span> to{' '}
        <span className="font-semibold tabular-nums text-ink">{formatTime(to)}</span> in Week {lecture.week}: {lecture.title}.
      </p>
      <div className="flex flex-wrap gap-2">
        {canJump && (
          <button type="button" className="btn-primary" onClick={() => onJump(from)}>
            <PlayIcon size={16} /> Watch from {formatTime(from)}
          </button>
        )}
        <button type="button" className="chip" onClick={() => onNavigate({ kind: 'transcript', lectureId: lecture.id, atSec: from })}>
          <ClockIcon size={16} /> Read what was said
        </button>
      </div>
    </div>
  );
}

const WINDOW = 2;
const MORE = 3;

function TranscriptPanel({ src, canJump, onJump, onNavigate }: { src: Extract<SourceRef, { kind: 'transcript' }> } & PanelNav) {
  const lecture = getLecture(src.lectureId);
  const target = lecture ? segmentIndexAt(lecture, src.atSec) : 0;
  const [lo, setLo] = useState(Math.max(0, target - WINDOW));
  const [hi, setHi] = useState(target + WINDOW);
  if (!lecture) return <p className="text-ink-soft">This transcript isn’t available.</p>;

  const segs = lecture.transcript.slice(lo, hi + 1);
  const citedSlide = slideById(lecture, lecture.transcript[target].slideId);

  return (
    <div className="space-y-4">
      {lo > 0 && (
        <button type="button" className="chip" onClick={() => setLo((v) => Math.max(0, v - MORE))}>
          Show earlier
        </button>
      )}
      <ol className="space-y-2">
        {segs.map((seg, i) => {
          const cited = lo + i === target;
          return (
            <li
              key={seg.id}
              data-cited={cited || undefined}
              className={`rounded-xl px-4 py-3 ${cited ? 'border-l-4 border-teal bg-teal-tint' : 'border-l-4 border-transparent'}`}
            >
              <div className="mb-1 flex items-center gap-2">
                {canJump ? (
                  <button
                    type="button"
                    onClick={() => onJump(seg.startSec)}
                    aria-label={`Play from ${formatTime(seg.startSec)}`}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-sm font-semibold tabular-nums text-teal-strong hover:bg-teal-soft"
                  >
                    <PlayIcon size={12} /> {formatTime(seg.startSec)}
                  </button>
                ) : (
                  <span className="text-sm font-semibold tabular-nums text-ink-muted">{formatTime(seg.startSec)}</span>
                )}
                {cited && <span className="rounded bg-teal px-1.5 py-0.5 text-xs font-semibold text-white">Cited</span>}
              </div>
              <p className={`leading-relaxed ${cited ? 'text-lg text-ink' : 'text-ink-soft'}`}>{seg.text}</p>
              {cited && citedSlide && (
                <button
                  type="button"
                  onClick={() => onNavigate({ kind: 'slide', lectureId: lecture.id, slideId: citedSlide.id })}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-teal-strong underline-offset-2 hover:underline"
                >
                  <SlideIcon size={14} /> On screen: Slide {citedSlide.number}, {citedSlide.title}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {hi < lecture.transcript.length - 1 && (
        <button type="button" className="chip" onClick={() => setHi((v) => Math.min(lecture.transcript.length - 1, v + MORE))}>
          Show later
        </button>
      )}
    </div>
  );
}

function NotePanel({ src }: { src: Extract<SourceRef, { kind: 'note' }> }) {
  const note = noteById(src.noteId);
  if (!note) return <p className="text-ink-soft">This note isn’t available.</p>;
  const updated = new Date(`${note.updatedAt}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">Last edited {updated}. Only you can see your notes.</p>
      <ol className="space-y-2">
        {note.blocks.map((b) => {
          const cited = b.id === src.blockId;
          return (
            <li
              key={b.id}
              data-cited={cited || undefined}
              className={`rounded-xl border-l-4 px-4 py-3 ${cited ? 'border-amber bg-amber-soft' : 'border-transparent'}`}
            >
              {b.heading && (
                <p className="mb-0.5 flex items-center gap-2 font-semibold text-ink">
                  {b.heading}
                  {cited && <span className="rounded bg-amber px-1.5 py-0.5 text-xs font-semibold text-white">Cited</span>}
                </p>
              )}
              <p className={cited ? 'text-lg text-ink' : 'text-ink-soft'}>{b.text}</p>
            </li>
          );
        })}
      </ol>
      <p className="border-t border-line pt-4 text-sm text-ink-muted">Campus AI can quote this note because note access is turned on.</p>
    </div>
  );
}

function ReadingPanel({ src }: { src: Extract<SourceRef, { kind: 'reading' }> }) {
  const reading = getLecture(src.lectureId)?.readings.find((r) => r.id === src.readingId);
  if (!reading) return <p className="text-ink-soft">This reading isn’t available.</p>;
  return (
    <p className="text-ink-soft">
      {reading.source}
      {reading.pages ? `, ${reading.pages}` : ''}.
    </p>
  );
}
