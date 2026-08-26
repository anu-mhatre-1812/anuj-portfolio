import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Marquee({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;
    const tween = gsap.to(track, {
      xPercent: -50,
      repeat: -1,
      duration: 26,
      ease: 'none',
    });
    return () => {
      tween.kill();
    };
  }, [reduced]);

  const row = [...items, ...items];

  return (
    <div aria-hidden className="overflow-hidden border-y-[1.5px] border-ink bg-yolk py-2.5">
      <div ref={trackRef} className="flex w-max whitespace-nowrap">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {row.map((item, i) => (
              <span
                key={`${half}-${i}`}
                className="mx-6 flex items-center gap-6 font-display text-lg font-bold uppercase tracking-tight text-ink"
              >
                {item} <span className="text-coral">▸</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
