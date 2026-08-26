import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const tween = gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-[3px]">
      <div
        ref={ref}
        className="h-full w-full origin-left bg-saffron"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
