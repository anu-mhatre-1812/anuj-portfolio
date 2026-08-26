import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

function render(p: number, text: string): string {
  const resolved = Math.floor(p * text.length);
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (i < resolved || ch === ' ') out += ch;
    else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
}

export default function DecodeText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.textContent = text;
      return;
    }

    const ctx = gsap.context(() => {
      const proxy = { p: 0 };
      el.textContent = render(0, text);
      gsap.to(proxy, {
        p: 1,
        duration: 1.15,
        ease: 'none',
        onUpdate: () => {
          el.textContent = render(proxy.p, text);
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [text, reduced]);

  return (
    <span ref={ref} aria-label={text} className={className}>
      {text}
    </span>
  );
}
