import { course } from '../../data/course';

/** Picture-in-picture instructor silhouette, drawn in stage (960×540) units. */
export function Instructor({ speaking }: { speaking: boolean }) {
  return (
    <div className="absolute bottom-5 right-5 w-[168px] overflow-hidden rounded-xl border border-line bg-[#E4EEEE] shadow-card">
      <svg viewBox="0 0 168 110" width="168" height="110" aria-hidden="true">
        <rect width="168" height="110" fill="#DCE9EA" />
        <rect x="0" y="78" width="168" height="32" fill="#CFE0E1" />
        <g fill="rgb(var(--ink))" fillOpacity="0.82">
          <circle cx="84" cy="44" r="19" />
          <path d="M40 110c2-26 20-40 44-40s42 14 44 40Z" />
        </g>
      </svg>
      <div className="flex items-center justify-between bg-surface px-2.5 py-1.5 text-[13px] font-medium text-ink-soft">
        {course.instructor}
        <span className={`ll-talk flex h-3 items-end gap-[2px] ${speaking ? 'is-on' : ''}`} aria-hidden="true">
          <i /><i /><i />
        </span>
      </div>
    </div>
  );
}
