import { useCallback, useRef } from 'react';
import { useEvidence } from '../../lib/evidence';
import type { PlayerHandle } from '../player/LecturePlayer';

/** Ref for an answer's player: registers it for the evidence drawer and keeps a local handle. */
export function usePlayer(turnId: string) {
  const { registerPlayer } = useEvidence();
  const handle = useRef<PlayerHandle | null>(null);
  // Callback ref: React passes null on unmount, which unregisters the player.
  const setPlayer = useCallback(
    (h: PlayerHandle | null) => {
      handle.current = h;
      registerPlayer(turnId, h);
    },
    [registerPlayer, turnId],
  );
  return [setPlayer, handle] as const;
}
