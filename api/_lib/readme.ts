export interface ReadmePayload {
  html: string;
  topics: string[];
}

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

export async function fetchReadme(repo: string, token?: string): Promise<ReadmePayload> {
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

  return { html, topics };
}
