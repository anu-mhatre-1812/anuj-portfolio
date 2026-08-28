import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { GithubUserStats, RepoNode } from '../hooks/useGithubStats';
import { accentFor } from '../lib/theme';
import SplitHeading from '../components/SplitHeading';
import ContributionGraph from '../components/ContributionGraph';
import StatCounter from '../components/StatCounter';
import RepoDeck from '../components/RepoDeck';
import RepoModal from '../components/RepoModal';
import PulseBox from '../components/PulseBox';
import LiveActivity from '../components/LiveActivity';
import PriceDemo from '../components/PriceDemo';
import MiniGPT from '../components/MiniGPT';
import DataBuddy from '../components/DataBuddy';
import Typewriter from '../components/Typewriter';
import GhostWord from '../components/GhostWord';
import GhostLogo from '../components/GhostLogo';

export default function WorkSection({
  stats,
  loading,
  error,
  source,
  refetch,
}: {
  stats: GithubUserStats | null;
  loading: boolean;
  error: string | null;
  source: 'graphql' | 'rest' | null;
  refetch: () => void;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [lang, setLang] = useState('All');
  const [activeRepo, setActiveRepo] = useState<RepoNode | null>(null);
  const reduced = useReducedMotion();

  const languages = useMemo(() => {
    if (!stats) return [] as string[];
    const counts = new Map<string, number>();
    stats.repos.forEach((r) => {
      const name = r.primaryLanguage?.name;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n]) => n);
  }, [stats]);

  const filtered = useMemo(() => {
    if (!stats) return [];
    if (lang === 'All') return stats.repos;
    return stats.repos.filter((r) => r.primaryLanguage?.name === lang);
  }, [stats, lang]);

  useEffect(() => {
    if (reduced || loading || !stats) return;
    const statsRow = rootRef.current?.querySelector('.stats-row');
    if (!statsRow) return;

    const ctx = gsap.context(() => {
      gsap.from('.stat-card', {
        rotationX: -42,
        y: 38,
        opacity: 0,
        transformPerspective: 700,
        transformOrigin: 'center bottom',
        duration: 0.6,
        ease: 'power3.out',
        stagger: { each: 0.07, from: 'start' },
        scrollTrigger: {
          trigger: statsRow,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });

      const bar = rootRef.current?.querySelector('.scan-line');
      const row = statsRow as HTMLElement;
      if (bar) {
        const sweep = gsap.timeline({
          scrollTrigger: {
            trigger: statsRow,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
        sweep
          .fromTo(
            bar,
            { x: 0, opacity: 1 },
            { x: () => row.offsetWidth, duration: 0.95, ease: 'power2.inOut' }
          )
          .to(bar, { opacity: 0, duration: 0.25 }, '-=0.15');
      }
    }, rootRef);

    return () => ctx.revert();
  }, [reduced, loading, stats]);

  useEffect(() => {
    if (reduced || loading || !stats) return;
    const pills = rootRef.current?.querySelector('.filter-bar');
    if (!pills) return;

    const ctx = gsap.context(() => {
      gsap.from('.filter-pill', {
        y: 12,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
        stagger: 0.04,
        scrollTrigger: {
          trigger: pills,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [reduced, loading, stats]);

  const statDefs = stats
    ? (
        [
          { label: 'followers', value: stats.followers },
          { label: 'following', value: stats.following },
          { label: 'repos', value: stats.totalRepos },
          { label: 'stars', value: stats.totalStars },
          { label: 'contributions', value: stats.totalContributions },
          { label: 'commits', value: stats.totalCommits },
          { label: 'pull requests', value: stats.totalPRs },
        ] as const
      ).filter((s) => s.value !== null)
    : [];

  return (
    <section id="work" ref={rootRef} className="relative overflow-hidden py-24 md:py-32">
      <GhostLogo className="absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute right-[3vw] top-[6vw]">
        <GhostWord text="data" speed="0.88" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Typewriter
          text="$ gh api --live --user=a18-n03"
          className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60"
        />
        <SplitHeading text="The numbers don't lie" className="mt-2 font-display text-3xl font-bold md:text-5xl" />
        <p className="mt-4 max-w-xl text-sm text-ink/70 md:text-base">
          Pulled live from GitHub — real repos, real commits, nothing hardcoded.
          {source === 'rest' && (
            <span className="ml-2 rounded-full border border-sky bg-sky/30 px-2 py-0.5 font-mono text-[10px]">
              public-api mode
            </span>
          )}
        </p>

        {loading && (
          <div className="mt-12 space-y-10">
            <PulseBox className="h-48" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
              {Array.from({ length: 7 }).map((_, i) => (
                <PulseBox key={i} className="h-24" />
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PulseBox key={i} className="h-44" />
              ))}
            </div>
          </div>
        )}

        {!loading && error && !stats && (
          <div className="card-base mt-12 p-8 text-center shadow-[5px_5px_0_#FF6F5E]">
            <p className="font-mono text-sm text-ink/70">
              $ fetch --stats → <span className="font-bold text-coral">failed</span>
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{error}</p>
            <button
              onClick={refetch}
              className="btn-control cursor-hover mt-5 border-[1.5px] border-ink px-5 py-2.5 text-sm"
              data-cursor-label="retry"
              onMouseEnter={(e) =>
                gsap.to(e.currentTarget, { backgroundColor: '#171512', color: '#FAF5E9', duration: 0.12 })
              }
              onMouseLeave={(e) =>
                gsap.to(e.currentTarget, { backgroundColor: 'rgba(0,0,0,0)', color: '#171512', duration: 0.18 })
              }
            >
              retry fetch
            </button>
          </div>
        )}

        {!loading && stats && (
          <div className="mt-12 space-y-14">
            {stats.calendar && stats.calendar.length > 0 && (
              <ContributionGraph
                calendar={stats.calendar}
                total={stats.totalContributions ?? 0}
                streak={stats.currentStreak}
              />
            )}

            <div className="relative">
              <DataBuddy />
              <div className="lg:pl-52 xl:pl-56">
                <LiveActivity />
              </div>
            </div>

            <PriceDemo />

            <MiniGPT />

            {statDefs.length > 0 && (
              <div className="stats-row relative overflow-x-clip">
                <div
                  aria-hidden
                  className="scan-line absolute left-0 top-0 z-10 h-full w-[2px] bg-saffron"
                  style={{ opacity: 0 }}
                />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
                  {statDefs.map((s, i) => (
                    <StatCounter
                      key={s.label}
                      label={s.label}
                      value={s.value as number}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {stats.pinned.length > 0 && (
              <section aria-label="Pinned repositories">
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-ink/60">
                  $ pinned --repos
                </p>
                <div className="pin-grid grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {stats.pinned.map((p, i) => (
                    <article
                      key={p.name}
                      className="pin-card card-base flex flex-col p-4"
                      style={{ boxShadow: `4px 4px 0 ${accentFor(i)}` }}
                    >
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveRepo(p);
                        }}
                        className="cursor-hover break-all font-mono text-[13px] font-bold leading-snug underline-offset-4 hover:underline"
                        data-cursor-label="open"
                      >
                        {p.name}
                      </a>
                      <p className="mt-2 line-clamp-2 min-h-[2.3rem] text-[11.5px] leading-snug text-ink/65">
                        {p.description ?? '—'}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-3 font-mono text-[10.5px] text-ink/55">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: p.primaryLanguage?.color ?? '#8b8579' }}
                          />
                          {p.primaryLanguage?.name ?? 'code'}
                        </span>
                        <span>★ {p.stargazerCount}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <div aria-label="Repositories">
              <div className="filter-bar mb-6 flex flex-wrap items-center gap-2">
                <span className="mr-2 font-mono text-xs uppercase tracking-[0.18em] text-ink/60">
                  filter --lang
                </span>
                {['All', ...languages].map((l) => {
                  const active = lang === l;
                  return (
                    <button
                      key={l}
                      onClick={(e) => {
                        setLang(l);
                        if (!reduced) {
                          gsap.fromTo(
                            e.currentTarget,
                            { scale: 0.92 },
                            { scale: 1, duration: 0.25, ease: 'back.out(2.5)' }
                          );
                        }
                      }}
                      className={`filter-pill cursor-hover rounded-full border-[1.5px] px-3.5 py-1.5 font-mono text-xs ${
                        active ? 'border-ink bg-ink font-medium text-cream' : 'border-ink/25'
                      }`}
                      data-cursor-label="filter"
                      aria-pressed={active}
                    >
                      {l}
                    </button>
                  );
                })}
                <span className="ml-auto hidden font-mono text-xs text-ink/50 md:block">
                  {filtered.length} repos · sorted by last update
                </span>
              </div>

              <RepoDeck repos={filtered} reduced={reduced} resetKey={lang} onOpen={setActiveRepo} />

              {filtered.length === 0 && (
                <p className="py-16 text-center font-mono text-sm text-ink/50">
                  no public repos match “{lang}” — try another language.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {activeRepo && <RepoModal repo={activeRepo} onClose={() => setActiveRepo(null)} />}
    </section>
  );
}
