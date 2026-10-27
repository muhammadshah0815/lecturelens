import { createContext, useContext } from 'react';

/** First-run tips. Each one disappears for good once the student has done the thing (or dismissed it). */
export type HintId = 'play' | 'source' | 'feedback';
export type HintsSeen = Record<HintId, boolean>;

export const noHintsSeen: HintsSeen = { play: false, source: false, feedback: false };

export interface HintsApi {
  /** Only the newest answer shows tips, so older turns stay clean. */
  show: (id: HintId, turnId: string) => boolean;
  done: (id: HintId) => void;
}

export const HintsContext = createContext<HintsApi>({ show: () => false, done: () => {} });
export const useHints = () => useContext(HintsContext);
