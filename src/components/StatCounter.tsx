import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { accentFor } from '../lib/theme';

export default function StatCounter({
  label,
  value,
  index,
}: {
  label: string;
  value: number | null;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const accent = accentFor(index);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;

    if (value === null) {
      el.textContent = '···';
      return;
    }

    if (reduced) {
      el.textContent = value.toLocaleString('en-US');
      return;
    }

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: value,
      duration: 1.8,
      ease: 'power1.out',
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString('en-US');
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        once: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, reduced]);

  return (
    <div
      ref={cardRef}
      className="stat-card card-base p-4 md:p-5"
      style={{ boxShadow: `4px 4px 0 ${accent}` }}
    >
      <span ref={numRef} className="block font-mono text-2xl font-bold leading-none md:text-3xl">
        ···
      </span>
      <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink/60 md:text-[11px]">
        {label}
      </span>
    </div>
  );
}
