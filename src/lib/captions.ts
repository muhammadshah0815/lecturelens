import type { Seconds, TranscriptSegment } from '../data/types';

export interface Cue {
  start: Seconds;
  end: Seconds;
  text: string;
}

const MAX_CUE_CHARS = 90;

/** Split a segment into short caption cues, timed in proportion to their length. */
function cuesForSegment(seg: TranscriptSegment): Cue[] {
  const sentences = seg.text.match(/[^.!?]+[.!?]+["”’]?\s*|[^.!?]+$/g) ?? [seg.text];
  const chunks: string[] = [];
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (sentence.length <= MAX_CUE_CHARS) {
      chunks.push(sentence);
      continue;
    }
    // Long sentence: break at commas, then pack words up to the limit.
    let line = '';
    for (const word of sentence.split(' ')) {
      if (line && (line + ' ' + word).length > MAX_CUE_CHARS) {
        chunks.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    if (line) chunks.push(line);
  }

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const span = seg.endSec - seg.startSec;
  let cursor = seg.startSec;
  return chunks.map((text, i) => {
    const end = i === chunks.length - 1 ? seg.endSec : cursor + (span * text.length) / total;
    const cue = { start: cursor, end, text };
    cursor = end;
    return cue;
  });
}

export function buildCues(transcript: TranscriptSegment[]): Cue[] {
  return transcript.flatMap(cuesForSegment);
}

/** Binary search for the cue showing at `sec`. */
export function cueAt(cues: Cue[], sec: Seconds): Cue | undefined {
  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sec < cues[mid].start) hi = mid - 1;
    else if (sec >= cues[mid].end) lo = mid + 1;
    else return cues[mid];
  }
  return undefined;
}
