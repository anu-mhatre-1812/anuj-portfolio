import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function DataBuddy() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        x: -70,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute bottom-8 left-8 hidden w-48 lg:block xl:w-56"
    >
      <img
        src="/anuj-character.png"
        alt=""
        className="h-auto w-full drop-shadow-[5px_5px_0_rgba(23,21,18,0.12)]"
      />
    </div>
  );
}
