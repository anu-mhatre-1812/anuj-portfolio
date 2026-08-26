function postProcess(html: string, repo: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/(src|href)="(?!https?:|#|mailto:|data:)([^"]+)"/g, (_m, attr: string, path: string) => {
      const clean = path.replace(/^\.\//, '').replace(/^\//, '');
      return `${attr}="https://raw.githubusercontent.com/a18-n03/${repo}/HEAD/${clean}"`;
    })
    .replace(/<a /g, '<a target="_blank" rel="noreferrer noopener" ');
}

interface ResLike {
  setHeader(key: string, value: string): void;
  status(code: number): { json(body: unknown): void };
}

export default async function handler(
  req: { query?: Record<string, string> },
  res: ResLike
) {
  const repo = String(req.query?.repo ?? '').replace(/[^a-zA-Z0-9._-]/g, '');
  if (!repo) {
    res.status(400).json({ error: 'repo query param required' });
    return;
  }
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = { Accept: 'application/vnd.github.html+json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const r = await fetch(`https://api.github.com/repos/a18-n03/${repo}/readme`, { headers });
    if (!r.ok) throw new Error(`readme ${r.status}`);
    const html = postProcess(await r.text(), repo);

    let topics: string[] = [];
    try {
      const t = await fetch(`https://api.github.com/repos/a18-n03/${repo}/topics`, {
        headers: { Accept: 'application/vnd.github.mercy+json' },
      });
      if (t.ok) {
        const d = (await t.json()) as { names?: string[] };
        topics = d.names ?? [];
      }
    } catch {
      topics = [];
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    res.status(200).json({ html, topics });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: err instanceof Error ? err.message : 'upstream failure' });
  }
}
