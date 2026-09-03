import { useState, useEffect, useRef, Suspense } from 'react';
import { gsap } from 'gsap';
import BadgeSphere from './badges/BadgeSphere';
import BadgeReveal from './badges/BadgeReveal';
import { badges, type Badge } from './badges/badges.data';

export default function BadgeSection() {
  const [activeBadge, setActiveBadge] = useState<Badge | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      });
      gsap.from('.badge-grid-item', {
        y: 40, opacity: 0, stagger: 0.03, duration: 0.5, ease: 'power2.out', delay: 0.3,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Back button */}
      <a
        href="/"
        className="fixed top-6 left-6 z-50 border-2 border-ink bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:bg-yolk transition-colors"
      >
        ← Portfolio
      </a>

      {/* Header */}
      <div ref={titleRef} className="pt-24 pb-6 text-center">
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-ink md:text-6xl">
          Badges
        </h1>
        <p className="mt-3 font-mono text-sm text-ink/40">
          {badges.length} certifications earned
        </p>
        <p className="mt-1 font-mono text-xs text-ink/30">
          hover a badge on the sphere for 2s to view details
        </p>
      </div>

      {/* 3D Sphere */}
      <Suspense fallback={
        <div className="h-[70vh] flex items-center justify-center font-mono text-ink/30 text-sm">
          loading 3d sphere...
        </div>
      }>
        <BadgeSphere
          onBadgeActivated={(b) => setActiveBadge(b)}
          activeBadge={activeBadge}
        />
      </Suspense>

      {/* Badge grid */}
      <div className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-ink/40 mb-8 text-center">
          All Badges
        </h2>
        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {badges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setActiveBadge(badge)}
              className="badge-grid-item group border-2 border-ink/10 bg-white p-3 text-center transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-ink hover:shadow-[4px_4px_0_#171512]"
            >
              <img
                src={badge.imageUrl}
                alt={badge.title}
                className="mx-auto h-20 w-auto object-contain"
              />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink/60 group-hover:text-ink">
                {badge.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Reveal overlay */}
      {activeBadge && (
        <BadgeReveal badge={activeBadge} onClose={() => setActiveBadge(null)} />
      )}
    </div>
  );
}
