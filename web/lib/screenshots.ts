import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

export function screenshotExists(relPath: string): boolean {
  const normalized = relPath.startsWith("/") ? relPath.slice(1) : relPath;
  try {
    return fs.existsSync(path.join(PUBLIC_DIR, normalized));
  } catch {
    return false;
  }
}
