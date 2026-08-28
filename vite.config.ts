import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchGithubUser } from './api/_lib/github';
import { fetchGithubEvents } from './api/_lib/events';
import { fetchReadme } from './api/_lib/readme';

const RENDER_API = 'https://navi-mumbai-house-price-prediction.onrender.com';
const HF_MODEL = 'Qwen/Qwen2.5-Coder-1.5B-Instruct';
const GITHUB_LOGIN = 'a18-n03';

function githubApiDevServer(token: string | undefined, hfToken: string | undefined): Plugin {
  return {
    name: 'github-api-dev-proxy',
    configureServer(server) {
      // POST /api/predict → proxy to Render ML API (CORS bypass)
      server.middlewares.use('/api/predict', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'method not allowed' }));
          return;
        }
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = Buffer.concat(chunks).toString();
          const upstream = await fetch(`${RENDER_API}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          });
          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(text);
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      server.middlewares.use('/api/github-stats', async (_req, res) => {
        if (!token) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ errors: [{ message: 'GITHUB_TOKEN not set' }] }));
          return;
        }
        try {
          const data = await fetchGithubUser(GITHUB_LOGIN, token);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(data));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ errors: [{ message: String(err) }] }));
        }
      });

      server.middlewares.use('/api/github-events', async (_req, res) => {
        if (!token) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'GITHUB_TOKEN not set' }));
          return;
        }
        try {
          const entries = await fetchGithubEvents(GITHUB_LOGIN, token);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ entries }));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      server.middlewares.use('/api/github-readme', async (req, res) => {
        const url = new URL(req.url ?? '', 'http://localhost');
        const repo = url.searchParams.get('repo') ?? '';
        if (!token || !repo) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'repo + GITHUB_TOKEN required' }));
          return;
        }
        try {
          const data = await fetchReadme(repo, token);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(data));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      const RENDER_URL = 'https://mini-gpt-1fae.onrender.com';
      server.middlewares.use('/api/mini-gpt', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'method not allowed' }));
          return;
        }
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk);
          const rawBody = Buffer.concat(chunks);
          const contentType = req.headers['content-type'] || '';

          let upstream: Response;

          if (contentType.includes('multipart/form-data')) {
            upstream = await fetch(`${RENDER_URL}/generate-with-file`, {
              method: 'POST',
              headers: { 'Content-Type': contentType },
              body: rawBody,
            });
          } else {
            const body = JSON.parse(rawBody.toString());
            upstream = await fetch(`${RENDER_URL}/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: body.prompt }),
            });
          }

          const data = await upstream.json();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ response: data?.response ?? data?.error ?? 'No response', model: 'Mini-GPT' }));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), githubApiDevServer(env.GITHUB_TOKEN, env.HF_TOKEN)],
  };
});
