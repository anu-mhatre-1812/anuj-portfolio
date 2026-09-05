import { useCallback, useEffect, useState } from 'react';

export interface RepoNode {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  updatedAt: string;
  primaryLanguage: { name: string; color: string | null } | null;
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
}

export interface GithubUserStats {
  followers: number | null;
  following: number | null;
  totalRepos: number | null;
  totalStars: number;
  repos: RepoNode[];
  pinned: RepoNode[];
  totalContributions: number | null;
  totalCommits: number | null;
  totalPRs: number | null;
  calendar: ContributionDay[] | null;
  currentStreak: number | null;
}

interface RawGraphqlUser {
  followers: { totalCount: number };
  following: { totalCount: number };
  pinnedItems?: {
    nodes: Array<{
      name: string;
      description: string | null;
      url: string;
      stargazerCount: number;
      forkCount: number;
      updatedAt: string;
      primaryLanguage: { name: string; color: string | null } | null;
    }>;
  };
  repositories: {
    totalCount: number;
    nodes: GraphqlRepo[];
  };
  contributionsCollection: {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    contributionCalendar: {
      totalContributions: number;
      weeks: Array<{ contributionDays: ContributionDay[] }>;
    };
  };
}

interface GraphqlRepo {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  updatedAt: string;
  primaryLanguage: { name: string; color: string | null } | null;
}

interface RestUser {
  followers: number;
  following: number;
  public_repos: number;
}

interface RestRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string | null;
}

function computeStreak(days: ContributionDay[]): number {
  if (days.length === 0) return 0;
  const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1));
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  if (sorted[0].date !== todayKey) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (sorted[0].date !== yesterday.toISOString().slice(0, 10)) return 0;
  }
  let streak = 0;
  for (const day of sorted) {
    if (day.contributionCount > 0) streak++;
    else break;
  }
  return streak;
}

async function fetchViaProxy(): Promise<GithubUserStats> {
  const r = await fetch('/api/github-stats');
  const body = (await r.json()) as {
    data?: { user?: RawGraphqlUser };
    errors?: Array<{ message: string }>;
  };
  if (!r.ok || body.errors) throw new Error(body.errors?.[0]?.message ?? `Request failed (${r.status})`);
  const user = body.data?.user;
  if (!user) throw new Error('GitHub profile unavailable');

  const calendar = user.contributionsCollection.contributionCalendar.weeks.flatMap(
    (w) => w.contributionDays
  );

  const pinned: RepoNode[] = (user.pinnedItems?.nodes ?? []).map((n) => ({
    name: n.name,
    description: n.description,
    url: n.url,
    stargazerCount: n.stargazerCount,
    forkCount: n.forkCount,
    updatedAt: n.updatedAt,
    primaryLanguage: n.primaryLanguage,
  }));

  return {
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    totalRepos: user.repositories.totalCount,
    totalStars: user.repositories.nodes.reduce(
      (sum: number, n: GraphqlRepo) => sum + n.stargazerCount,
      0
    ),
    repos: user.repositories.nodes,
    pinned,
    totalContributions: user.contributionsCollection.contributionCalendar.totalContributions,
    totalCommits: user.contributionsCollection.totalCommitContributions,
    totalPRs: user.contributionsCollection.totalPullRequestContributions,
    calendar,
    currentStreak: computeStreak(calendar),
  };
}

async function fetchViaPublicApi(): Promise<GithubUserStats> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  const [uR, rR] = await Promise.all([
    fetch('https://api.github.com/users/a18-n03', { headers }),
    fetch('https://api.github.com/users/a18-n03/repos?per_page=100&sort=updated&type=owner', { headers }),
  ]);
  if (!uR.ok || !rR.ok) throw new Error('GitHub public API unavailable');
  const user = (await uR.json()) as RestUser;
  const reposRaw = (await rR.json()) as RestRepo[];

  const repos: RepoNode[] = reposRaw
    .filter((r) => !r.name.startsWith('a18-n03'))
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stargazerCount: r.stargazers_count,
      forkCount: r.forks_count,
      updatedAt: r.updated_at,
      primaryLanguage: r.language ? { name: r.language, color: null } : null,
    }));

  return {
    followers: user.followers,
    following: user.following,
    totalRepos: user.public_repos,
    totalStars: repos.reduce((sum, r) => sum + r.stargazerCount, 0),
    repos,
    pinned: [],
    totalContributions: null,
    totalCommits: null,
    totalPRs: null,
    calendar: null,
    currentStreak: null,
  };
}

export interface GithubStatsState {
  stats: GithubUserStats | null;
  loading: boolean;
  error: string | null;
  source: 'graphql' | 'rest' | null;
  refetch: () => void;
}

export function useGithubStats(): GithubStatsState {
  const [stats, setStats] = useState<GithubUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'graphql' | 'rest' | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      let result: GithubUserStats | null = null;
      let usedSource: 'graphql' | 'rest' | null = null;
      let lastError: unknown = null;

      try {
        result = await fetchViaProxy();
        usedSource = 'graphql';
      } catch (e) {
        lastError = e;
        try {
          result = await fetchViaPublicApi();
          usedSource = 'rest';
        } catch (e2) {
          lastError = e2;
        }
      }

      if (cancelled) return;
      if (result && usedSource) {
        setStats(result);
        setSource(usedSource);
      } else {
        setError(lastError instanceof Error ? lastError.message : 'Could not load GitHub data');
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    const iv = setInterval(() => setAttempt((n) => n + 1), 180_000);
    return () => clearInterval(iv);
  }, []);

  const refetch = useCallback(() => setAttempt((n) => n + 1), []);

  return { stats, loading, error, source, refetch };
}
