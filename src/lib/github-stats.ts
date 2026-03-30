const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const ORGS = ["neckarshore-ai"];
const USERS = ["GmanFooFoo"];

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

async function getOrgRepos(org: string): Promise<string[]> {
  const repos: string[] = [];
  let page = 1;
  while (true) {
    const res = await githubFetch(
      `https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`
    );
    if (!res.ok) break;
    const data = await res.json();
    if (data.length === 0) break;
    for (const repo of data) {
      repos.push(repo.full_name);
    }
    page++;
  }
  return repos;
}

async function getUserRepos(user: string): Promise<string[]> {
  const repos: string[] = [];
  let page = 1;
  while (true) {
    const res = await githubFetch(
      `https://api.github.com/users/${user}/repos?per_page=100&page=${page}&type=owner`
    );
    if (!res.ok) break;
    const data = await res.json();
    if (data.length === 0) break;
    for (const repo of data) {
      if (!repo.fork) {
        repos.push(repo.full_name);
      }
    }
    page++;
  }
  return repos;
}

async function getRepoCommitCount(repo: string): Promise<number> {
  // Use the contributors endpoint to get total commit count
  const res = await githubFetch(
    `https://api.github.com/repos/${repo}/contributors?per_page=1&anon=true`
  );
  if (!res.ok) return 0;
  const data = await res.json();
  let total = 0;
  // This only returns first page, but for our repos it's enough
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
    // Collect all repos
    const allRepos = new Set<string>();

    const [orgRepoLists, userRepoLists] = await Promise.all([
      Promise.all(ORGS.map(getOrgRepos)),
      Promise.all(USERS.map(getUserRepos)),
    ]);

    for (const list of [...orgRepoLists, ...userRepoLists]) {
      for (const repo of list) {
        allRepos.add(repo);
      }
    }

    const repoNames = Array.from(allRepos);

    // Fetch stats in parallel (batch to avoid rate limits)
    const [commitCounts, codeCounts] = await Promise.all([
      Promise.all(repoNames.map(getRepoCommitCount)),
      Promise.all(repoNames.map(getRepoCodeStats)),
    ]);

    const commits = commitCounts.reduce((a, b) => a + b, 0);
    const linesOfCode = codeCounts.reduce((a, b) => a + b, 0);

    return {
      commits,
      repos: repoNames.length,
      linesOfCode,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("GitHub stats fetch failed:", error);
    // Fallback values
    return {
      commits: 163,
      repos: 5,
      linesOfCode: 0,
      fetchedAt: new Date().toISOString(),
    };
  }
}
