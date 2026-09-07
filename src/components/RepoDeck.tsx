import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import type { RepoNode } from '../hooks/useGithubStats';
import RepoCard from './RepoCard';

type Stage = 'waiting' | 'deck' | 'circle' | 'grid';

const STATUS: Record<Stage, string> = {
  waiting: '$ deck --loading',
  deck: '$ cards --stacked · click to fan',
  circle: '$ circle --wreath',
  grid: '$ grid --ready · click a card to open',
};

export default function RepoDeck({
  repos,
  reduced,
  resetKey,
  onOpen,
}: {
  repos: RepoNode[];
  reduced: boolean;
  resetKey: string;
  onOpen?: (repo: RepoNode) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const natRef = useRef<{ x: number; y: number }[] | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const stageRef = useRef<Stage>('waiting');
  const isFirstDeckRef = useRef(true);
  const [stage, setStage] = useState<Stage>('waiting');

  const N = repos.length;
  const cloneTotal = !reduced && N > 0 ? Math.min(24, Math.max(0, Math.max(18, N * 2) - N)) : 0;

  const setStageBoth = useCallback((s: Stage) => {
    stageRef.current = s;
    setStage(s);
  }, []);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const wr = wrap.getBoundingClientRect();
    const cards = Array.from(wrap.querySelectorAll<HTMLElement>('[data-slot]'));
    const centers = cards.map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left - wr.left + r.width / 2 - wr.width / 2, y: r.top - wr.top + r.height / 2 - wr.height / 2 };
    });
    return { cards, centers, W: wr.width, H: wr.height };
  }, []);

  const cacheNaturals = useCallback(() => {
    const m = measure();
    if (!m) return;
    natRef.current = m.centers;
  }, [measure]);

  const finalize = useCallback(() => {
    tlRef.current?.kill();
    tlRef.current = null;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const cards = Array.from(wrap.querySelectorAll<HTMLElement>('[data-slot]'));
    gsap.set(cards, { clearProps: 'transform' });
    setStageBoth('grid');
  }, [setStageBoth]);

  const buildTl = useCallback(
    (auto: boolean) => {
      const m = measure();
      const nat = natRef.current;
      if (!m || !nat || m.cards.length === 0) return;

      const k = auto ? 0.72 : 1;
      const T = m.cards.length;
      const originals = m.cards.filter((el) => !el.hasAttribute('data-clone'));
      const clones = m.cards.filter((el) => el.hasAttribute('data-clone'));

      const R = Math.min(Math.max(m.W * 0.35, 140), 280);

      const tl = gsap.timeline({ onComplete: () => finalize() });

      tl.to(m.cards, {
        x: (i: number) => -nat[i].x + gsap.utils.random(-3, 3),
        y: (i: number) => -nat[i].y + gsap.utils.random(-3, 3),
        rotation: () => gsap.utils.random(-4, 4),
        scale: 0.92,
        duration: 0.5 * k,
        ease: 'power3.inOut',
        stagger: { each: 0.01 * k, from: 'start' },
      });
      tl.addLabel('circle');
      tl.to(
        m.cards,
        {
          x: (i: number) => Math.cos((i / T) * Math.PI * 2 - Math.PI / 2) * R - nat[i].x,
          y: (i: number) => Math.sin((i / T) * Math.PI * 2 - Math.PI / 2) * R * 0.92 - nat[i].y,
          rotation: (i: number) => ((i / T) * Math.PI * 2 * 180) / Math.PI + 90,
          scale: 0.78,
          zIndex: (i: number) => T - i,
          duration: 0.95 * k,
          ease: 'power3.inOut',
          stagger: { each: 0.03 * k, from: 'start' },
        },
        'circle'
      );
      tl.addLabel('settle', '+=0.3');
      tl.to(
        originals,
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: { each: 0.05 * k, from: 'start' },
        },
        'settle'
      );
      if (clones.length > 0) {
        tl.to(
          clones,
          {
            opacity: 0,
            scale: 0.5,
            y: '+=42',
            rotation: '+=26',
            duration: 0.4,
            ease: 'power2.in',
            stagger: { each: 0.014 * k, from: 'edges' },
          },
          'settle+=0.08'
        );
      }

      tlRef.current?.kill();
      tlRef.current = tl;
      tl.play();
    },
    [finalize, measure]
  );

  useEffect(() => {
    if (reduced || N === 0) {
      setStageBoth('grid');
      return;
    }

    const auto = !isFirstDeckRef.current;

    const raf = requestAnimationFrame(() => {
      tlRef.current?.kill();
      tlRef.current = null;
      cacheNaturals();
      const m = measure();
      if (!m || !natRef.current) return;
      m.cards.forEach((c, i) => {
        gsap.set(c, {
          x: -natRef.current![i].x + gsap.utils.random(-3, 3),
          y: -natRef.current![i].y + gsap.utils.random(-3, 3),
          rotation: gsap.utils.random(-4, 4),
          scale: 0.92,
          opacity: 1,
          zIndex: i + 1,
        });
      });
      isFirstDeckRef.current = false;
      if (auto) {
        buildTl(true);
        setStageBoth('circle');
      } else {
        setStageBoth('deck');
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [repos, reduced, N, cacheNaturals, measure, buildTl, setStageBoth]);

  useEffect(() => {
    if (stage !== 'deck' || reduced) return;
    const hint = wrapRef.current?.querySelector('.deck-hint') as HTMLElement | null;
    if (!hint) return;
    const anim = gsap.fromTo(
      hint,
      { opacity: 0.35 },
      { opacity: 1, repeat: -1, yoyo: true, duration: 0.7, ease: 'sine.inOut' }
    );
    return () => { anim.kill(); };
  }, [stage, reduced]);

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  const activate = useCallback(() => {
    if (stageRef.current !== 'deck') return;
    setStageBoth('circle');
    buildTl(false);
  }, [buildTl, setStageBoth]);

  const replay = useCallback(() => {
    if (reduced || repos.length === 0) return;
    cacheNaturals();
    buildTl(false);
  }, [cacheNaturals, buildTl, reduced, repos.length]);

  if (N === 0) return null;

  const interactive = stage === 'grid';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs text-ink/60">
          {STATUS[stage]}
          <span className="deck-hint ml-1 inline-block h-2 w-2 rounded-full bg-saffron align-middle" />
        </p>
        {interactive && !reduced && (
          <button
            onClick={replay}
            className="cursor-hover rounded-full border-[1.5px] border-ink/30 px-3 py-1 font-mono text-[11px]"
            data-cursor-label="mix"
            onMouseEnter={(e) => gsap.to(e.currentTarget, { backgroundColor: '#171512', color: '#FAF5E9', duration: 0.12 })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { backgroundColor: 'rgba(0,0,0,0)', color: '#171512', duration: 0.18 })}
          >
            $ shuffle
          </button>
        )}
      </div>

      <div
        ref={wrapRef}
        className={`relative grid gap-5 md:grid-cols-2 lg:grid-cols-3 ${interactive ? '' : 'cursor-pointer select-none'}`}
        role={interactive ? undefined : 'button'}
        tabIndex={interactive ? -1 : 0}
        aria-label={interactive ? undefined : 'Fan out the stacked repository cards'}
        aria-disabled={!interactive}
        data-cursor-label={interactive ? undefined : 'spread'}
        onClick={() => {
          if (stageRef.current === 'deck') activate();
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && stageRef.current === 'deck') {
            e.preventDefault();
            activate();
          }
        }}
      >
        {repos.map((repo, i) => (
          <div
            key={`${resetKey}-${repo.name}`}
            data-slot
            className="repo-slot will-change-transform"
            style={{ pointerEvents: interactive ? undefined : 'none' }}
          >
            <RepoCard repo={repo} index={i} onOpen={interactive ? onOpen : undefined} />
          </div>
        ))}

        {cloneTotal > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: cloneTotal }).map((_, ci) => (
              <div
                key={`clone-${resetKey}-${ci}`}
                data-slot
                data-clone
                className="repo-slot will-change-transform"
              >
                <RepoCard repo={repos[ci % N]} index={(N + ci) % 4} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
