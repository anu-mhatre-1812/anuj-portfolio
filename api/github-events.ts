const LOGIN = 'a18-n03';

interface PushEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload?: {
    size?: number;
    before?: string;
    head?: string;
    commits?: Array<{ message: string }>;
  };
}

interface ActivityEntry {
  id: string;
  repo: string;
  url: string;
  count: number | null;
  occurredAt: number;
  messages: string[];
}

const compareCache = new Map<string, { count: number; messages: string[] }>();

interface ResLike {
  setHeader(key: string, value: string): void;
  status(code: number): { json(body: unknown): void };
}

export default async function handler(_req: unknown, res: ResLike) {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not set');

    const r = await fetch(`https://api.github.com/users/${LOGIN}/events/public?per_page=40`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`events ${r.status}`);
    const evs = (await r.json()) as PushEvent[];

    const pushes = evs.filter((e) => e.type === 'PushEvent').slice(0, 8);

    const entries = await Promise.all(
      pushes.map(async (e) => {
        let count: number | null = e.payload?.size ?? null;
        let messages: string[] = e.payload?.commits?.map((c) => c.message) ?? [];

        if ((count === null || count === 0) && e.payload?.before && e.payload?.head) {
          const key = `${e.repo.name}:${e.payload.before}...${e.payload.head}`;
          const cached = compareCache.get(key);
          if (cached) {
            count = cached.count;
            messages = cached.messages;
          } else {
            try {
              const c = await fetch(
                `https://api.github.com/repos/${e.repo.name}/compare/${e.payload.before}...${e.payload.head}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (c.ok) {
                const d = (await c.json()) as {
                  total_commits: number;
                  commits?: Array<{ commit: { message: string } }>;
                };
                count = d.total_commits;
                messages = (d.commits ?? []).map((x) => x.commit.message);
                compareCache.set(key, { count, messages });
              }
            } catch {
              // compare unavailable
            }
          }
        }

        if (count === null && messages.length > 0) count = messages.length;

        return {
          id: e.id,
          repo: e.repo.name.split('/')[1] ?? e.repo.name,
          url: `https://github.com/${e.repo.name}`,
          count,
          occurredAt: new Date(e.created_at).getTime(),
          messages,
        } satisfies ActivityEntry;
      })
    );

    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
    res.status(200).json({ entries });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: err instanceof Error ? err.message : 'upstream failure' });
  }
}
