const LOGIN = 'a18-n03';

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      followers { totalCount }
      following { totalCount }
      pinnedItems(first: 4, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            forkCount
            updatedAt
            primaryLanguage { name color }
          }
        }
      }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false,
                    orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        nodes {
          name
          description
          url
          stargazerCount
          forkCount
          updatedAt
          primaryLanguage { name color }
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              color
            }
          }
        }
      }
    }
  }`;

// In-memory cache (survives across warm invocations)
let cachedData: unknown = null;
let cacheTime = 0;
const CACHE_TTL = 1_800_000; // 30 minutes

interface ResLike {
  setHeader(key: string, value: string): void;
  status(code: number): { json(body: unknown): void };
}

export default async function handler(_req: unknown, res: ResLike) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ errors: [{ message: 'GITHUB_TOKEN not set' }] });
    return;
  }

  // Return cached data if available
  if (cachedData && Date.now() - cacheTime < CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.setHeader('X-Cache', 'HIT');
    res.status(200).json(cachedData);
    return;
  }

  // Try GraphQL first
  try {
    const r = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
    });

    const data = await r.json() as { errors?: Array<{ message: string }>; data?: unknown };
    if (r.ok && !data.errors) {
      cachedData = data;
      cacheTime = Date.now();
      res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
      res.status(200).json(data);
      return;
    }
    // Fall through to REST if rate limited
  } catch {
    // Fall through to REST
  }

  // REST fallback (wrapped in try-catch to handle rate limits)
  try {
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' };
    const [rR, fR, fgR, eR] = await Promise.all([
      fetch(`https://api.github.com/users/${LOGIN}/repos?per_page=100&sort=updated&type=owner`, { headers }),
      fetch(`https://api.github.com/users/${LOGIN}/followers?per_page=100`, { headers }),
      fetch(`https://api.github.com/users/${LOGIN}/following?per_page=100`, { headers }),
      fetch(`https://api.github.com/users/${LOGIN}/events?per_page=100`, { headers }),
    ]);

    if (!rR.ok) {
      // If REST is rate limited but we have stale cache, return it
      if (cachedData) {
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
        res.setHeader('X-Cache', 'STALE');
        res.status(200).json(cachedData);
        return;
      }
      throw new Error('GitHub REST API unavailable');
    }

    const reposRaw = await rR.json() as Array<{
      name: string; description: string | null; html_url: string;
      stargazers_count: number; forks_count: number; updated_at: string;
      language: string | null; fork: boolean;
    }>;

    const followersList = fR.ok ? await fR.json() as Array<{ login: string }> : [];
    const followingList = fgR.ok ? await fgR.json() as Array<{ login: string }> : [];

    const repos = reposRaw
      .filter(r => !r.name.startsWith('a18-n03') && !r.fork)
      .map(r => ({
        name: r.name, description: r.description, url: r.html_url,
        stargazerCount: r.stargazers_count, forkCount: r.forks_count,
        updatedAt: r.updated_at,
        primaryLanguage: r.language ? { name: r.language, color: null } : null,
      }));

    let totalCommits = 0;
    let totalPRs = 0;
    if (eR.ok) {
      const events = await eR.json() as Array<{ type: string; payload: { action?: string; size?: number } }>;
      for (const e of events) {
        if (e.type === 'PushEvent') totalCommits += (e.payload.size ?? 1);
        if (e.type === 'PullRequestEvent' && e.payload.action === 'opened') totalPRs++;
      }
    }

    const data = {
      data: {
        user: {
          followers: { totalCount: followersList.length },
          following: { totalCount: followingList.length },
          repositories: { totalCount: reposRaw.length, nodes: repos },
          pinnedItems: { nodes: [] },
          contributionsCollection: {
            totalCommitContributions: totalCommits,
            totalPullRequestContributions: totalPRs,
            contributionCalendar: { totalContributions: 576, weeks: [] },
          },
        },
      },
    };

    cachedData = data;
    cacheTime = Date.now();
    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch (err) {
    // If we have cached data, return it even if stale
    if (cachedData) {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
      res.setHeader('X-Cache', 'STALE');
      res.status(200).json(cachedData);
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    // Return hardcoded fallback data instead of 500
    const fallback = {
      data: {
        user: {
          followers: { totalCount: 6 },
          following: { totalCount: 4 },
          repositories: { totalCount: 29, nodes: [] },
          pinnedItems: { nodes: [] },
          contributionsCollection: {
            totalCommitContributions: 0,
            totalPullRequestContributions: 0,
            contributionCalendar: { totalContributions: 576, weeks: [] },
          },
        },
      },
    };
    res.status(200).json(fallback);
  }
}
