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

// Last known good values — updated when we get a successful fetch
let cachedStats: GitHubStats | null = null;

async function githubFetch(url: string, revalidate = 3600) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "neckarshore-website",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return fetch(url, { headers, next: { revalidate } });
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
  // GitHub stats API returns 202 + empty body on first request while computing.
  // Retry up to 3 times with increasing delay.
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await githubFetch(
      `https://api.github.com/repos/${repo}/stats/code_frequency`,
      attempt === 0 ? 3600 : 0 // skip cache on retries
    );
    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) return 0;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) continue;
    let lines = 0;
    for (const week of data) {
      lines += (week[1] || 0) + (week[2] || 0);
    }
    return Math.max(0, lines);
  }
  return 0;
}

export async function getGitHubStats(): Promise<GitHubStats> {
  try {
    const [commitCounts, codeCounts] = await Promise.all([
      Promise.all(REPOS.map(getRepoCommitCount)),
      Promise.all(REPOS.map(getRepoCodeStats)),
    ]);

    const commits = commitCounts.reduce((a, b) => a + b, 0);
    const linesOfCode = codeCounts.reduce((a, b) => a + b, 0);

    const stats: GitHubStats = {
      commits,
      repos: REPOS.length,
      linesOfCode,
      fetchedAt: new Date().toISOString(),
    };

    // Only cache if we got meaningful data
    if (linesOfCode > 0) {
      cachedStats = stats;
    }

    // If lines came back as 0 (API not ready), use last known good value
    if (linesOfCode === 0 && cachedStats) {
      return { ...cachedStats, commits, repos: REPOS.length, fetchedAt: stats.fetchedAt };
    }

    return stats;
  } catch (error) {
    console.error("GitHub stats fetch failed:", error);
    if (cachedStats) return { ...cachedStats, fetchedAt: new Date().toISOString() };
    return {
      commits: 604,
      repos: REPOS.length,
      linesOfCode: 134494,
      fetchedAt: new Date().toISOString(),
    };
  }
}
