import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function SplitHeading({
  text,
  as: Tag = 'h2',
  className = '',
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) return;

    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(el, {
        type: 'words',
        mask: 'words',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.words, {
            yPercent: 110,
            opacity: 0,
            stagger: 0.045,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          });
        },
      });
    }, ref);

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [reduced, text]);

  return (
    <Tag ref={ref as never} className={className}>
      {text}
    </Tag>
  );
}
