import { ArrowUpRight } from 'lucide-react';
import { gsap } from '../lib/gsap';
import { accentFor } from '../lib/theme';

export default function SocialCard({
  label,
  href,
  handle,
  icon,
  index,
}: {
  label: string;
  href: string;
  handle: string;
  icon: React.ReactNode;
  index: number;
}) {
  const accent = accentFor(index);

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      className="cursor-hover social-card card-base group flex items-center gap-4 p-5 md:p-6"
      style={{ boxShadow: `5px 5px 0 ${accent}` }}
      data-cursor-label={label.slice(0, 4).toLowerCase()}
      aria-label={`${label} — ${handle}`}
      onMouseEnter={(e) => {
        const root = e.currentTarget;
        gsap.to(root.querySelector('.social-icon'), {
          backgroundColor: '#171512',
          scale: 1.06,
          duration: 0.15,
          ease: 'power3.out',
        });
        gsap.to(root.querySelector('.social-icon svg'), { color: '#FAF5E9', duration: 0.15 });
      }}
      onMouseLeave={(e) => {
        const root = e.currentTarget;
        gsap.to(root.querySelector('.social-icon'), {
          backgroundColor: 'rgba(0,0,0,0)',
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        });
        gsap.to(root.querySelector('.social-icon svg'), { color: '#171512', duration: 0.2 });
      }}
      onClick={(e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const el = e.currentTarget;
        if (!href.startsWith('http')) {
          gsap
            .timeline()
            .to(el, { scale: 0.96, duration: 0.08, ease: 'power2.in' })
            .to(el, { scale: 1, duration: 0.28, ease: 'back.out(2.5)' });
          return;
        }
        e.preventDefault();
        gsap
          .timeline({ onComplete: () => window.open(href, '_blank', 'noopener') })
          .to(el, { scale: 0.96, duration: 0.08, ease: 'power2.in' })
          .to(el, { scale: 1, duration: 0.28, ease: 'back.out(2.5)' });
      }}
    >
      <span className="social-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink">
        {icon}
      </span>
      <span>
        <span className="block font-display text-lg font-bold leading-tight">{label}</span>
        <span className="block font-mono text-xs text-ink/60">{handle}</span>
      </span>
      <ArrowUpRight size={18} strokeWidth={2.25} className="ml-auto shrink-0 text-ink/50" />
    </a>
  );
}
