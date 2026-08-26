import { useCallback, useEffect, useState } from 'react';

export interface ActivityEntry {
  id: string;
  repo: string;
  url: string;
  count: number | null;
  occurredAt: number;
  messages: string[];
}

interface GhEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload?: { size?: number; commits?: Array<{ message: string }> };
}

export function timeAgoShort(ms: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function loadViaProxy(): Promise<ActivityEntry[]> {
  const r = await fetch('/api/github-events');
  const body = await r.json();
  if (!r.ok || body.error) throw new Error(body.error ?? `Request failed (${r.status})`);
  return body.entries as ActivityEntry[];
}

async function loadViaPublicApi(): Promise<ActivityEntry[]> {
  const r = await fetch('https://api.github.com/users/a18-n03/events/public?per_page=40');
  if (!r.ok) throw new Error(`events ${r.status}`);
  const evs = (await r.json()) as GhEvent[];
  const out: ActivityEntry[] = [];
  for (const e of evs) {
    if (e.type !== 'PushEvent') continue;
    const commits = e.payload?.commits ?? [];
    out.push({
      id: e.id,
      repo: e.repo.name.split('/')[1] ?? e.repo.name,
      url: `https://github.com/${e.repo.name}`,
      count: e.payload?.size ?? (commits.length > 0 ? commits.length : null),
      occurredAt: new Date(e.created_at).getTime(),
      messages: commits.map((c) => c.message),
    });
    if (out.length >= 8) break;
  }
  return out;
}

export function useGithubEvents() {
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let result: ActivityEntry[] | null = null;
      try {
        result = await loadViaProxy();
      } catch {
        try {
          result = await loadViaPublicApi();
        } catch {
          result = [];
        }
      }
      if (!cancelled) {
        if (result !== null || entries === null) setEntries(result);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    const iv = setInterval(() => setAttempt((a) => a + 1), 180_000);
    return () => clearInterval(iv);
  }, []);

  const refetch = useCallback(() => setAttempt((a) => a + 1), []);

  return { entries, loading, refetch };
}
