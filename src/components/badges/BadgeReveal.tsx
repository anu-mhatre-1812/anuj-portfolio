import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Badge } from './badges.data';

interface BadgeRevealProps {
  badge: Badge;
  onClose: () => void;
}

export default function BadgeReveal({ badge, onClose }: BadgeRevealProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(cardRef.current, { y: 60, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
    });

    return () => {
      document.body.style.overflow = '';
      ctx.revert();
    };
  }, []);

  const handleClose = () => {
    gsap.context(() => {
      gsap.to(cardRef.current, { y: 40, opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, delay: 0.1, onComplete: onClose });
    });
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        ref={cardRef}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-cream border-3 border-ink shadow-[8px_8px_0_#171512]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 border-2 border-ink bg-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:bg-coral hover:text-white hover:border-coral transition-colors"
        >
          ✕
        </button>

        {/* Certificate image */}
        <div ref={imgRef} className="border-b-2 border-ink/10">
          <img
            src={badge.imageUrl}
            alt={badge.title}
            className="w-full h-auto"
          />
        </div>

        {/* Info */}
        <div className="p-6">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink md:text-3xl">
            {badge.title}
          </h2>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-coral">
            Earned {badge.dateEarned}
          </p>
          <p className="mt-4 font-body text-sm leading-relaxed text-ink/60">
            {badge.description}
          </p>
        </div>
      </div>
    </div>
  );
}
