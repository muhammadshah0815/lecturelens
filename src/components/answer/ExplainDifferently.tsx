import type { ExplainStyle, RecapClaim } from '../../data/types';
import { Claim } from './Bits';

const styles: { id: ExplainStyle; label: string; heading: string }[] = [
  { id: 'simpler', label: 'Simpler', heading: 'In simpler words' },
  { id: 'numbers', label: 'With numbers', heading: 'With the lecture’s numbers' },
  { id: 'analogy', label: 'With an analogy', heading: 'As an analogy' },
];

interface Props {
  turnId: string;
  variants: Record<ExplainStyle, RecapClaim[]>;
  selected: ExplainStyle | null;
  onSelect: (s: ExplainStyle | null) => void;
}

export function ExplainDifferently({ turnId, variants, selected, onSelect }: Props) {
  const current = styles.find((s) => s.id === selected);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-1 text-[0.95rem] font-semibold text-ink-soft" id={`explain-${turnId}`}>
          Explain differently:
        </p>
        <div role="group" aria-labelledby={`explain-${turnId}`} className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={selected === s.id}
              onClick={() => onSelect(selected === s.id ? null : s.id)}
              className={`min-h-[2.5rem] rounded-chip border px-4 text-[0.95rem] font-medium transition-colors ${
                selected === s.id ? 'border-teal bg-teal text-white' : 'border-line bg-surface text-ink-soft hover:border-teal hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {current && (
        <div className="space-y-2 rounded-xl border-l-4 border-teal bg-teal-tint px-4 py-3" aria-live="polite">
          <p className="text-sm font-semibold uppercase tracking-[0.06em] text-teal-strong">{current.heading}</p>
          {variants[current.id].map((c, i) => (
            <Claim key={i} claim={c} turnId={turnId} />
          ))}
        </div>
      )}
    </div>
  );
}
