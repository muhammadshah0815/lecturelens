// Only one lecture player plays at a time: starting one pauses the previous.
let activePause: (() => void) | null = null;

export function claimPlayback(pause: () => void) {
  if (activePause && activePause !== pause) activePause();
  activePause = pause;
}

export function releasePlayback(pause: () => void) {
  if (activePause === pause) activePause = null;
}
