import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '../lib/gsap';
import { ACCENTS } from '../lib/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Outro() {
  const rootRef = useRef<HTMLElement>(null);
  const l2Ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    document.fonts.ready.then(() => {
      if (cancelled || !rootRef.current) return;

      const floats: gsap.core.Tween[] = [];
      let c2: Element[] = [];

      const stopFloat = () => {
        floats.forEach((t) => t.kill());
        floats.length = 0;
      };

      const startFloat = () => {
        stopFloat();
        c2.forEach((ch) => {
          floats.push(
            gsap.to(ch, {
              y: gsap.utils.random(-6, -3),
              duration: gsap.utils.random(1.6, 2.5),
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: Math.random() * 1.4,
            })
          );
        });
      };

      const ctx = gsap.context(() => {
        const s2 = SplitText.create('.outro-l2', {
          type: 'chars',
          mask: 'chars',
          charsClass: 'oc-ch',
        });
        c2 = s2.chars;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
          onComplete: startFloat,
          onReverseComplete: stopFloat,
        });

        tl.from(
          c2,
          {
            yPercent: 125,
            rotation: (i: number) => (i % 2 === 0 ? 6 : -6),
            stagger: { each: 0.028, from: 'center' },
            duration: 0.8,
            ease: 'am-signature',
          },
          0
        );
        tl.to(
          c2,
          {
            color: (i: number) => ACCENTS[i % ACCENTS.length],
            duration: 0.16,
            stagger: { each: 0.026 },
            yoyo: true,
            repeat: 1,
          },
          '-=0.35'
        );
      }, rootRef);

      cleanups.push(() => {
        stopFloat();
        ctx.revert();
      });
    });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [reduced]);

  const wave = () => {
    if (reduced || !l2Ref.current) return;
    const chars = l2Ref.current.querySelectorAll<HTMLElement>('.oc-ch');
    if (chars.length === 0) return;
    gsap.to(chars, {
      rotation: () => gsap.utils.random(-10, 10),
      duration: 0.16,
      stagger: { each: 0.02, yoyo: true, repeat: 1 },
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-t-[1.5px] border-ink py-32 md:py-44"
    >
      <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
        <div data-speed="0.94">
          <p
            className="select-none text-left font-display text-[12vw] font-bold uppercase leading-[0.9] tracking-tight text-ink"
            style={{ WebkitTextStroke: '2px #171512' }}
          >
            Thanks for scrolling,
          </p>
        </div>

        <div ref={l2Ref} data-speed="1.06" className="mt-6 md:mt-10" onMouseEnter={wave}>
          <p
            className="outro-l2 cursor-hover whitespace-nowrap font-display text-[6vw] font-bold leading-tight tracking-tight text-saffron md:text-[3.75rem] lg:text-[4.25rem]"
            data-cursor-label="wave"
          >
            now go and build something!
          </p>
        </div>
      </div>
    </section>
  );
}
