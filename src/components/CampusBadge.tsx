import { ServerIcon } from './icons';

/** Trust marker: answers are generated on university infrastructure, from course material only. */
export function CampusBadge() {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-chip border border-line bg-surface px-3 py-1 text-sm font-medium text-ink-soft">
      <ServerIcon size={16} className="text-teal" />
      <span>
        <span className="font-semibold text-ink">Campus AI</span>
        <span aria-hidden="true"> · </span>
        <span className="sr-only">, </span>
        runs on university servers
      </span>
    </span>
  );
}
