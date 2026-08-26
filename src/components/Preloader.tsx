import { useEffect, useRef, useState } from 'react';
import { gsap, SplitText } from '../lib/gsap';
import { dispatchIntroReveal } from '../lib/intro';

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const gARef = useRef<HTMLSpanElement>(null);
  const gBRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reducedMotion()) {
      dispatchIntroReveal();
      setDone(true);
      return;
    }

    document.documentElement.style.overflow = 'hidden';

    let cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left center' });

      const xA = gsap.quickTo(gARef.current, 'x', { duration: 0.6, ease: 'power3' });
      const yA = gsap.quickTo(gARef.current, 'y', { duration: 0.6, ease: 'power3' });
      const xB = gsap.quickTo(gBRef.current, 'x', { duration: 0.9, ease: 'power3' });
      const yB = gsap.quickTo(gBRef.current, 'y', { duration: 0.9, ease: 'power3' });
      const xBoot = gsap.quickTo(bootRef.current, 'x', { duration: 0.5, ease: 'power2' });

      const onMouse = (e: MouseEvent) => {
        const dx = e.clientX / window.innerWidth - 0.5;
        const dy = e.clientY / window.innerHeight - 0.5;
        xA(dx * 22);
        yA(dy * 14);
        xB(dx * 44);
        yB(dy * 28);
        xBoot(dx * -12);
      };
      window.addEventListener('mousemove', onMouse);

      const split = SplitText.create(nameRef.current, {
        type: 'chars',
        mask: 'chars',
        charsClass: 'pl-ch',
      });

      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = '';
          split.revert();
          setDone(true);
        },
      });

      tl.from(bootRef.current, { opacity: 0, y: -14, duration: 0.4, ease: 'power2.out' }, 0.1);
      tl.from(
        split.chars,
        {
          yPercent: 135,
          rotation: (i: number) => (i % 2 === 0 ? -10 : 10),
          duration: 0.75,
          ease: 'back.out(1.7)',
          stagger: { each: 0.055, from: 'start' },
        },
        0.25
      );
      tl.to(barRef.current, { scaleX: 1, duration: 1.15, ease: 'power2.inOut' }, 0.6);
      tl.to('.pl-content', { opacity: 0, y: -26, duration: 0.32, ease: 'power2.in' }, '+=0.3');
      tl.add(() => dispatchIntroReveal());
      tl.to('.pl-top', { yPercent: -101, duration: 0.95, ease: 'power4.inOut' }, '<');
      tl.to('.pl-bottom', { yPercent: 101, duration: 0.95, ease: 'power4.inOut' }, '<+=0.07');

      cleanups.push(() => {
        window.removeEventListener('mousemove', onMouse);
      });
    }, rootRef);

    return () => {
      document.documentElement.style.overflow = '';
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[300]" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-1/2 bg-ink pl-top" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-ink pl-bottom" />

      <div className="pl-content absolute inset-0 flex items-center justify-center">
        <div className="px-5 text-center">
          <p ref={bootRef} className="mb-6 font-mono text-xs text-cream/60 md:text-sm">
            $ ./init anuj-mhatre --boot
            <span className="ml-1 inline-block h-3 w-2 translate-y-[2px] animate-none bg-saffron" />
          </p>

          <h1
            ref={nameRef}
            className="font-display font-bold uppercase leading-none tracking-tight text-[13vw] md:text-[7rem]"
          >
            <span ref={gARef} className="inline-block text-cream">
              Anuj
            </span>{' '}
            <span
              ref={gBRef}
              className="inline-block"
              style={{ WebkitTextStroke: '2px #FF9933', color: 'transparent' }}
            >
              Mhatre
            </span>
          </h1>

          <div className="mx-auto mt-10 h-[3px] w-56 overflow-hidden bg-cream/15">
            <div ref={barRef} className="h-full w-full bg-saffron" />
          </div>
        </div>
      </div>
    </div>
  );
}

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
