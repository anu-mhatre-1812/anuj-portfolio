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

export interface GithubRepoLite {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  updatedAt: string;
  primaryLanguage: { name: string; color: string | null } | null;
}

export interface GithubApiResponse {
  data?: {
    user?: {
      followers: { totalCount: number };
      following: { totalCount: number };
      pinnedItems?: { nodes: GithubRepoLite[] };
      repositories: {
        totalCount: number;
        nodes: GithubRepoLite[];
      };
      contributionsCollection: {
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              contributionCount: number;
              date: string;
              color: string;
            }>;
          }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export async function fetchGithubUser(login: string, overrideToken?: string): Promise<GithubApiResponse> {
  const token = overrideToken ?? process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');

  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });

  if (!r.ok) throw new Error(`GitHub responded ${r.status}`);
  return (await r.json()) as GithubApiResponse;
}
