import { notes } from '../data/notes';
import type { SourceRef } from '../data/types';
import { getLecture } from './lecture';
import { formatTime } from './time';

/** Short chip label: "Slide 5", "18:40", "My note", "Reading". */
export function sourceLabel(src: SourceRef): string {
  switch (src.kind) {
    case 'slide': {
      const slide = getLecture(src.lectureId)?.slides.find((s) => s.id === src.slideId);
      return `Slide ${slide?.number ?? '?'}`;
    }
    case 'transcript':
      return formatTime(src.atSec);
    case 'note':
      return 'My note';
    case 'reading':
      return 'Reading';
  }
}

/** Longer description for screen readers and tooltips. */
export function sourceDescription(src: SourceRef): string {
  switch (src.kind) {
    case 'slide': {
      const lecture = getLecture(src.lectureId);
      const slide = lecture?.slides.find((s) => s.id === src.slideId);
      return `Week ${lecture?.week} slide ${slide?.number}: ${slide?.title}`;
    }
    case 'transcript': {
      const lecture = getLecture(src.lectureId);
      return `Week ${lecture?.week} transcript at ${formatTime(src.atSec)}`;
    }
    case 'note':
      return `Your note: ${notes.find((n) => n.id === src.noteId)?.title ?? ''}`;
    case 'reading':
      return 'Course reading';
  }
}

export const sameSource = (a: SourceRef, b: SourceRef) => JSON.stringify(a) === JSON.stringify(b);
