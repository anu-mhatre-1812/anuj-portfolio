import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;

    const dot = dotRef.current!;
    const label = labelRef.current!;
    document.documentElement.classList.add('cursor-none-all');
    gsap.set(dot, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3' });
    const yTo = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3' });

    let shown = false;
    let current: Element | null = null;

    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to(dot, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' });
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const t = (e.target as Element).closest?.('.cursor-hover');
      if (t && t !== current) {
        current = t;
        label.textContent = t.getAttribute('data-cursor-label') ?? '';
        gsap.to(dot, {
          width: 44,
          height: 44,
          backgroundColor: '#171512',
          borderColor: '#171512',
          duration: 0.25,
          ease: 'power3.out',
        });
        gsap.to(label, { opacity: 1, duration: 0.2 });
      }
    };

    const out = (e: MouseEvent) => {
      const from = (e.target as Element).closest?.('.cursor-hover');
      const to =
        e.relatedTarget instanceof Element ? e.relatedTarget.closest('.cursor-hover') : null;
      if (from && !to) {
        current = null;
        gsap.to(dot, {
          width: 12,
          height: 12,
          backgroundColor: '#FAF5E9',
          borderColor: '#171512',
          duration: 0.25,
          ease: 'power3.out',
        });
        gsap.to(label, { opacity: 0, duration: 0.15 });
      }
    };

    const down = () => gsap.to(dot, { scale: 0.85, duration: 0.1, ease: 'power2.in' });
    const up = () => gsap.to(dot, { scale: 1, duration: 0.2, ease: 'back.out(2)' });

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mouseout', out);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mouseout', out);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      document.documentElement.classList.remove('cursor-none-all');
      gsap.killTweensOf(dot);
      gsap.killTweensOf(label);
    };
  }, [reduced]);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex h-3 w-3 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-ink bg-cream opacity-0 scale-50"
    >
      <span
        ref={labelRef}
        className="select-none whitespace-nowrap font-mono text-[9px] font-medium uppercase tracking-widest text-cream opacity-0"
      />
    </div>
  );
}
