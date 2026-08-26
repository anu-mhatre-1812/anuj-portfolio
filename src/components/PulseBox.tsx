import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function PulseBox({ className = '', children }: { className?: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const tween = gsap.to(el, {
      opacity: 0.45,
      repeat: -1,
      yoyo: true,
      duration: 0.6,
      ease: 'sine.inOut',
    });
    return () => {
      tween.kill();
    };
  }, [reduced]);

  return (
    <div ref={ref} className={`card-base bg-ink/5 ${className}`}>
      {children}
    </div>
  );
}
