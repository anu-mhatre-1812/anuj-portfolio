import { useLayoutEffect, useRef } from 'react';
import { Github, Instagram, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { SOCIALS } from '../lib/theme';
import MaskedSocial from '../components/MaskedSocial';
import DecodeText from '../components/DecodeText';
import SplitHeading from '../components/SplitHeading';
import Typewriter from '../components/Typewriter';
import BackdropShapes from '../components/BackdropShapes';
import GhostWord from '../components/GhostWord';
import GhostLogo from '../components/GhostLogo';

const ICONS = [Github, Linkedin, Instagram, XIcon, Mail, MessageCircle];

function XIcon({ size = 19 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

export default function ContactSection() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cl-line-ink',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.45,
          ease: 'power3.out',
          transformOrigin: 'left center',
          scrollTrigger: {
            trigger: '.cl-line-ink',
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        }
      );
      gsap.fromTo(
        '.cl-line-saffron',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.45,
          ease: 'power3.out',
          delay: 0.12,
          transformOrigin: 'right center',
          scrollTrigger: {
            trigger: '.cl-line-ink',
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.to('.decode-hint', {
        opacity: 0.25,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: 'sine.inOut',
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="contact" ref={rootRef} className="relative overflow-hidden py-24 md:py-32">
      <BackdropShapes />
      <GhostLogo className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute left-[3vw] bottom-[4vw]">
        <GhostWord text="hello" speed="1" />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">~/contact</p>
        <h2 aria-label="$ ping anuj" className="mt-2">
          <DecodeText
            text="$ ping anuj"
            className="font-display text-4xl font-bold tracking-tight md:text-6xl"
          />
        </h2>
        <div className="mt-4" aria-hidden>
          <div
            className="cl-line-ink h-[3px] w-full max-w-md bg-ink"
            style={reduced ? undefined : { transform: 'scaleX(0)' }}
          />
          <div
            className="cl-line-saffron -mt-[3px] ml-auto h-[3px] w-[42%] bg-saffron"
            style={reduced ? undefined : { transform: 'scaleX(0)' }}
          />
        </div>

        <SplitHeading
          as="p"
          text="No forms — just direct channels. Fastest replies on Discord or email. Recruiters, builders and curious people all welcome."
          className="mt-6 block max-w-xl text-sm text-ink/70 md:text-base"
        />

        {!reduced && (
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
            $ six channels masked — hover to decode{' '}
            <span className="decode-hint inline-block">▓▓</span>
          </p>
        )}

        <div className="social-grid mt-6 grid gap-5 sm:grid-cols-2">
          {SOCIALS.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <MaskedSocial
                key={s.label}
                label={s.label}
                href={s.href}
                handle={s.handle}
                icon={<Icon size={19} strokeWidth={2} />}
                index={i}
              />
            );
          })}
        </div>

        <p className="mt-14 text-center">
          <Typewriter
            text="$ exit 0 — thanks for scrolling this far."
            className="font-mono text-xs text-ink/50"
          />
        </p>
      </div>
    </section>
  );
}
