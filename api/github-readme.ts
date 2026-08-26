import { fetchReadme } from './_lib/readme';

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
    const data = await fetchReadme(repo, process.env.GITHUB_TOKEN as string);
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    res.status(200).json(data);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: err instanceof Error ? err.message : 'upstream failure' });
  }
}
