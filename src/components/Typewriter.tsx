import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Typewriter({
  text,
  className = '',
  speed = 0.028,
  caret = true,
}: {
  text: string;
  className?: string;
  speed?: number;
  caret?: boolean;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      gsap.to('.tw-ch', {
        opacity: 1,
        duration: 0.01,
        ease: 'none',
        stagger: speed,
        scrollTrigger: {
          trigger: root,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
      if (caret) {
        gsap.to('.tw-caret', {
          opacity: 0,
          repeat: -1,
          yoyo: true,
          duration: 0.55,
          ease: 'sine.inOut',
          delay: text.length * speed,
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [text, reduced, speed, caret]);

  return (
    <span ref={rootRef} className={className}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="tw-ch"
          style={reduced ? undefined : { opacity: 0 }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
      {caret && (
        <span
          className="tw-caret ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-saffron"
          aria-hidden
        />
      )}
    </span>
  );
}
