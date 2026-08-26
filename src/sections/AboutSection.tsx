import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import SplitHeading from '../components/SplitHeading';
import GhostWord from '../components/GhostWord';
import GhostLogo from '../components/GhostLogo';

const SKILLS: Record<string, string[]> = {
  'ai / ml': ['Python', 'PyTorch + LoRA', 'scikit-learn', 'Pandas', 'NumPy', 'feature engineering', 'model stacking', 'LLM dataset design'],
  'full-stack': ['JavaScript', 'TypeScript', 'React', 'Supabase', 'Electron', 'Node.js', 'Tailwind CSS', 'HTML/CSS'],
  'tools / misc': ['C/C++', 'SQL', 'Git & GitHub', 'Google Colab (T4)', 'Chrome extensions', 'Linux'],
};

const TIMELINE = [
  { year: '2025', name: 'DSA-C++ Notes', desc: '25+ topic-wise implementations — graphs, DP, trees, STL, number theory. The foundation layer.' },
  { year: '2025', name: 'Navi Mumbai Housing ML', desc: 'End-to-end regression: feature engineering, KMeans geo-clusters, tuned RF/HGB + stacking ensemble (R² 0.85).' },
  { year: '2026', name: 'AlteraCloud', desc: 'Brutalist cloud storage platform for web + Windows — file management, share links, AI summaries, admin panel.' },
  { year: '2026', name: 'traning-model → DracoR1', desc: 'Built the dataset pipeline, then LoRA fine-tuned DeepSeek-R1-Distill-Qwen-7B into a math + coding + Marathi assistant.' },
  { year: '2026', name: 'Draco (draco-cli)', desc: 'Zero-login terminal-first AI coding agent for the OpenCode Zen API — my daily driver now.' },
  { year: '2026', name: 'This site', desc: 'React + Vite + TS + GSAP. Live GitHub data, zero hardcoded numbers.' },
];

export default function AboutSection() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from('.about-reveal', {
        y: 24,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.about-body', start: 'top 78%', toggleActions: 'play none none none' },
      });
      gsap.from('.timeline-item', {
        x: -20,
        opacity: 0,
        stagger: 0.09,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.timeline-block', start: 'top 80%', toggleActions: 'play none none none' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="about" ref={rootRef} className="relative overflow-hidden py-24 md:py-32">
      <GhostLogo className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute left-[-2vw] top-[4vw]">
        <GhostWord text="story" speed="1" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">$ cat anuj.md</p>
        <SplitHeading text="Hi, I'm Anuj." className="mt-2 font-display text-4xl font-bold md:text-6xl" />

        <div className="about-body mt-12 grid gap-10 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            <div className="about-reveal space-y-4 max-w-2xl text-base leading-relaxed text-ink/80">
              <p>
                Second-year <strong className="text-ink">BTech CSE (AI &amp; ML)</strong> student at
                CSMU, Navi Mumbai. I build across three layers:{' '}
                <strong className="text-ink">models</strong> (fine-tuning LLMs with LoRA on Colab
                GPUs), <strong className="text-ink">products</strong> (React / TypeScript / Node
                full-stack), and the <strong className="text-ink">tooling</strong> around them —
                from C++ DSA grind to SQL and Chrome extensions.
              </p>
              <p>
                Right now that means shipping <strong className="text-ink">Draco</strong>, a
                zero-login terminal-first AI coding agent, and{' '}
                <strong className="text-ink">DracoR1</strong> — a DeepSeek-R1-distilled model I
                fine-tuned myself that answers in math, code, English and Marathi.
              </p>
              <p>
                The long game is simple: keep building in public until the work speaks loud enough
                for frontier AI labs to hear it.
              </p>
            </div>

            <div className="about-reveal space-y-6">
              {Object.entries(SKILLS).map(([group, tags]) => (
                <div key={group}>
                  <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-ink/60">
                    $ skills --group=&quot;{group}&quot;
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-ink/25 bg-cream px-3 py-1 font-mono text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="about-reveal self-start lg:sticky lg:top-24 lg:translate-x-24">
            <div className="overflow-hidden rounded-[18px] border-[1.5px] border-ink bg-cream shadow-[6px_6px_0_#C9E8FF] lg:w-[calc(100%+3rem)]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="block h-[440px] w-full object-cover object-top sm:h-[500px] mix-blend-multiply [filter:sepia(0.12)_saturate(1.06)_contrast(0.98)]"
              >
                <source src="/anuj.mp4" type="video/mp4" />
              </video>
            </div>
          </aside>
        </div>

        <div className="timeline-block mt-10 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/60">$ git log --oneline --builds</p>
          <ol className="mt-6">
            {TIMELINE.map((item, i) => (
              <li key={item.name} className="timeline-item relative flex gap-5 pb-8 last:pb-0">
                {i < TIMELINE.length - 1 && (
                  <span aria-hidden className="absolute bottom-0 left-[17px] top-9 w-[1.5px] bg-ink/15" />
                )}
                <span
                  className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink bg-cream font-mono text-xs font-bold"
                  style={{ boxShadow: `3px 3px 0 ${['#FF6F5E', '#C9E8FF', '#FFD23F', '#FF9933'][i % 4]}` }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">{item.year}</p>
                  <h3 className="mt-0.5 font-display text-xl font-bold">{item.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/70">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
