const RENDER_API = 'https://navi-mumbai-house-price-prediction.onrender.com';

interface ResLike {
  setHeader(key: string, value: string): void;
  status(code: number): { json(body: unknown): void };
}

export default async function handler(req: unknown, res: ResLike) {
  const r = req as { method?: string; body?: unknown };
  if (r.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  try {
    const bodyStr = JSON.stringify(r.body);
    if (bodyStr.length > 10240) {
      res.status(413).json({ error: 'payload too large' });
      return;
    }
    const upstream = await fetch(`${RENDER_API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
    });
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'no-store');
    res.status(upstream.status).json(data);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: err instanceof Error ? err.message : 'upstream failure' });
  }
}
