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
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not set');

    const r = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
    });

    if (!r.ok) throw new Error(`GitHub responded ${r.status}`);
    const data = await r.json();

    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ errors: [{ message: err instanceof Error ? err.message : 'upstream failure' }] });
  }
}
