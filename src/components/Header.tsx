import { forwardRef } from 'react';
import { course } from '../data/course';
import { LensIcon, NoteIcon } from './icons';

interface Props {
  onHome: () => void;
  onOpenSettings: () => void;
  notesEnabled: boolean;
}

export const Header = forwardRef<HTMLButtonElement, Props>(function Header({ onHome, onOpenSettings, notesEnabled }, settingsRef) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <a
        href="./"
        onClick={(e) => {
          e.preventDefault();
          onHome();
        }}
        className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-ink"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal text-white">
          <LensIcon size={18} strokeWidth={2.5} />
        </span>
        LectureLens
      </a>
      <div className="flex items-center gap-5">
        <p className="hidden text-right text-[0.95rem] text-ink-soft md:block">
          <span className="font-semibold text-ink">{course.title}</span>
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          {course.term}
        </p>
        <button
          ref={settingsRef}
          type="button"
          onClick={onOpenSettings}
          aria-haspopup="dialog"
          className="inline-flex min-h-[2.75rem] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-line bg-surface px-3 font-semibold text-ink-soft transition-colors hover:border-teal hover:text-ink"
        >
          <NoteIcon size={18} className="text-amber" />
          My notes
          <span
            className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${notesEnabled ? 'bg-teal-soft text-teal-strong' : 'bg-sunken text-ink-muted'}`}
          >
            <span className="sr-only">, AI access </span>
            {notesEnabled ? 'On' : 'Off'}
          </span>
        </button>
      </div>
    </header>
  );
});
