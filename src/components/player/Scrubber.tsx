import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { formatTime } from '../../lib/time';

interface Props {
  duration: number;
  time: number;
  clipStart: number;
  clipEnd: number;
  /** Slide start times, drawn as small ticks. */
  marks: number[];
  /** Label for a hovered time, e.g. the slide title. */
  describe: (sec: number) => string;
  onSeek: (sec: number) => void;
}

export function Scrubber({ duration, time, clipStart, clipEnd, marks, describe, onSeek }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [hover, setHover] = useState<number | null>(null);

  const pct = (sec: number) => `${(sec / duration) * 100}%`;
  const secAt = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return Math.min(duration, Math.max(0, ((clientX - r.left) / r.width) * duration));
  };

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    onSeek(secAt(e.clientX));
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const sec = secAt(e.clientX);
    if (e.pointerType === 'mouse') setHover(sec);
    if (dragging.current) onSeek(sec);
  }
  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 30 : 5;
    const map: Record<string, number> = {
      ArrowLeft: time - step,
      ArrowDown: time - step,
      ArrowRight: time + step,
      ArrowUp: time + step,
      PageDown: time - 60,
      PageUp: time + 60,
      Home: clipStart,
      End: clipEnd,
    };
    if (e.key in map) {
      e.preventDefault();
      onSeek(Math.min(duration, Math.max(0, map[e.key])));
    }
  }

  const inClip = time >= clipStart && time < clipEnd;
  const clipFill = Math.min(Math.max(time, clipStart), clipEnd);

  return (
    <div className="relative select-none pt-7">
      {/* Clip-end flag above the track */}
      <div className="pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-teal" style={{ left: pct(clipEnd) }}>
        clip ends {formatTime(clipEnd)}
      </div>

      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="Lecture position"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(time)}
        aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}${inClip ? ', inside the clip' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKeyDown}
        className="group relative flex h-8 cursor-pointer touch-none items-center rounded-md"
      >
        <div className="relative h-2 w-full rounded-full bg-line">
          {marks.map((m) => (
            <span key={m} aria-hidden="true" className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-line-strong" style={{ left: pct(m) }} />
          ))}
          <div aria-hidden="true" className="absolute -top-1 bottom-[-4px] rounded bg-teal-soft" style={{ left: pct(clipStart), width: pct(clipEnd - clipStart) }} />
          <div aria-hidden="true" className="absolute inset-y-0 rounded-full bg-teal" style={{ left: pct(clipStart), width: pct(clipFill - clipStart) }} />
          <span aria-hidden="true" className="absolute -top-2.5 bottom-[-10px] w-[3px] -translate-x-1/2 rounded bg-teal" style={{ left: pct(clipEnd) }} />
          <span
            aria-hidden="true"
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-ink shadow transition-transform group-hover:scale-110"
            style={{ left: pct(time) }}
          />
        </div>

        {hover !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white"
            style={{ left: `clamp(4rem, ${pct(hover)}, calc(100% - 4rem))` }}
          >
            {formatTime(hover)} · {describe(hover)}
          </div>
        )}
      </div>
    </div>
  );
}
