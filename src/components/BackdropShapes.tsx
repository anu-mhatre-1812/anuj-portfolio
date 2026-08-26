import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function BackdropShapes() {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      [aRef.current, bRef.current].forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          y: i === 0 ? -80 : -120,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={aRef}
        className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky opacity-50 blur-3xl"
      />
      <div
        ref={bRef}
        className="absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-yolk opacity-40 blur-3xl"
      />
      <svg className="absolute bottom-10 left-1/3 h-40 w-40 opacity-[0.12]" aria-hidden>
        <defs>
          <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#171512" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}
