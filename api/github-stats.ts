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
      res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
      res.status(200).json(data);
      return;
    }
    // Fall through to REST if rate limited
  } catch {
    // Fall through to REST
  }

  // REST fallback
  try {
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' };
    const [uR, rR, cR, fR, fgR] = await Promise.all([
      fetch(`https://api.github.com/users/${LOGIN}`, { headers }),
      fetch(`https://api.github.com/users/${LOGIN}/repos?per_page=100&sort=updated&type=owner`, { headers }),
      fetch(`https://github.com/users/${LOGIN}/contributions`, { headers: { Accept: 'text/html' } }),
      fetch(`https://api.github.com/users/${LOGIN}/followers?per_page=100`, { headers }),
      fetch(`https://api.github.com/users/${LOGIN}/following?per_page=100`, { headers }),
    ]);

    if (!uR.ok || !rR.ok) throw new Error('GitHub REST API unavailable');

    const user = await uR.json() as { public_repos: number };
    const reposRaw = await rR.json() as Array<{
      name: string; description: string | null; html_url: string;
      stargazers_count: number; forks_count: number; updated_at: string;
      language: string | null; fork: boolean;
    }>;

    // Use followers/following endpoints (more accurate than /users endpoint)
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

    // Scrape contributions from HTML
    let totalContributions = 0;
    if (cR.ok) {
      const html = await cR.text();
      const contribMatch = html.match(/(\d+)\s+contributions?\s+in the last year/);
      if (contribMatch) totalContributions = parseInt(contribMatch[1], 10);
    }

    const data = {
      data: {
        user: {
          followers: { totalCount: followersList.length },
          following: { totalCount: followingList.length },
          repositories: { totalCount: user.public_repos, nodes: repos },
          pinnedItems: { nodes: [] },
          contributionsCollection: {
            totalCommitContributions: 0,
            totalPullRequestContributions: 0,
            contributionCalendar: { totalContributions, weeks: [] },
          },
        },
      },
    };

    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ errors: [{ message: err instanceof Error ? err.message : 'upstream failure' }] });
  }
}
