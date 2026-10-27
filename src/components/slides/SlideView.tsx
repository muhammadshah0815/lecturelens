import { memo } from 'react';
import type { Slide, SlideBlock } from '../../data/types';
import { Figure } from './Figure';

// Renders a slide at the fixed 960×540 stage size (see ScaledStage).

function Block({ block }: { block: SlideBlock }) {
  switch (block.type) {
    case 'text':
      return <p className="text-[24px] leading-snug text-ink-soft">{block.text}</p>;
    case 'bullets':
      return (
        <ul className="space-y-2.5 text-[24px] leading-snug text-ink">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-[11px] h-2.5 w-2.5 shrink-0 rounded-full bg-teal" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'equation':
      return (
        <div className="rounded-2xl bg-teal-tint px-6 py-4">
          <p className="font-serif text-[34px] font-medium tracking-wide text-ink">{block.math}</p>
          {block.label && <p className="mt-1 text-[18px] text-ink-muted">{block.label}</p>}
        </div>
      );
    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((step, i) => (
            <li key={step.label} className="grid grid-cols-[210px_1fr] items-baseline gap-4 rounded-xl border border-line bg-surface px-5 py-3">
              <span className="text-[18px] font-semibold text-ink-muted">
                {i + 1}. {step.label}
              </span>
              <span className="font-serif text-[28px] text-ink">{step.math}</span>
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <figure>
          <table className="w-full border-collapse text-left text-[20px]">
            <thead>
              <tr className="border-b-2 border-ink/70">
                {block.headers.map((h, i) => (
                  <th key={i} className="py-2 pr-4 font-semibold text-ink">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-line">
                  {row.map((cell, c) => (
                    <td key={c} className={`py-2 pr-4 tabular-nums ${c === 0 ? 'text-ink-soft' : 'text-ink'}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && <figcaption className="mt-2 text-[16px] text-ink-muted">{block.caption}</figcaption>}
        </figure>
      );
    case 'callout':
      return (
        <p
          className={`rounded-xl border-l-[6px] px-5 py-3 text-[21px] leading-snug ${
            block.tone === 'warn' ? 'border-amber bg-amber-soft text-ink' : 'border-teal bg-teal-tint text-ink'
          }`}
        >
          {block.text}
        </p>
      );
    case 'figure':
      return (
        <figure>
          <Figure id={block.figure} />
          {block.caption && <figcaption className="mt-1 text-center text-[16px] text-ink-muted">{block.caption}</figcaption>}
        </figure>
      );
  }
}

export const SlideView = memo(function SlideView({ slide, weekLabel }: { slide: Slide; weekLabel?: string }) {
  const split = slide.layout === 'split';
  const main = split ? slide.blocks.filter((b) => b.type !== 'figure') : slide.blocks;
  const side = split ? slide.blocks.filter((b) => b.type === 'figure') : [];

  return (
    <div className="flex h-full w-full flex-col bg-[#FCFBF8] px-14 pb-10 pt-11 font-sans text-ink">
      <div className="mb-6 flex items-baseline justify-between gap-6">
        <h3 className="text-[38px] font-bold leading-tight tracking-tight">{slide.title}</h3>
        <span className="shrink-0 text-[16px] font-medium text-ink-muted">
          {weekLabel ? `${weekLabel} · ` : ''}
          {slide.number}
        </span>
      </div>
      <div className={split ? 'grid flex-1 grid-cols-[1fr_400px] items-start gap-8' : 'flex flex-1 flex-col gap-5'}>
        <div className="flex flex-col gap-5">
          {main.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </div>
        {split && (
          <div className="flex flex-col gap-4">
            {side.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>
        )}
      </div>
      <div aria-hidden="true" className="mt-auto h-1 w-16 rounded-full bg-teal" />
    </div>
  );
});
