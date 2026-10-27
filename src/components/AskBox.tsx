import { useId, useState, type FormEvent } from 'react';
import { ArrowRightIcon } from './icons';

interface AskBoxProps {
  onAsk: (question: string) => void;
  /** id of the visible heading that labels this input. */
  labelledBy: string;
  autoFocus?: boolean;
}

const MAX_LENGTH = 300;

/** Why a question can't be asked yet, in plain words; null when it's fine. */
function problemWith(question: string): string | null {
  if (!question) return 'Type a question first, for example “why does my debt keep growing?”';
  if (!/[a-z]/i.test(question)) return 'Try using words, for example “what is compound interest?”';
  if (question.replace(/[^a-z]/gi, '').length < 3) return 'Add a few more words so I can find the right moment.';
  return null;
}

export function AskBox({ onAsk, labelledBy, autoFocus }: AskBoxProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  function submit(e: FormEvent) {
    e.preventDefault();
    const question = value.trim();
    const problem = problemWith(question);
    setError(problem);
    if (problem) return;
    onAsk(question);
    setValue('');
  }

  return (
    <form onSubmit={submit} role="search" noValidate className="w-full">
      <div
        className={`flex flex-col gap-3 rounded-2xl border-2 bg-surface p-2 shadow-card transition-colors focus-within:border-teal sm:flex-row sm:items-center ${
          error ? 'border-danger' : 'border-ink-muted/75'
        }`}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          aria-labelledby={labelledBy}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          maxLength={MAX_LENGTH}
          placeholder="e.g. why does my debt keep growing?"
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          className="min-h-[3.25rem] w-full flex-1 rounded-xl bg-transparent px-4 text-xl text-ink placeholder:text-ink-muted focus:outline-none focus-visible:outline-none"
        />
        <button type="submit" className="btn-primary shrink-0 sm:px-6">
          Find the moment
          <ArrowRightIcon size={18} />
        </button>
      </div>
      <p id={errorId} role="alert" className="mt-2 min-h-0 px-2 text-[0.95rem] font-medium text-danger empty:mt-0">
        {error}
      </p>
    </form>
  );
}
