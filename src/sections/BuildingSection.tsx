import { useEffect, useRef } from 'react';
import { Cpu } from 'lucide-react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import SplitHeading from '../components/SplitHeading';
import GhostWord from '../components/GhostWord';

const BUILDS = [
  {
    tag: '$ current-build --01',
    name: 'Draco',
    desc: 'Zero-login, terminal-first AI coding agent for the OpenCode Zen API — plan, edit, run and verify without leaving your shell.',
    pills: ['JavaScript', 'Node.js', 'OpenCode Zen'],
    accent: '#FF6F5E',
  },
  {
    tag: '$ current-build --02',
    name: 'DracoR1',
    desc: 'Personal AI assistant fine-tuned from DeepSeek-R1-Distill-Qwen-7B on a Colab T4 with LoRA — speaks math, code, English and Marathi.',
    pills: ['DeepSeek-R1 7B', 'LoRA', 'Colab T4'],
    accent: '#FF9933',
  },
];

export default function BuildingSection() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from('.build-card', {
        y: 24,
        opacity: 0,
        stagger: 0.09,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.build-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={rootRef} className="relative overflow-hidden py-24 md:py-32" data-trace-node="right" data-trace-index="1">
      <div className="absolute right-[3vw] top-[4vw]">
        <GhostWord text="build" speed="0.85" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">$ ls ~/currently-building</p>
        <SplitHeading
          text="Currently building"
          className="mt-2 mb-10 font-display text-3xl font-bold md:text-5xl"
        />

        <div className="build-grid grid gap-6 md:grid-cols-2">
          {BUILDS.map((b) => (
            <article key={b.name} className="build-card card-base p-6 md:p-8" style={{ boxShadow: `5px 5px 0 ${b.accent}` }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">{b.tag}</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink/60">
                  <Cpu size={13} style={{ color: b.accent }} /> active
                </span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold">{b.name}</h3>
              <p className="mt-2 min-h-[3.75rem] text-sm leading-relaxed text-ink/70">{b.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {b.pills.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border px-2.5 py-1 font-mono text-[10px]"
                    style={{ borderColor: b.accent, backgroundColor: `${b.accent}22` }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
