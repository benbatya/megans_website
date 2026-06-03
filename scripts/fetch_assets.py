#!/usr/bin/env python3
"""Download images + videos listed in asset_manifest.json into ../img/ and ../video/.

Idempotent — skips files that already exist. Parallel (8 workers). Retries on 429/5xx.
Stdlib only.
"""
from __future__ import annotations

import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
WORKERS = 8
MAX_RETRIES = 3
RETRY_BACKOFF = 2.0  # seconds, doubled per retry


def fetch_one(url: str, dest: Path) -> tuple[str, int, str]:
    """Return (local_path, bytes_downloaded_or_existing, status_message)."""
    if dest.exists() and dest.stat().st_size > 0:
        return (str(dest), dest.stat().st_size, "skipped (already present)")

    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urlopen(req, timeout=60) as resp:
                with open(tmp, "wb") as f:
                    while True:
                        chunk = resp.read(64 * 1024)
                        if not chunk:
                            break
                        f.write(chunk)
            tmp.replace(dest)
            return (str(dest), dest.stat().st_size, "ok")
        except HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF * (2 ** (attempt - 1)))
                continue
            tmp.unlink(missing_ok=True)
            return (str(dest), 0, f"FAILED http {e.code}")
        except (URLError, TimeoutError) as e:
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF * (2 ** (attempt - 1)))
                continue
            tmp.unlink(missing_ok=True)
            return (str(dest), 0, f"FAILED {type(e).__name__}: {e}")

    tmp.unlink(missing_ok=True)
    return (str(dest), 0, "FAILED retries exhausted")


def human(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def main() -> int:
    project_root = Path(__file__).resolve().parent.parent
    manifest_path = project_root / "scripts" / "asset_manifest.json"
    manifest = json.loads(manifest_path.read_text())

    jobs: list[tuple[str, Path]] = []
    for entry in manifest.get("images", []) + manifest.get("videos", []):
        jobs.append((entry["url"], project_root / entry["local"]))

    print(f"Fetching {len(jobs)} assets with {WORKERS} workers...\n")

    total_bytes = 0
    failures = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(fetch_one, url, dest): (url, dest) for url, dest in jobs}
        for fut in as_completed(futures):
            dest_str, size, status = fut.result()
            total_bytes += size
            mark = "FAIL" if status.startswith("FAILED") else "ok  "
            if status.startswith("FAILED"):
                failures += 1
            print(f"  [{mark}] {human(size):>10}  {Path(dest_str).name}  ({status})")

    print(f"\nTotal: {human(total_bytes)} across {len(jobs)} files, {failures} failure(s).")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
