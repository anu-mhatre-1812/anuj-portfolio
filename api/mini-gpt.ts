const RENDER_URL = "https://mini-gpt-1fae.onrender.com";

interface ResLike {
  setHeader(key: string, value: string): void;
  status(code: number): { json(body: unknown): void };
}

export default async function handler(req: unknown, res: ResLike) {
  const r = req as { method?: string; body?: { prompt?: string; file?: { name: string; content: string; type: string } } };

  if (r.method !== "POST") {
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const prompt = r.body?.prompt || "What are you?";
  const file = r.body?.file;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    let upstream: Response;

    if (file) {
      upstream = await fetch(`${RENDER_URL}/generate-with-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, file_name: file.name, file_content: file.content, file_type: file.type }),
        signal: controller.signal,
      });
    } else {
      upstream = await fetch(`${RENDER_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });
    }

    clearTimeout(timeout);
    const data = await upstream.json() as { response?: string; error?: string };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ response: data?.response ?? data?.error ?? "No response", model: "Mini-GPT" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.setHeader("Content-Type", "application/json");
    res.status(502).json({ error: msg });
  }
}
