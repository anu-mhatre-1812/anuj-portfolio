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

const CARD_W = 320;
const CARD_H = 200;
const GAP = 20;

function gridCols(wrapperW: number): number {
  if (wrapperW >= 900) return 3;
  if (wrapperW >= 600) return 2;
  return 1;
}

function calcGridPos(i: number, total: number, wrapperW: number) {
  const cols = gridCols(wrapperW);
  const rows = Math.ceil(total / cols);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = col * (CARD_W + GAP);
  const y = row * (CARD_H + GAP);
  return { x, y, cols, rows };
}

function gridWrapperSize(total: number, wrapperW: number) {
  const cols = gridCols(wrapperW);
  const rows = Math.ceil(total / cols);
  return {
    w: cols * CARD_W + (cols - 1) * GAP,
    h: rows * CARD_H + (rows - 1) * GAP,
  };
}

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
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const stageRef = useRef<Stage>('waiting');
  const isFirstDeckRef = useRef(true);
  const [stage, setStage] = useState<Stage>('waiting');
  const [wrapperW, setWrapperW] = useState(600);

  const N = repos.length;
  const cloneTotal = !reduced && N > 0 ? Math.min(24, Math.max(0, Math.max(18, N * 2) - N)) : 0;
  const total = N + cloneTotal;

  const allCards = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return [];
    return Array.from(wrap.querySelectorAll<HTMLElement>('[data-slot]'));
  }, []);

  const setStageBoth = useCallback((s: Stage) => {
    stageRef.current = s;
    setStage(s);
  }, []);

  const buildTl = useCallback(
    (auto: boolean) => {
      const cards = allCards();
      const wrap = wrapRef.current;
      if (!wrap || cards.length === 0) return;

      const w = wrap.clientWidth;
      const center = { x: w / 2 - CARD_W / 2, y: CARD_H / 2 + 10 };
      const k = auto ? 0.72 : 1;
      const T = cards.length;
      const originals = cards.filter((el) => !el.hasAttribute('data-clone'));
      const clones = cards.filter((el) => el.hasAttribute('data-clone'));

      const R = Math.min(Math.max(w * 0.35, 140), 280);

      const tl = gsap.timeline({
        onComplete: () => {
          tlRef.current = null;
          setStageBoth('grid');
        },
      });

      tl.to(cards, {
        x: () => center.x + gsap.utils.random(-3, 3),
        y: () => center.y + gsap.utils.random(-3, 3),
        rotation: () => gsap.utils.random(-4, 4),
        scale: 0.92,
        duration: 0.5 * k,
        ease: 'power3.inOut',
        stagger: { each: 0.01 * k, from: 'start' },
      });

      tl.addLabel('circle');
      tl.to(
        cards,
        {
          x: (i: number) => center.x + Math.cos((i / T) * Math.PI * 2 - Math.PI / 2) * R,
          y: (i: number) => center.y + Math.sin((i / T) * Math.PI * 2 - Math.PI / 2) * R * 0.92,
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
          x: (i: number) => {
            const pos = calcGridPos(i, N, w);
            return pos.x;
          },
          y: (i: number) => {
            const pos = calcGridPos(i, N, w);
            return pos.y;
          },
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
            y: center.y + 42,
            rotation: 26,
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
    [allCards, N, setStageBoth]
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const obs = new ResizeObserver(([entry]) => {
      if (entry) setWrapperW(entry.contentRect.width);
    });
    obs.observe(wrap);
    setWrapperW(wrap.clientWidth);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || N === 0) {
      setStageBoth('grid');
      return;
    }

    const auto = !isFirstDeckRef.current;

    const raf = requestAnimationFrame(() => {
      tlRef.current?.kill();
      tlRef.current = null;

      const cards = allCards();
      const wrap = wrapRef.current;
      if (!wrap || cards.length === 0) return;

      const w = wrap.clientWidth;
      const center = { x: w / 2 - CARD_W / 2, y: CARD_H / 2 + 10 };

      cards.forEach((c, i) => {
        gsap.set(c, {
          x: center.x + gsap.utils.random(-3, 3),
          y: center.y + gsap.utils.random(-3, 3),
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
  }, [repos, reduced, N, allCards, buildTl, setStageBoth]);

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
    buildTl(false);
  }, [buildTl, reduced, repos.length]);

  if (N === 0) return null;

  const interactive = stage === 'grid';
  const gs = gridWrapperSize(total, wrapperW);

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
        className={`relative mx-auto max-w-3xl ${interactive ? '' : 'cursor-pointer select-none'}`}
        style={{
          height: interactive ? gs.h : undefined,
          minHeight: !interactive ? CARD_H + 20 : undefined,
        }}
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
            className="repo-slot will-change-transform absolute top-0 left-0"
            style={{
              width: CARD_W,
              pointerEvents: interactive ? 'auto' : 'none',
            }}
          >
            <RepoCard repo={repo} index={i} onOpen={interactive ? onOpen : undefined} />
          </div>
        ))}

        {cloneTotal > 0 &&
          Array.from({ length: cloneTotal }).map((_, ci) => (
            <div
              key={`clone-${resetKey}-${ci}`}
              data-slot
              data-clone
              className="repo-slot will-change-transform absolute top-0 left-0 pointer-events-none"
              style={{ width: CARD_W }}
            >
              <RepoCard repo={repos[ci % N]} index={(N + ci) % 4} />
            </div>
          ))}
      </div>
    </div>
  );
}
