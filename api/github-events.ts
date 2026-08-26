import { fetchGithubEvents } from './_lib/events';

const LOGIN = 'a18-n03';

interface ResLike {
  setHeader(key: string, value: string): void;
  status(code: number): { json(body: unknown): void };
}

export default async function handler(_req: unknown, res: ResLike) {
  try {
    const entries = await fetchGithubEvents(LOGIN, process.env.GITHUB_TOKEN as string);
    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
    res.status(200).json({ entries });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: err instanceof Error ? err.message : 'upstream failure' });
  }
}
