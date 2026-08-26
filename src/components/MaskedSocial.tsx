import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from '../lib/gsap';
import { accentFor } from '../lib/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import SocialCard from './SocialCard';

export default function MaskedSocial({
  label,
  href,
  handle,
  icon,
  index,
}: {
  label: string;
  href: string;
  handle: string;
  icon: ReactNode;
  index: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const reduced = useReducedMotion();

  const fine =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const interactive = fine && !reduced;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !interactive) return;

    const card = root.querySelector<HTMLElement>('.social-card');
    if (!card) return;

    gsap.set(card, { yPercent: 130, rotation: 2, autoAlpha: 0, pointerEvents: 'none' });

    const tl = gsap.timeline({
      paused: true,
      onReverseComplete: () => gsap.set(card, { autoAlpha: 0, pointerEvents: 'none' }),
    });
    tl.set(card, { pointerEvents: 'auto', autoAlpha: 1 }, 0);
    tl.to(
      card,
      { yPercent: 0, rotation: 0, duration: 0.55, ease: 'power3.out' },
      0
    );
    tl.fromTo(
      card,
      { boxShadow: `0px 0px 0px ${accentFor(index)}` },
      { boxShadow: `5px 5px 0px ${accentFor(index)}`, duration: 0.35, ease: 'power2.out' },
      '-=0.28'
    );
    tl.fromTo(
      root.querySelector('.social-icon'),
      { scale: 0, rotation: -45 },
      { scale: 1, rotation: 0, duration: 0.42, ease: 'back.out(2)' },
      '-=0.46'
    );

    tlRef.current = tl;
    return () => {
      tl.kill();
      gsap.set(card, { clearProps: 'all' });
    };
  }, [index, interactive]);

  if (!interactive) {
    return <SocialCard label={label} href={href} handle={handle} icon={icon} index={index} />;
  }

  return (
    <div
      ref={rootRef}
      className="cursor-hover relative -m-1.5 overflow-hidden rounded-[18px] p-1.5"
      data-cursor-label="decode"
      onMouseEnter={() => tlRef.current?.play()}
      onMouseLeave={() => tlRef.current?.reverse()}
      onFocus={() => tlRef.current?.play()}
      onBlur={() => tlRef.current?.reverse()}
    >
      <SocialCard label={label} href={href} handle={handle} icon={icon} index={index} />
    </div>
  );
}
