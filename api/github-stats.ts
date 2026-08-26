import { fetchGithubUser } from './_lib/github';

const LOGIN = 'a18-n03';

interface ResLike {
  setHeader(key: string, value: string): void;
  status(code: number): { json(body: unknown): void };
}

export default async function handler(_req: unknown, res: ResLike) {
  try {
    const data = await fetchGithubUser(LOGIN);
    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ errors: [{ message: err instanceof Error ? err.message : 'upstream failure' }] });
  }
}
