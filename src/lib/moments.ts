import type { Moment } from '../data/types';

/** Moments are compared by position, since stored copies aren't the same objects. */
export const momentKey = (m: Moment) => `${m.lectureId}@${m.startSec}`;
export const sameMoment = (a: Moment, b: Moment) => momentKey(a) === momentKey(b);
