import { useEffect, useRef, useState } from 'react';
import { gsap, SplitText } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GithubUserStats } from '../hooks/useGithubStats';

function TerminalValue({ value, live }: { value: number | null; live: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!live) {
      el.textContent = '···';
      return;
    }
    if (value === null) {
      el.textContent = '—';
      return;
    }
    if (reduced) {
      el.textContent = value.toLocaleString('en-US');
      return;
    }
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: 'power1.out',
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString('en-US');
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, live, reduced]);

  return <span ref={ref} className="font-bold text-ink">···</span>;
}

export default function TerminalHero({
  stats,
  loading: _loading,
}: {
  stats: GithubUserStats | null;
  loading: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (reduced) {
      setLive(true);
      return;
    }

    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(container, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 100,
            opacity: 0,
            stagger: 0.12,
            duration: 0.8,
            ease: 'am-signature',
            onComplete: () => {
              setLive(true);
            },
          });
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [reduced]);

  useEffect(() => {
    const caret = caretRef.current;
    if (!caret || reduced) return;
    const tween = gsap.to(caret, {
      opacity: 0,
      repeat: -1,
      yoyo: true,
      duration: 0.55,
      ease: 'sine.inOut',
    });
    return () => {
      tween.kill();
    };
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      className="card-base relative overflow-hidden p-5 font-mono text-[13px] leading-relaxed shadow-[6px_6px_0_#FFD23F] md:p-7 md:text-sm"
      aria-label="Live GitHub stats terminal"
    >
      <div className="mb-4 flex items-center gap-2" aria-hidden>
        <span className="h-3 w-3 rounded-full bg-coral border border-ink/20" />
        <span className="h-3 w-3 rounded-full bg-yolk border border-ink/20" />
        <span className="h-3 w-3 rounded-full bg-saffron border border-ink/20" />
        <span className="ml-3 text-xs text-ink/50">anuj@portfolio ~ zsh</span>
      </div>

      <div className="space-y-1 text-ink/80">
        <p>
          <span className="font-bold text-coral">$</span> whoami
        </p>
        <p>
          anuj_mhatre · btech cse (ai &amp; ml) &apos;28 · csmu navi mumbai
        </p>
        <p className="pt-2">
          <span className="font-bold text-coral">$</span> git log --stat --since=&quot;1.year&quot; --author=&quot;anuj&quot;
        </p>
        <p>
          commits <TerminalValue value={stats?.totalCommits ?? null} live={live} /> · streak{' '}
          <TerminalValue value={stats?.currentStreak ?? null} live={live} />d · prs{' '}
          <TerminalValue value={stats?.totalPRs ?? null} live={live} />
        </p>
        <p className="pt-2">
          <span className="font-bold text-coral">$</span> gh api users/a18-n03 --jq &apos;.public_repos, .followers&apos;
        </p>
        <p>
          repos <TerminalValue value={stats?.totalRepos ?? null} live={live} /> · followers{' '}
          <TerminalValue value={stats?.followers ?? null} live={live} />
        </p>
        <p className="pt-2">
          <span className="font-bold text-saffron">$</span> status --now
        </p>
        <p>
          ▸ building <span className="font-bold">draco</span> — terminal-first ai coding agent
          <span ref={caretRef} className="ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-ink" />
        </p>
      </div>
    </div>
  );
}
