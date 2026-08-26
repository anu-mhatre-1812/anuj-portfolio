import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { timeAgoShort, useGithubEvents } from '../hooks/useGithubEvents';
import PulseBox from './PulseBox';

export default function LiveActivity() {
  const { entries, loading } = useGithubEvents();
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [, tick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => tick((t) => t + 1), 30_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (reduced || loading || !entries || entries.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from('.act-row', {
        y: 18,
        opacity: 0,
        stagger: 0.06,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
      gsap.to('.act-live', {
        opacity: 0.25,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: 'sine.inOut',
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced, loading, entries]);

  if (loading && entries === null) {
    return <PulseBox className="h-52" />;
  }

  if (!entries || entries.length === 0) return null;

  return (
    <div ref={rootRef} className="card-base p-5 shadow-[5px_5px_0_#FF6F5E] md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">
          $ tail -f commits.log
        </p>
        <span className="act-live inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-coral">
          <span className="inline-block h-2 w-2 rounded-full bg-coral" /> live
        </span>
      </div>

      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.id} className="act-row flex items-start justify-between gap-4 border-b border-ink/10 pb-3 last:border-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-mono text-[13px] leading-snug">
                <span className="text-saffron">▸</span> pushed{' '}
                {e.count !== null && (
                  <>
                    <span className="font-bold">{e.count}</span> commit{e.count === 1 ? '' : 's'}{' '}
                  </>
                )}
                →{' '}
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-hover font-bold underline decoration-coral decoration-2 underline-offset-4 hover:decoration-yolk"
                  data-cursor-label="open"
                >
                  {e.repo}
                </a>
              </p>
              {e.messages[0] && (
                <p className="mt-1 truncate font-mono text-[11px] text-ink/55">
                  └─ {e.messages[0].split('\n')[0]}
                </p>
              )}
            </div>
            <span className="shrink-0 pt-0.5 font-mono text-[11px] text-ink/45">
              {timeAgoShort(e.occurredAt)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 font-mono text-[10px] text-ink/40">^c to stop · auto-refreshes every 3 min</p>
    </div>
  );
}
