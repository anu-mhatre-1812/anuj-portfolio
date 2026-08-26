import { useEffect, useRef, useState } from 'react';
import { Github } from 'lucide-react';
import { gsap, ScrollTrigger, scrollToSection } from '../lib/gsap';
import { GITHUB_URL } from '../lib/theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

const LINKS = [
  { label: 'home', id: 'home' },
  { label: 'work', id: 'work' },
  { label: 'about', id: 'about' },
  { label: 'contact', id: 'contact' },
];

export default function Nav() {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState('home');
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const triggers = LINKS.map((l) => {
      const section = document.getElementById(l.id);
      if (!section) return null;
      return ScrollTrigger.create({
        trigger: section,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (self.isActive) setActive(l.id);
        },
      });
    }).filter(Boolean) as ScrollTrigger[];
    return () => triggers.forEach((t) => t.kill());
  }, [reduced]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.nav-item', {
        y: -14,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: 'power3.out',
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <header ref={rootRef} className="fixed inset-x-0 top-0 z-40 bg-cream/85 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <button
          onClick={() => scrollToSection('home', reduced)}
          className="nav-item btn-control cursor-hover h-9 w-9 overflow-hidden rounded-full border-[1.5px] border-ink p-0"
          data-cursor-label="top"
          aria-label="Back to top"
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, duration: 0.12 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.15 })}
        >
          <img src="/id-photo.jpg" alt="Anuj Mhatre" className="h-full w-full object-cover" />
        </button>

        <div className="flex items-center gap-4 md:gap-7">
          {LINKS.map((l) => (
            <NavAnchor
              key={l.id}
              label={l.label}
              targetId={l.id}
              isActive={active === l.id}
              reduced={reduced}
            />
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="nav-item cursor-hover flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ink"
            data-cursor-label="gh ↗"
            aria-label="GitHub profile (@a18-n03)"
            onMouseEnter={(e) =>
              gsap.to(e.currentTarget, { backgroundColor: '#171512', duration: 0.12 })
            }
            onMouseLeave={(e) =>
              gsap.to(e.currentTarget, { backgroundColor: '#FAF5E9', duration: 0.15 })
            }
          >
            <Github size={16} strokeWidth={2} className="text-ink" />
          </a>
        </div>
      </nav>
    </header>
  );
}

function NavAnchor({
  label,
  targetId,
  isActive,
  reduced,
}: {
  label: string;
  targetId: string;
  isActive: boolean;
  reduced: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const underline = el.querySelector<HTMLElement>('.nav-underline');
    if (!underline) return;
    gsap.to(underline, {
      scaleX: isActive ? 1 : 0,
      duration: 0.25,
      ease: 'power2.out',
      transformOrigin: 'left center',
    });
  }, [isActive]);

  return (
    <button
      ref={ref}
      onClick={() => scrollToSection(targetId, reduced)}
      className={`cursor-hover nav-item relative pb-1 font-mono text-[11px] uppercase tracking-[0.18em] md:text-xs ${
        isActive ? 'font-bold' : 'font-medium'
      }`}
      data-cursor-label={label.slice(0, 4)}
      aria-current={isActive ? 'true' : undefined}
      onMouseEnter={(e) => {
        if (!isActive) {
          gsap.to(e.currentTarget.querySelector('.nav-underline'), {
            scaleX: 1,
            duration: 0.18,
            ease: 'power2.out',
          });
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          gsap.to(e.currentTarget.querySelector('.nav-underline'), {
            scaleX: 0,
            duration: 0.22,
            ease: 'power2.inOut',
          });
        }
      }}
    >
      {label}
      <span
        className="nav-underline absolute bottom-0 left-0 right-0 h-[2px] bg-ink"
        style={{ transform: 'scaleX(0)' }}
      />
    </button>
  );
}
