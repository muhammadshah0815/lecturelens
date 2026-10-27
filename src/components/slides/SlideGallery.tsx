import { week6 } from '../../data/week6';
import { ScaledStage } from './ScaledStage';
import { SlideView } from './SlideView';

/** Dev-only content review: every Week 6 slide at once (open with ?slides). */
export function SlideGallery() {
  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-6 md:grid-cols-2">
      {week6.slides.map((s) => (
        <ScaledStage key={s.id} className="rounded-xl border border-line shadow-card">
          <SlideView slide={s} weekLabel="Week 6" />
        </ScaledStage>
      ))}
    </main>
  );
}
