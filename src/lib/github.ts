const REPO = "sophiegalante/family-tree-website";
const API = "https://api.github.com";

export interface GitHubUpdate {
  date: string;
  text: string;
  url: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export async function fetchRecentUpdates(limit = 5): Promise<GitHubUpdate[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const [commitsRes, prsRes] = await Promise.all([
    fetch(`${API}/repos/${REPO}/commits?per_page=${limit}`, { headers }),
    fetch(`${API}/repos/${REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=${limit}`, { headers }),
  ]);

  const updates: GitHubUpdate[] = [];

  if (prsRes.ok) {
    const prs: any[] = await prsRes.json();
    for (const pr of prs.filter((p) => p.merged_at)) {
      updates.push({
        date: formatDate(pr.merged_at),
        text: pr.title,
        url: pr.html_url,
      });
    }
  }

  if (commitsRes.ok) {
    const commits: any[] = await commitsRes.json();
    for (const c of commits) {
      const message = c.commit.message.split("\n")[0];
      updates.push({
        date: formatDate(c.commit.committer.date),
        text: message,
        url: c.html_url,
      });
    }
  }

  // Deduplicate by url and sort newest first, then take top `limit`
  const seen = new Set<string>();
  return updates
    .filter((u) => { if (seen.has(u.url)) return false; seen.add(u.url); return true; })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
