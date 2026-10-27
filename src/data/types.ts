// LectureLens data model. All course content is static, typed data; the
// "Campus AI" is a scripted engine that reads these structures.

/** Seconds from the start of a lecture recording. */
export type Seconds = number;

// ---------------------------------------------------------------- Course

export interface Course {
  id: string;
  code: string;
  title: string;
  term: string;
  instructor: string;
  institution: string;
  lectures: LectureSummary[];
}

/** Lightweight lecture info: enough to name and link a week. */
export interface LectureSummary {
  id: string;
  week: number;
  title: string;
  durationSec: Seconds;
  summary: string;
  /** Lower-case topic phrases this week covers; used for cross-week redirects. */
  topics: string[];
}

/** A lecture with full playable content (slides + transcript). */
export interface Lecture extends LectureSummary {
  slides: Slide[];
  transcript: TranscriptSegment[];
  readings: Reading[];
}

// ---------------------------------------------------------------- Slides

/** Slides render as HTML inside the simulated player, so content is structured.
 *  Math is plain Unicode text (no TeX renderer needed). */
export type SlideBlock =
  | { type: 'text'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'equation'; math: string; label?: string }
  | { type: 'steps'; items: { label: string; math: string }[] }
  | { type: 'table'; headers: string[]; rows: string[][]; caption?: string }
  | { type: 'callout'; tone: 'info' | 'warn'; text: string }
  | { type: 'figure'; figure: FigureId; caption?: string };

/** Hand-drawn SVG figures the player knows how to render. */
export type FigureId = 'interest-stack' | 'growth-curves' | 'two-savers' | 'debt-growth' | 'buying-power';

export interface Slide {
  id: string;
  lectureId: string;
  /** Number shown to students, e.g. "Slide 5". */
  number: number;
  title: string;
  /** When this slide appears in the recording. */
  startSec: Seconds;
  /** 'split' puts figure blocks in a right-hand column. */
  layout?: 'stack' | 'split';
  blocks: SlideBlock[];
}

// ---------------------------------------------------------------- Transcript

export interface TranscriptSegment {
  id: string;
  lectureId: string;
  startSec: Seconds;
  endSec: Seconds;
  slideId: string;
  text: string;
}

export interface Reading {
  id: string;
  title: string;
  source: string;
  pages?: string;
}

// ---------------------------------------------------------------- Notes

export interface NoteBlock {
  id: string;
  /** Optional heading line inside the note. */
  heading?: string;
  text: string;
}

export interface Note {
  id: string;
  title: string;
  lectureId: string;
  updatedAt: string; // ISO date
  blocks: NoteBlock[];
}

// ---------------------------------------------------------------- Evidence

/** Anything a recap claim can cite. Opens in the evidence drawer. */
export type SourceRef =
  | { kind: 'slide'; lectureId: string; slideId: string }
  | { kind: 'transcript'; lectureId: string; atSec: Seconds }
  | { kind: 'note'; noteId: string; blockId: string }
  | { kind: 'reading'; lectureId: string; readingId: string };

/** A playable span of a lecture. */
export interface Moment {
  lectureId: string;
  startSec: Seconds;
  endSec: Seconds;
  /** Short label for the moment, e.g. "Building the formula A = P(1 + r)^t". */
  label: string;
  /** One line on why this moment answers the question. */
  why: string;
}

export interface RecapClaim {
  text: string;
  sources: SourceRef[];
}

export type ExplainStyle = 'simpler' | 'numbers' | 'analogy';

// ---------------------------------------------------------------- Intents

interface IntentBase {
  id: string;
  /** Canonical phrasing, shown as a follow-up chip and as the matched question. */
  question: string;
  /** Weighted keywords for scoring. Weight defaults to 1. */
  keywords: (string | [keyword: string, weight: number])[];
  /** Example phrasings for fuzzy matching. */
  phrases: string[];
}

/** A question this course answers directly. */
export interface AnswerIntent extends IntentBase {
  kind: 'answer';
  bestMoment: Moment;
  /** 2–3 claims, each cited. */
  recap: RecapClaim[];
  /** Extra claim drawn from the student's note; shown only when notes are enabled. */
  noteClaim?: RecapClaim;
  alsoSee: Moment[];
  /** Intent ids offered as follow-up chips. */
  followUps: string[];
  explainDifferently: Record<ExplainStyle, RecapClaim[]>;
}

/** Covered by the course, but in another week than the one being asked about. */
export interface RedirectIntent extends IntentBase {
  kind: 'redirect';
  topic: string;
  targetWeek: number;
  moment: Moment;
  message: string;
}

/** Explicitly known to be outside this course; answered honestly, no guessing. */
export interface OutOfScopeTopic {
  id: string;
  topic: string;
  keywords: string[];
  /** Closest thing the course does cover, if any. */
  nearest?: { week: number; note: string };
}

export type Intent = AnswerIntent | RedirectIntent;

// ---------------------------------------------------------------- App state

export interface StillStuckItem {
  id: string;
  question: string;
  intentId: string | null;
  createdAt: string; // ISO date
  /** Where the player was when the student gave up, so reopening resumes there. */
  resume?: { moment: Moment; atSec: Seconds };
}

export interface Settings {
  /** Whether the Campus AI may read the student's own notes. */
  notesEnabled: boolean;
}
