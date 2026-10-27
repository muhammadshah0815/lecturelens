import { QuestionBubble } from './Bits';

/** Shown for ~600ms while the "Campus AI" looks for the moment. Mirrors the answer layout to avoid a jump. */
export function ThinkingCard({ question, notesEnabled }: { question: string; notesEnabled: boolean }) {
  return (
    <div className="space-y-4">
      <QuestionBubble>{question}</QuestionBubble>
      <div className="card space-y-4 p-5 sm:p-7" aria-busy="true">
        <p className="inline-flex items-center gap-2 font-semibold text-teal">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
          </span>
          Finding the moment…
        </p>
        <p className="text-ink-muted">
          Searching this course’s lectures, slides and readings{notesEnabled ? ', and your notes' : ''}.
        </p>
        <div aria-hidden="true" className="space-y-3">
          <div className="h-6 w-2/3 animate-pulse rounded-md bg-sunken" />
          <div className="aspect-video w-full animate-pulse rounded-2xl bg-sunken" />
        </div>
      </div>
    </div>
  );
}
