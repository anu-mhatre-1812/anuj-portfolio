import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, scrollToSection } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { RepoNode } from '../hooks/useGithubStats';

interface Command {
  label: string;
  hint: string;
  run: () => void;
}

function matches(query: string, label: string): boolean {
  const q = query.toLowerCase();
  const l = label.toLowerCase();
  if (l.includes(q)) return true;
  let i = 0;
  for (const ch of l) {
    if (ch === q[i]) i++;
    if (i >= q.length) return true;
  }
  return q.length === 0;
}

export default function CommandPalette({ repos }: { repos: RepoNode[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const sections: Command[] = [
      { label: 'go: home', hint: 'section', run: () => scrollToSection('home', reduced) },
      { label: 'go: work — live stats', hint: 'section', run: () => scrollToSection('work', reduced) },
      { label: 'go: about', hint: 'section', run: () => scrollToSection('about', reduced) },
      { label: 'go: contact', hint: 'section', run: () => scrollToSection('contact', reduced) },
      {
        label: 'open: github profile ↗',
        hint: 'link',
        run: () => window.open('https://github.com/a18-n03', '_blank', 'noopener'),
      },
    ];
    const repoCmds: Command[] = repos.slice(0, 10).map((r) => ({
      label: `repo: ${r.name}`,
      hint: r.primaryLanguage?.name ?? 'repo',
      run: () => window.open(r.url, '_blank', 'noopener'),
    }));
    return [...sections, ...repoCmds];
  }, [repos, reduced]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands.filter((c) => matches(query.trim(), c.label));
  }, [query, commands]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
        setActive(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    if (!reduced && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { y: -18, scale: 0.97, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.28, ease: 'power3.out' }
      );
    }
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, reduced]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  const runCmd = (c: Command) => {
    setOpen(false);
    setTimeout(() => c.run(), 80);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[220] bg-ink/50 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        ref={panelRef}
        className="card-base mx-auto mt-[14vh] w-[92%] max-w-xl overflow-hidden shadow-[8px_8px_0_#171512]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b-[1.5px] border-ink/15 px-4">
          <span className="font-mono text-sm font-bold text-saffron">›</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => (a + 1) % Math.max(filtered.length, 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => (a - 1 + filtered.length) % Math.max(filtered.length, 1));
              } else if (e.key === 'Enter' && filtered[active]) {
                runCmd(filtered[active]);
              }
            }}
            placeholder="type a command…"
            className="w-full bg-transparent py-4 font-mono text-sm text-ink outline-none placeholder:text-ink/40"
            aria-label="Command input"
          />
          <span className="rounded-md border border-ink/25 px-2 py-0.5 font-mono text-[10px] text-ink/50">
            esc
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center font-mono text-xs text-ink/45">
              no matching commands
            </p>
          )}
          {filtered.map((c, i) => (
            <button
              key={c.label}
              onClick={() => runCmd(c)}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left font-mono text-xs ${
                i === active ? 'bg-ink text-cream' : 'text-ink/75'
              }`}
            >
              <span>
                <span className={`mr-2 ${i === active ? 'text-saffron' : 'text-ink/35'}`}>▸</span>
                {c.label}
              </span>
              <span className={`text-[10px] uppercase tracking-widest ${i === active ? 'text-cream/60' : 'text-ink/40'}`}>
                {c.hint}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
