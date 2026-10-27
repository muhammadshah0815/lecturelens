import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Lecture, Moment } from '../../data/types';
import { buildCues, cueAt } from '../../lib/captions';
import { slideAt } from '../../lib/lecture';
import { formatTime } from '../../lib/time';
import { BackTenIcon, PauseIcon, PlayIcon, ReplayIcon } from '../icons';
import { ScaledStage } from '../slides/ScaledStage';
import { SlideView } from '../slides/SlideView';
import { Instructor } from './Instructor';
import { Scrubber } from './Scrubber';
import { claimPlayback, releasePlayback } from './playback';

export interface PlayerHandle {
  lectureId: string;
  /** Jump to a time; optionally start playing and bring the player into view. */
  seek: (sec: number, opts?: { play?: boolean; reveal?: boolean }) => void;
  /** Current playhead position. */
  getTime: () => number;
}

interface Props {
  lecture: Lecture;
  moment: Moment;
  /** Where to cue the player; defaults to the start of the moment. */
  initialSec?: number;
  /** Fired the first time the student presses play (success signal). */
  onFirstPlay?: () => void;
}

const RATES = [1, 1.5, 2];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const LecturePlayer = forwardRef<PlayerHandle, Props>(function LecturePlayer({ lecture, moment, initialSec, onFirstPlay }, ref) {
  const { startSec, endSec } = moment;
  const duration = lecture.durationSec;
  const cueSec = clamp(initialSec ?? startSec, 0, duration);

  const [time, setTime] = useState(cueSec);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [clipEnded, setClipEnded] = useState(false);
  const [rate, setRate] = useState(1);
  const [captions, setCaptions] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(cueSec);
  const rateRef = useRef(1);
  /** While true, playback stops when it reaches the end of the clip. */
  const stopAtClipEnd = useRef(cueSec < endSec);
  const firstPlayReported = useRef(false);

  const cues = useMemo(() => buildCues(lecture.transcript), [lecture]);
  const cue = cueAt(cues, time);
  const slide = slideAt(lecture, time);
  const marks = useMemo(() => lecture.slides.map((s) => s.startSec).filter((s) => s > 0), [lecture]);

  const pause = useCallback(() => setPlaying(false), []);

  const seek = useCallback(
    (sec: number) => {
      const s = clamp(sec, 0, duration);
      timeRef.current = s;
      stopAtClipEnd.current = s < endSec;
      setTime(s);
      setClipEnded(false);
    },
    [duration, endSec],
  );

  const play = useCallback(() => {
    if (timeRef.current >= duration) seek(startSec);
    claimPlayback(pause);
    setStarted(true);
    setClipEnded(false);
    setPlaying(true);
    if (!firstPlayReported.current) {
      firstPlayReported.current = true;
      onFirstPlay?.();
    }
  }, [duration, onFirstPlay, pause, seek, startSec]);

  const toggle = () => (playing ? pause() : play());

  useImperativeHandle(
    ref,
    () => ({
      lectureId: lecture.id,
      seek: (sec, opts) => {
        seek(sec);
        if (opts?.play) play();
        if (opts?.reveal) {
          rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          rootRef.current?.focus({ preventScroll: true });
        }
      },
      getTime: () => timeRef.current,
    }),
    [lecture.id, play, seek],
  );

  // Playback clock: advances in real time, re-renders ~4×/second.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (Math.min(now - last, 250) / 1000) * rateRef.current;
      last = now;
      const prev = timeRef.current;
      let next = prev + dt;
      let stop = false;
      if (stopAtClipEnd.current && next >= endSec) {
        next = endSec;
        stopAtClipEnd.current = false;
        setClipEnded(true);
        stop = true;
      }
      if (next >= duration) {
        next = duration;
        stop = true;
      }
      timeRef.current = next;
      if (stop || Math.floor(next * 4) !== Math.floor(prev * 4)) setTime(next);
      if (stop) setPlaying(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, endSec, duration]);

  useEffect(() => () => releasePlayback(pause), [pause]);

  function cycleRate() {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    rateRef.current = next;
    setRate(next);
  }

  const clipLeft = endSec - time;
  const clipStatus =
    time < startSec ? 'Before the clip' : time < endSec ? `${formatTime(clipLeft)} left in clip` : 'Past the end of the clip';

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      aria-label={`Lecture player: Week ${lecture.week}, ${lecture.title}`}
      role="region"
      className="overflow-hidden rounded-2xl border border-line bg-surface focus:outline-none"
    >
      {/* Stage */}
      <div className="relative bg-sunken">
        <ScaledStage>
          <SlideView slide={slide} weekLabel={`Week ${lecture.week}`} />
          <Instructor speaking={playing} />
        </ScaledStage>

        {/* Clicking the stage toggles playback; the real control is the Play button below. */}
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={toggle} className="absolute inset-0 cursor-pointer focus:outline-none" />

        {!started && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/25">
            <span className="flex items-center gap-3 rounded-full bg-surface/95 py-2 pl-2 pr-5 font-semibold text-ink shadow-lift">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-teal text-white">
                <PlayIcon size={20} />
              </span>
              Play from {formatTime(cueSec)}
            </span>
          </div>
        )}

        {clipEnded && (
          <div className="absolute inset-0 grid place-items-center bg-ink/55 p-4" role="status">
            <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl bg-surface p-5 text-center shadow-lift">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-teal">End of clip · {formatTime(endSec)}</p>
              <p className="text-ink">That’s the part of the lecture that answers your question.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" className="btn-primary min-h-[2.75rem] px-4" onClick={() => { seek(startSec); play(); }}>
                  <ReplayIcon size={18} /> Replay clip
                </button>
                <button type="button" className="chip" onClick={play}>
                  Keep watching
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live captions */}
      {captions && (
        <div className="flex min-h-[4.5rem] items-center bg-ink px-5 py-3 text-lg leading-snug text-white" aria-live="off">
          <p>{cue?.text ?? ' '}</p>
        </div>
      )}

      {/* Controls */}
      <div className="px-4 pb-3 sm:px-5">
        <Scrubber
          duration={duration}
          time={time}
          clipStart={startSec}
          clipEnd={endSec}
          marks={marks}
          describe={(sec) => slideAt(lecture, sec).title}
          onSeek={seek}
        />
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause' : started ? 'Play' : `Play from ${formatTime(time)}`}
            className="grid h-12 w-12 place-items-center rounded-full bg-teal text-white transition-colors hover:bg-teal-strong"
          >
            {playing ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
          </button>
          <button
            type="button"
            onClick={() => seek(timeRef.current - 10)}
            aria-label="Back 10 seconds"
            className="grid h-11 w-11 place-items-center rounded-full text-ink-soft hover:bg-sunken hover:text-ink"
          >
            <BackTenIcon size={22} />
          </button>
          <p className="font-medium tabular-nums text-ink">
            {formatTime(time)} <span className="text-ink-muted">/ {formatTime(duration)}</span>
          </p>
          <p className={`text-sm ${time >= startSec && time < endSec ? 'text-teal' : 'text-ink-muted'}`}>{clipStatus}</p>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={cycleRate}
              aria-label={`Playback speed ${rate}×`}
              className="h-10 min-w-[3.25rem] rounded-lg px-2 text-sm font-semibold tabular-nums text-ink-soft hover:bg-sunken hover:text-ink"
            >
              {rate}×
            </button>
            <button
              type="button"
              onClick={() => setCaptions((c) => !c)}
              aria-pressed={captions}
              aria-label="Captions"
              className={`h-10 rounded-lg px-2.5 text-sm font-bold ${captions ? 'bg-ink text-white' : 'text-ink-soft hover:bg-sunken'}`}
            >
              CC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
