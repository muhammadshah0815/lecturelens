import { week4, week7 } from '../data/otherWeeks';
import { week6 } from '../data/week6';
import type { Lecture, Seconds, Slide, TranscriptSegment } from '../data/types';

/** Lectures with playable content: Week 6 in full, Weeks 4 and 7 as excerpts. Other weeks only exist in the course map. */
const lectures: Record<string, Lecture> = { w4: week4, w6: week6, w7: week7 };

export const getLecture = (id: string): Lecture | undefined => lectures[id];

export function slideAt(lecture: Lecture, sec: Seconds): Slide {
  let current = lecture.slides[0];
  for (const s of lecture.slides) {
    if (s.startSec <= sec) current = s;
    else break;
  }
  return current;
}

export const slideById = (lecture: Lecture, id: string) => lecture.slides.find((s) => s.id === id);

/** Time range a slide is on screen. */
export function slideRange(lecture: Lecture, slide: Slide): [Seconds, Seconds] {
  const i = lecture.slides.indexOf(slide);
  const next = lecture.slides[i + 1];
  return [slide.startSec, next ? next.startSec : lecture.durationSec];
}

export function segmentIndexAt(lecture: Lecture, sec: Seconds): number {
  const i = lecture.transcript.findIndex((seg) => sec >= seg.startSec && sec < seg.endSec);
  return i === -1 ? lecture.transcript.length - 1 : i;
}

export function segmentsForSlide(lecture: Lecture, slideId: string): TranscriptSegment[] {
  return lecture.transcript.filter((seg) => seg.slideId === slideId);
}
