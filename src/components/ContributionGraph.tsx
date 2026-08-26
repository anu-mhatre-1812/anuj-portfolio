import { useEffect, useMemo, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { levelColor } from '../lib/theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ContributionGraph({
  calendar,
  total,
  streak,
}: {
  calendar: { contributionCount: number; date: string }[];
  total: number;
  streak?: number | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const weeks = useMemo(() => {
    const out: { contributionCount: number; date: string }[][] = [];
    for (let i = 0; i < calendar.length; i += 7) {
      out.push(calendar.slice(i, i + 7));
    }
    return out;
  }, [calendar]);

  const monthLabels = useMemo(() => {
    const labels: { week: number; label: string; key: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      if (week.length === 0) return;
      const d = new Date(week[0].date + 'T00:00:00');
      if (d.getMonth() !== lastMonth && d.getDate() <= 14) {
        labels.push({ week: wi, label: MONTHS[d.getMonth()], key: `${d.getMonth()}-${wi}` });
        lastMonth = d.getMonth();
      }
    });
    return labels;
  }, [weeks]);

  useEffect(() => {
    const graph = graphRef.current;
    const section = sectionRef.current;
    if (!graph || !section || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: graph,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.from(graph.querySelectorAll('.cg-cell'), {
        scale: 0,
        opacity: 0,
        stagger: { each: 0.003, from: 'start' },
        duration: 0.4,
        ease: 'back.out(1.2)',
      });

      tl.from(
        '.cg-label',
        { yPercent: -60, opacity: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' },
        0.1
      );

      const obj = { val: 0 };
      tl.to(
        obj,
        {
          val: total,
          duration: 1.4,
          ease: 'power1.out',
          onUpdate: () => {
            if (totalRef.current) {
              totalRef.current.textContent = Math.round(obj.val).toLocaleString('en-US');
            }
          },
        },
        0.15
      );

      tl.from('.cg-legend', { opacity: 0, y: 8, duration: 0.35 }, '-=0.5');

      tl.from(
        '.cg-streak',
        { scale: 0, duration: 0.5, ease: 'back.out(2.6)' },
        '-=0.25'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [weeks, reduced, total]);

  return (
    <section ref={sectionRef} aria-label="Contribution graph">
      <div className="mb-4 flex items-end justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">contribution activity</p>
        <p className="text-right font-mono text-sm">
          <span ref={totalRef} className="cg-total font-bold">{total.toLocaleString('en-US')}</span>{' '}
          <span className="text-ink/60">in the last year</span>
          {streak != null && streak > 0 && (
            <span className="cg-streak ml-3 inline-block rounded-full border border-saffron bg-saffron/15 px-2.5 py-0.5 text-[11px] font-medium">
              🔥 {streak}d streak
            </span>
          )}
        </p>
      </div>

      <div className="card-base overflow-x-auto p-4 shadow-[5px_5px_0_#FF9933] md:p-6">
        <div className="min-w-[720px]">
          <div className="relative mb-1 h-4 font-mono text-[10px] text-ink/50">
            {monthLabels.map((m) => (
              <span
                key={m.key}
                className="cg-label absolute top-0"
                style={{ left: `${(m.week / Math.max(weeks.length, 1)) * 100}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div
            ref={graphRef}
            role="img"
            aria-label={`Contribution graph: ${total} contributions in the last year`}
            className="grid auto-cols-[10px] grid-flow-col grid-rows-7 gap-[3px]"
            style={{ gridTemplateRows: 'repeat(7, 10px)' }}
          >
            {weeks.map((week, wi) =>
              week.map((day, di) => (
                <div
                  key={day.date}
                  className="cg-cell rounded-[3px] border border-ink/10"
                  style={{ backgroundColor: levelColor(day.contributionCount), gridColumnStart: wi + 1, gridRowStart: di + 1 }}
                  title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'}`}
                />
              ))
            )}
          </div>

          <div className="cg-legend mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-ink/50">
            less
            {[0, 2, 4, 6, 8].map((c) => (
              <span key={c} className="h-[9px] w-[9px] rounded-[2px] border border-ink/10" style={{ backgroundColor: levelColor(c) }} />
            ))}
            more
          </div>
        </div>
      </div>
    </section>
  );
}
