import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { gsap, SplitText } from '../lib/gsap';
import { ACCENTS } from '../lib/theme';
import { INTRO_REVEAL_EVENT } from '../lib/intro';
import { useReducedMotion } from '../hooks/useReducedMotion';

const WORDS = ['ANUJ', 'MHATRE'];

export default function HeroName() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let began = false;
    const cleanups: Array<() => void> = [];

    const begin = () => {
      if (began || cancelled || !rootRef.current) return;
      began = true;

      document.fonts.ready.then(() => {
        if (cancelled || !began || !rootRef.current) return;

      const ctx = gsap.context(() => {
        const wordEls = Array.from(rootRef.current!.querySelectorAll<HTMLElement>('.hn-word'));
        const splits = wordEls.map((w) =>
          SplitText.create(w, { type: 'chars', mask: 'chars', charsClass: 'hn-char' })
        );
        const chars = splits.flatMap((s) => s.chars);
        chars.forEach((c, i) => c.setAttribute('data-index', String(i)));

        const tl = gsap.timeline({ delay: 0.15 });
        tl.from(
          chars,
          {
            yPercent: 118,
            rotation: (i: number) => (i % 2 === 0 ? -5 : 5),
            duration: 0.85,
            ease: 'am-signature',
            stagger: { each: 0.038, from: 'start' },
          },
          0
        );
        tl.to(
          chars,
          {
            color: (i: number) => ACCENTS[i % ACCENTS.length],
            duration: 0.16,
            stagger: { each: 0.045 },
            yoyo: true,
            repeat: 1,
          },
          '-=0.38'
        );
        tl.from('.hn-line-ink', { scaleX: 0, duration: 0.45, ease: 'power3.out' }, '-=0.15');
        tl.from('.hn-line-saffron', { scaleX: 0, duration: 0.45, ease: 'power3.out' }, '-=0.32');

        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          const lifts = chars.map((c) =>
            gsap.quickTo(c, 'y', { duration: 0.55, ease: 'power3' })
          );
          const RADIUS = 150;
          const onMove = (e: MouseEvent) => {
            chars.forEach((c, i) => {
              const r = c.getBoundingClientRect();
              const dx = e.clientX - (r.left + r.width / 2);
              const dy = e.clientY - (r.top + r.height / 2);
              const dist = Math.hypot(dx, dy);
              lifts[i](dist < RADIUS ? -(1 - dist / RADIUS) * 36 : 0);
            });
          };
          window.addEventListener('mousemove', onMove);
          cleanups.push(() => window.removeEventListener('mousemove', onMove));
        }

        const mid = Math.ceil(chars.length / 2);
        gsap.to(chars.slice(0, mid), {
          xPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
        gsap.to(chars.slice(mid), {
          xPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }, rootRef);

      cleanups.push(() => ctx.revert());
    });
  };

  window.addEventListener(INTRO_REVEAL_EVENT, begin, { once: true });
  const fallback = setTimeout(begin, 4000);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      window.removeEventListener(INTRO_REVEAL_EVENT, begin);
      cleanups.forEach((fn) => fn());
    };
  }, [reduced]);

  const lastCharRef = useRef<Element | null>(null);

  const flicker = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const target = (e.target as HTMLElement).closest?.('.hn-char');
    if (!target || target === lastCharRef.current) return;
    lastCharRef.current = target;
    const idx = Number(target.getAttribute('data-index') ?? 0) || 0;
    gsap.fromTo(
      target,
      { rotation: gsap.utils.random(-9, 9), color: ACCENTS[idx % ACCENTS.length] },
      { rotation: 0, color: '#171512', duration: 0.55, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' }
    );
  };

  return (
    <div ref={rootRef} className="relative" onMouseOver={flicker}>
      <h1 aria-label="Anuj Mhatre" className="flex flex-wrap items-baseline gap-x-[0.24em] font-display font-bold leading-[0.95] tracking-tight">
        {WORDS.map((word) => (
          <span key={word} className="hn-word text-[17vw] sm:text-[14vw] lg:text-[8.5rem]">
            {word}
          </span>
        ))}
      </h1>

      <div className="mt-4">
        <div
          className="hn-line-ink h-[3px] w-full bg-ink"
          style={reduced ? undefined : { transform: 'scaleX(0)', transformOrigin: 'left center' }}
        />
        <div
          className="hn-line-saffron -mt-[3px] ml-auto h-[3px] w-[58%] bg-saffron"
          style={reduced ? undefined : { transform: 'scaleX(0)', transformOrigin: 'right center' }}
        />
      </div>
    </div>
  );
}
