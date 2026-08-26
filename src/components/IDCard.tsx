import { useRef } from 'react';
import { gsap } from '../lib/gsap';
import { Github, Instagram, Linkedin, Mail, MessageCircle } from 'lucide-react';

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

const SOCIALS = [
  { icon: Github, label: 'GitHub', handle: '@a18-n03' },
  { icon: Linkedin, label: 'LinkedIn', handle: 'anuj-mhatre-031807ma' },
  { icon: Instagram, label: 'Instagram', handle: '@anu__m.1812' },
  { icon: XIcon, label: 'X', handle: '@MhatreAnuj1814' },
  { icon: Mail, label: 'Email', handle: 'anujmhatre125@gmail.com' },
  { icon: MessageCircle, label: 'Discord', handle: 'anujmhatre_2007' },
];

const BARCODE_FRONT = [4,6,3,5,7,3,5,6,4,7,3,5,6,4,7,3,5,4,6,3,5,7,4,6,3,5,7,4];
const BARCODE_BACK = [5,7,3,6,4,7,3,5,6,4,7,3,6,5,7,3,4,6,5,7,3,6,4];

export default function IDCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const flip = (dir: 'in' | 'out') => {
    if (!cardRef.current) return;
    if (!tlRef.current) {
      const inner = cardRef.current.querySelector('.id-inner')!;
      tlRef.current = gsap.timeline({ paused: true });
      tlRef.current.to(inner, { rotateY: 180, duration: 0.6, ease: 'power2.inOut' });
    }
    dir === 'in' ? tlRef.current.play() : tlRef.current.reverse();
  };

  return (
    <div
      ref={cardRef}
      className="id-card-wrapper mx-auto w-[265px] perspective-[1200px]"
      onMouseEnter={() => flip('in')}
      onMouseLeave={() => flip('out')}
    >
      <div
        className="id-inner relative h-[420px] w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ── FRONT ── */}
        <div
          className="id-front absolute inset-0 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12),6px_6px_0_#FFD23F]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* top accent bar */}
          <div className="relative h-[7px] w-full overflow-hidden bg-ink">
            <div className="absolute inset-0 bg-gradient-to-r from-saffron via-coral to-saffron opacity-90" />
          </div>

          {/* subtle micro-pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #171512 0, #171512 1px, transparent 1px, transparent 8px)`,
            }}
          />

          {/* header */}
          <div className="relative flex flex-col items-center border-b border-ink/6 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-[46px] w-[46px] shrink-0 overflow-hidden rounded-full border-2 border-ink/10 shadow-sm">
                <img src="/clg-logo.jpeg" alt="CSMU" className="h-full w-full object-cover" />
              </div>
              <div className="text-center">
                <p className="font-display text-[11.5px] font-extrabold leading-tight tracking-tight text-ink">CHHATRAPATI SHIVAJI</p>
                <p className="font-display text-[11.5px] font-extrabold leading-tight tracking-tight text-ink">MAHARAJ UNIVERSITY</p>
                <p className="font-mono text-[6.5px] uppercase tracking-[0.22em] text-ink/35">Est. 2019 · Navi Mumbai</p>
              </div>
            </div>
          </div>

          {/* badge */}
          <div className="relative mx-auto mt-2.5 w-fit rounded-md bg-ink px-4 py-[3px] shadow-sm">
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-cream">Student Identity Card</span>
          </div>

          {/* photo */}
          <div className="relative mx-auto mt-3">
            <div className="mx-auto h-[115px] w-[95px] overflow-hidden rounded-lg border-2 border-ink/10 bg-cream shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
              <img
                src="/id-photo.jpg"
                alt="Anuj Mhatre"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="95" height="115"><rect width="95" height="115" fill="#FAF5E9"/><text x="47" y="62" text-anchor="middle" font-family="monospace" font-size="9" fill="#171512">NO IMAGE</text></svg>'
                  );
                }}
              />
            </div>
            {/* small accent dot */}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-saffron shadow-sm" />
          </div>

          {/* name */}
          <p className="mt-3 text-center font-display text-[15px] font-extrabold tracking-wide text-ink">ANUJ MHATRE</p>

          {/* details */}
          <div className="mx-auto mt-2 w-[82%] space-y-[5px]">
            {[
              ['Enrollment', 'CSMU-BTECH-2025-0847'],
              ['Course', 'BTech CSE (AI & ML)'],
              ['Partnership', 'IBM'],
              ['Year', '2nd Year'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between border-b border-dotted border-ink/8 pb-[3px]">
                <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-ink/35">{k}</span>
                <span className="font-mono text-[8px] font-semibold text-ink">{v}</span>
              </div>
            ))}
          </div>

          {/* validity */}
          <div className="mt-2 text-center">
            <p className="font-mono text-[6.5px] uppercase tracking-[0.16em] text-ink/30">Valid Until</p>
            <p className="font-mono text-[10px] font-bold text-saffron">2025 – 2029</p>
          </div>

          {/* barcode */}
          <div className="mt-auto flex items-end justify-center gap-[1.2px] pb-2.5 pt-1">
            {BARCODE_FRONT.map((h, i) => (
              <div key={i} className="bg-ink/70" style={{ width: 1.2, height: h + 5 }} />
            ))}
          </div>

          {/* bottom accent */}
          <div className="absolute bottom-0 h-[5px] w-full bg-ink" />
        </div>

        {/* ── BACK ── */}
        <div
          className="id-back absolute inset-0 overflow-hidden rounded-2xl border border-ink/8"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(165deg, #171512 0%, #1e1b18 40%, #171512 100%)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2), 6px 6px 0 #FF9933',
          }}
        >
          {/* top accent */}
          <div className="h-[7px] w-full bg-gradient-to-r from-saffron via-coral to-saffron" />

          {/* subtle grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, #FAF5E9 0.5px, transparent 0.5px)`,
              backgroundSize: '12px 12px',
            }}
          />

          {/* logo + university */}
          <div className="relative flex flex-col items-center px-4 pt-4 pb-2">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-cream/10 shadow-lg">
              <img src="/clg-logo.jpeg" alt="CSMU" className="h-full w-full object-cover" />
            </div>
            <p className="mt-2 text-center font-display text-[11.5px] font-extrabold text-cream/90">CHHATRAPATI SHIVAJI</p>
            <p className="text-center font-display text-[11.5px] font-extrabold text-cream/90">MAHARAJ UNIVERSITY</p>
            <p className="font-mono text-[6.5px] uppercase tracking-[0.22em] text-cream/25">Navi Mumbai, Maharashtra</p>
          </div>

          <div className="mx-auto h-[1px] w-[70%] bg-gradient-to-r from-transparent via-cream/15 to-transparent" />

          {/* student info */}
          <div className="relative mt-3 text-center">
            <p className="font-display text-[18px] font-extrabold tracking-wide text-cream">ANUJ MHATRE</p>
            <div className="mx-auto mt-1 flex items-center justify-center gap-2">
              <div className="h-[1px] w-6 bg-cream/15" />
              <p className="font-mono text-[7.5px] text-cream/30">CSMU-BTECH-2025-0847</p>
              <div className="h-[1px] w-6 bg-cream/15" />
            </div>
            <p className="mt-0.5 font-mono text-[7.5px] text-cream/25">BTech CSE (AI & ML) · 2nd Year</p>
          </div>

          {/* social grid */}
          <div className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-2 px-5">
            {SOCIALS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2 rounded-md bg-cream/[0.03] px-2 py-1.5">
                  <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-cream/10 bg-cream/5">
                    <Icon size={11} className="text-cream/50" />
                  </div>
                  <span className="font-mono text-[7px] leading-tight text-cream/35 truncate">{s.handle}</span>
                </div>
              );
            })}
          </div>

          {/* footer */}
          <div className="relative mt-auto pb-2.5 pt-3 text-center">
            <p className="font-mono text-[6.5px] uppercase tracking-[0.2em] text-cream/15">
              This card is non-transferable
            </p>
            <p className="font-mono text-[6.5px] uppercase tracking-[0.2em] text-cream/15">
              If found, please return to CSMU
            </p>
            <div className="mx-auto mt-2 flex items-end justify-center gap-[1.2px]">
              {BARCODE_BACK.map((h, i) => (
                <div key={i} className="bg-cream/12" style={{ width: 1.2, height: h + 4 }} />
              ))}
            </div>
          </div>

          {/* bottom accent */}
          <div className="absolute bottom-0 h-[5px] w-full bg-gradient-to-r from-saffron via-coral to-saffron" />
        </div>
      </div>
    </div>
  );
}
