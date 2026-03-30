const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Explicit include list — curated, not auto-discovered
const REPOS = [
  // GmanFooFoo (personal — OMNIXIS ecosystem + related)
  "GmanFooFoo/MEMORY-context-for-AI",
  "GmanFooFoo/OMNIXIS",
  "GmanFooFoo/omnixis-AI-SW-documention",
  "GmanFooFoo/OMNIXIS-legacy-document-importer",
  "GmanFooFoo/OMNIXIS-planning",
  "GmanFooFoo/OMNIXIS-test-management",
  "GmanFooFoo/png-AI-documentation-BPMN",
  "GmanFooFoo/promptHamster",
  // neckarshore-ai org
  "neckarshore-ai/hq",
  "neckarshore-ai/neckarshore-website",
  "neckarshore-ai/OMNIXIS-prod-or-pretend",
  "neckarshore-ai/tools-claude-plugins",
];

interface GitHubStats {
  commits: number;
  repos: number;
  linesOfCode: number;
  fetchedAt: string;
}

async function githubFetch(url: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "neckarshore-website",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return fetch(url, { headers, next: { revalidate: 3600 } });
}

async function getRepoCommitCount(repo: string): Promise<number> {
  const res = await githubFetch(
    `https://api.github.com/repos/${repo}/contributors?per_page=100&anon=true`
  );
  if (!res.ok) return 0;
  const data = await res.json();
  if (!Array.isArray(data)) return 0;
  let total = 0;
  for (const contributor of data) {
    total += contributor.contributions || 0;
  }
  return total;
}

async function getRepoCodeStats(repo: string): Promise<number> {
  // code_frequency returns weekly [timestamp, additions, deletions]
  const res = await githubFetch(
    `https://api.github.com/repos/${repo}/stats/code_frequency`
  );
  if (!res.ok) return 0;
  const data = await res.json();
  if (!Array.isArray(data)) return 0;
  let lines = 0;
  for (const week of data) {
    lines += (week[1] || 0) + (week[2] || 0); // additions + deletions (deletions are negative)
  }
  return Math.max(0, lines);
}

export async function getGitHubStats(): Promise<GitHubStats> {
  try {
    const [commitCounts, codeCounts] = await Promise.all([
      Promise.all(REPOS.map(getRepoCommitCount)),
      Promise.all(REPOS.map(getRepoCodeStats)),
    ]);

    const commits = commitCounts.reduce((a, b) => a + b, 0);
    const linesOfCode = codeCounts.reduce((a, b) => a + b, 0);

    return {
      commits,
      repos: REPOS.length,
      linesOfCode,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("GitHub stats fetch failed:", error);
    return {
      commits: 163,
      repos: 12,
      linesOfCode: 0,
      fetchedAt: new Date().toISOString(),
    };
  }
}
