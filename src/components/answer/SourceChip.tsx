import type { SourceRef } from '../../data/types';
import { useEvidence } from '../../lib/evidence';
import { sourceDescription, sourceLabel } from '../../lib/sources';
import { BookIcon, ClockIcon, NoteIcon, SlideIcon } from '../icons';

const icons = { slide: SlideIcon, transcript: ClockIcon, note: NoteIcon, reading: BookIcon };

export function SourceChip({ source, turnId }: { source: SourceRef; turnId: string }) {
  const { openSource } = useEvidence();
  const Icon = icons[source.kind];
  const isNote = source.kind === 'note';
  return (
    <button
      type="button"
      onClick={() => openSource(source, turnId)}
      title={sourceDescription(source)}
      aria-label={`Source: ${sourceDescription(source)}`}
      aria-haspopup="dialog"
      className={`mx-0.5 inline-flex translate-y-[-1px] items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 align-middle text-[0.8rem] font-semibold tabular-nums transition-colors ${
        isNote
          ? 'border-amber/30 bg-amber-soft text-amber hover:border-amber'
          : 'border-teal/25 bg-teal-tint text-teal-strong hover:border-teal hover:bg-teal-soft'
      }`}
    >
      <Icon size={13} strokeWidth={2.4} />
      {sourceLabel(source)}
    </button>
  );
}
