import { createContext, useContext } from 'react';
import type { SourceRef } from '../data/types';
import type { PlayerHandle } from '../components/player/LecturePlayer';

/** Opens the evidence drawer. `turnId` is the answer the source belongs to, so the drawer can drive its player. */
export interface EvidenceApi {
  openSource: (source: SourceRef, turnId: string) => void;
  registerPlayer: (turnId: string, handle: PlayerHandle | null) => void;
}

export const EvidenceContext = createContext<EvidenceApi | null>(null);

export function useEvidence() {
  const api = useContext(EvidenceContext);
  if (!api) throw new Error('useEvidence must be used inside EvidenceContext');
  return api;
}
