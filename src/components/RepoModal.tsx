import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { RepoNode } from '../hooks/useGithubStats';

export default function RepoModal({ repo, onClose }: { repo: RepoNode; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const zoomImgRef = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !zoom) return;
    gsap.fromTo(
      zoomRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.22, ease: 'power2.out' }
    );
    gsap.fromTo(
      zoomImgRef.current,
      { scale: 0.82 },
      { scale: 1, duration: 0.38, ease: 'back.out(1.5)' }
    );
  }, [zoom, reduced]);

  useEffect(() => {
    if (!zoom) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [zoom]);

  useEffect(() => {
    if (reduced || html !== null) return;
    const els = panelRef.current?.querySelectorAll('.readme-skel');
    if (!els || els.length === 0) return;
    const t = gsap.to(els, { opacity: 0.35, repeat: -1, yoyo: true, duration: 0.55, ease: 'sine.inOut' });
    return () => {
      t.kill();
    };
  }, [html, reduced]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/github-readme?repo=${encodeURIComponent(repo.name)}`);
        const body = await r.json();
        if (cancelled) return;
        if (!r.ok || body.error) throw new Error(body.error ?? `Failed (${r.status})`);
        setHtml(body.html);
        setTopics(body.topics ?? []);
      } catch (err) {
        if (!cancelled) {
          try {
            const r2 = await fetch(
              `https://api.github.com/repos/a18-n03/${repo.name}/readme`,
              { headers: { Accept: 'application/vnd.github.html+json' } }
            );
            if (!r2.ok) throw new Error('readme unavailable');
            setHtml(await r2.text());
          } catch {
            if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load README');
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repo.name]);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);

    if (!reduced) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
      gsap.fromTo(
        panelRef.current,
        { y: 46, scale: 0.94, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' }
      );
      gsap.from(closeRef.current, { rotation: -90, duration: 0.4, ease: 'back.out(2)', delay: 0.15 });
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo.name]);

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    if (reduced || !panelRef.current) {
      onClose();
      return;
    }
    gsap.to(panelRef.current, {
      y: 40,
      scale: 0.95,
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.28,
      delay: 0.05,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={requestClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${repo.name} details`}
    >
      <div
        ref={panelRef}
        className="card-base relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden shadow-[8px_8px_0_#171512]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 bg-ink px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-coral" />
          <span className="h-3 w-3 rounded-full bg-yolk" />
          <span className="h-3 w-3 rounded-full bg-saffron" />
          <span className="ml-2 truncate font-mono text-xs text-cream/80">
            anuj@navi-mumbai: ~/repos/{repo.name}
          </span>
          <button
            ref={closeRef}
            onClick={requestClose}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-cream/40 font-mono text-sm text-cream/80 hover:border-cream hover:text-cream"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 border-b-[1.5px] border-ink/15 px-5 py-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium"
            style={{
              backgroundColor: `${accentOf(repo)}22`,
              border: `1px solid ${accentOf(repo)}`,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: repo.primaryLanguage?.color ?? '#8b8579' }}
            />
            {repo.primaryLanguage?.name ?? 'code'}
          </span>
          <span className="font-mono text-[11px] text-ink/55">★ {repo.stargazerCount}</span>
          <span className="font-mono text-[11px] text-ink/55">⑂ {repo.forkCount}</span>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="btn-control cursor-hover ml-auto border-[1.5px] border-ink px-3 py-1.5 text-[11px]"
            data-cursor-label="gh ↗"
            onMouseEnter={(e) =>
              gsap.to(e.currentTarget, { backgroundColor: '#171512', color: '#FAF5E9', duration: 0.12 })
            }
            onMouseLeave={(e) =>
              gsap.to(e.currentTarget, { backgroundColor: '#FAF5E9', color: '#171512', duration: 0.18 })
            }
          >
            open repo ↗
          </a>
        </div>

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 pt-4">
            {topics.map((t) => (
              <span
                key={t}
                className="rounded-full border border-ink/25 bg-cream px-2.5 py-0.5 font-mono text-[10px] text-ink/70"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div
          className="readme-body overflow-y-auto px-5 py-5 md:px-7"
          onClick={(e) => {
            const img = e.target as HTMLElement;
            if (img.tagName === 'IMG' && img.getAttribute('src')) {
              setZoom({ src: img.getAttribute('src')!, alt: img.getAttribute('alt') ?? repo.name });
            }
          }}
        >
          {error && (
            <div className="py-10 text-center font-mono text-sm text-ink/60">
              $ cat README.md → <span className="text-coral">unavailable</span>
              <br />
              <a href={repo.url} target="_blank" rel="noreferrer" className="underline">
                view on github instead ↗
              </a>
            </div>
          )}
          {!error && html === null && (
            <div className="space-y-3 py-2">
              {[92, 78, 85, 60, 88, 72].map((w, i) => (
                <div
                  key={i}
                  className="readme-skel h-4 rounded bg-ink/10"
                  style={{ width: `${w}%` }}
                />
              ))}
              <div className="readme-skel h-44 rounded-[12px] border-[1.5px] border-ink/20 bg-ink/5" />
            </div>
          )}
          {html !== null && !error && (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
          )}
        </div>
      </div>

      {zoom && (
        <div
          ref={zoomRef}
          className="fixed inset-0 z-[160] flex items-center justify-center bg-ink/90 p-6"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-label="Image preview"
        >
          <img
            ref={zoomImgRef}
            src={zoom.src}
            alt={zoom.alt}
            className="max-h-[88vh] max-w-[92vw] rounded-[14px] border-2 border-cream/30 object-contain shadow-[0_0_60px_rgba(0,0,0,0.6)]"
          />
          <button
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-cream/40 font-mono text-cream/80 hover:border-cream hover:text-cream"
            aria-label="Close image"
          >
            ✕
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[11px] text-cream/50">
            {zoom.alt} · click anywhere to close
          </p>
        </div>
      )}
    </div>,
    document.body
  );
}

function accentOf(repo: RepoNode): string {
  const accents = ['#FF6F5E', '#C9E8FF', '#FFD23F', '#FF9933'];
  let h = 0;
  for (let i = 0; i < repo.name.length; i++) h = (h + repo.name.charCodeAt(i)) % 4;
  return accents[h];
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}
