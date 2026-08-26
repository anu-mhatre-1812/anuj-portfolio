import { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap, scrollToSection } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GithubUserStats } from '../hooks/useGithubStats';
import TerminalHero from '../components/TerminalHero';
import HeroName from '../components/HeroName';
import BackdropShapes from '../components/BackdropShapes';
import GhostLogo from '../components/GhostLogo';

const PITCH_LINES = [
  'Training models. Shipping products.',
  'Building across AI/ML, full-stack and dev tools —',
  'aiming straight for frontier AI labs.',
];export default function HeroSection({
  stats,
  loading,
}: {
  stats: GithubUserStats | null;
  loading: boolean;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from('.pitch-line', {
        y: 28,
        opacity: 0,
        stagger: 0.1,
        duration: 0.65,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.pitch-block', start: 'top 85%', toggleActions: 'play none none none' },
      });
      gsap.from('.hero-cta', {
        y: 16,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.cta-row', start: 'top 92%', toggleActions: 'play none none reverse' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="home" ref={rootRef} className="relative overflow-hidden">
      <BackdropShapes />
      <GhostLogo className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative mx-auto max-w-4xl px-5 pt-28 md:px-8 md:pt-32">
        <HeroName />

        <div className="relative mt-12 md:mt-16">
          <TerminalHero stats={stats} loading={loading} />
        </div>

        <div className="pitch-block mt-14 md:mt-20">
          {PITCH_LINES.map((line, i) => (
            <p
              key={i}
              className={`pitch-line font-display font-bold leading-tight tracking-tight ${
                i === PITCH_LINES.length - 1 ? 'text-saffron' : ''
              } ${i === 0 ? 'text-3xl md:text-5xl' : 'text-2xl md:text-4xl'}`}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="cta-row mt-10 flex flex-wrap gap-4">
          <button
            onClick={() => scrollToSection('work', reduced)}
            className="hero-cta btn-control cursor-hover bg-ink px-6 py-3 text-sm text-cream"
            data-cursor-label="work"
            onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.03, duration: 0.12 })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.18 })}
            onMouseDown={(e) => gsap.to(e.currentTarget, { scale: 0.97, duration: 0.08 })}
            onMouseUp={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: 'back.out(2)' })}
          >
            see the work <ArrowDown size={15} />
          </button>
          <button
            onClick={() => scrollToSection('contact', reduced)}
            className="hero-cta btn-control cursor-hover border-[1.5px] border-ink px-6 py-3 text-sm"
            data-cursor-label="hi :)"
            onMouseEnter={(e) =>
              gsap.to(e.currentTarget, { backgroundColor: '#171512', color: '#FAF5E9', duration: 0.12 })
            }
            onMouseLeave={(e) =>
              gsap.to(e.currentTarget, { backgroundColor: 'rgba(0,0,0,0)', color: '#171512', duration: 0.18 })
            }
          >
            get in touch
          </button>
        </div>
      </div>
    </section>
  );
}
