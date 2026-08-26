import { ArrowUpRight, GitFork, Star } from 'lucide-react';
import { accentFor } from '../lib/theme';
import type { RepoNode } from '../hooks/useGithubStats';

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function RepoCard({
  repo,
  index,
  onOpen,
}: {
  repo: RepoNode;
  index: number;
  onOpen?: (repo: RepoNode) => void;
}) {
  const accent = accentFor(index);
  const langColor = repo.primaryLanguage?.color ?? '#8b8579';

  return (
    <article className="card-base repo-card flex flex-col p-5" style={{ boxShadow: `4px 4px 0 ${accent}` }}>
      <div className="flex items-start justify-between gap-3">
        <a
          href={repo.url}
          target={onOpen ? undefined : '_blank'}
          rel="noreferrer"
          onClick={(e) => {
            if (onOpen) {
              e.preventDefault();
              onOpen(repo);
            }
          }}
          className="cursor-hover break-all font-mono text-sm font-bold leading-snug underline-offset-4 hover:underline"
          data-cursor-label="open"
          aria-label={`${repo.name} — open details`}
        >
          {repo.name}
        </a>
        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="cursor-hover shrink-0 rounded-full border-[1.5px] border-ink/20 p-1.5"
          data-cursor-label="↗"
          aria-hidden
          tabIndex={-1}
        >
          <ArrowUpRight size={13} strokeWidth={2.5} />
        </a>
      </div>

      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-ink/70">
        {repo.description ?? 'No description provided.'}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium"
          style={{ backgroundColor: `${accent}30`, border: `1px solid ${accent}` }}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
          {repo.primaryLanguage?.name ?? 'code'}
        </span>
        <span className="flex items-center gap-3 font-mono text-[11px] text-ink/60">
          <span className="inline-flex items-center gap-1">
            <Star size={12} /> {repo.stargazerCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork size={12} /> {repo.forkCount}
          </span>
          <span>{timeAgo(repo.updatedAt)}</span>
        </span>
      </div>
    </article>
  );
}
