const REPO = "adamclark64/ghostty-config-editor";
const RELEASES_URL = `https://github.com/${REPO}/releases`;
const LATEST_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

export type LatestRelease = {
  version: string;
  tagName: string;
  releasePageUrl: string;
  aarch64DmgUrl: string | null;
  x64DmgUrl: string | null;
  publishedAt: string | null;
};

type GitHubAsset = {
  name: string;
  browser_download_url: string;
};

type GitHubRelease = {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  assets: GitHubAsset[];
};

export const fallbackRelease: LatestRelease = {
  version: "latest",
  tagName: "latest",
  releasePageUrl: `${RELEASES_URL}/latest`,
  aarch64DmgUrl: null,
  x64DmgUrl: null,
  publishedAt: null,
};

export async function getLatestRelease(): Promise<LatestRelease> {
  try {
    const res = await fetch(LATEST_URL, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return fallbackRelease;

    const data = (await res.json()) as GitHubRelease;
    const findDmg = (suffix: string) =>
      data.assets.find((a) => a.name.toLowerCase().endsWith(suffix))
        ?.browser_download_url ?? null;

    const tagName = data.tag_name ?? "latest";
    return {
      version: tagName.replace(/^v/, "") || "latest",
      tagName,
      releasePageUrl: data.html_url ?? `${RELEASES_URL}/${tagName}`,
      aarch64DmgUrl: findDmg("_aarch64.dmg"),
      x64DmgUrl: findDmg("_x64.dmg"),
      publishedAt: data.published_at,
    };
  } catch {
    return fallbackRelease;
  }
}

export const repoUrl = `https://github.com/${REPO}`;
export const releasesUrl = RELEASES_URL;
