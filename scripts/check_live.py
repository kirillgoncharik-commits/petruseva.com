#!/usr/bin/env python3
"""Smoke-test all approved live hero blocks after publication."""
import ast
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from pathlib import Path
import re
import sys
import time
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
source = ast.parse((ROOT / "scripts/check_copy.py").read_text(encoding="utf-8"))
approved = None
for node in source.body:
    if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "EXPECTED" for t in node.targets):
        approved = ast.literal_eval(node.value)
        break
if not isinstance(approved, dict):
    raise SystemExit("Unable to load approved hero copy")

BASE = "https://petruseva.com"
def plain(raw):
    return unescape(re.sub(r"<[^>]+>", "", raw)).strip()

def check_one(item):
    path, expected = item
    route = "/" if path == "index.html" else "/" + path.removesuffix("index.html")
    url = BASE + route
    reason = "No response"
    for attempt in range(6):
        try:
            request = Request(url, headers={"User-Agent": "PetrusevaSiteSmoke/1.0", "Cache-Control": "no-cache"})
            with urlopen(request, timeout=20) as response:
                if response.status != 200:
                    raise ValueError(f"HTTP {response.status}")
                doc = response.read().decode("utf-8")
            if re.search(r"\bEAGT\b", doc, flags=re.I):
                raise ValueError("misleading EAGT reference remains")
            hero = re.search(r'<section\s+class="(?:hero|page-hero)"[^>]*>([\s\S]*?)</section>', doc)
            if not hero:
                raise ValueError("hero missing")
            h1 = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", hero.group(1))
            lead = re.search(r'<p class="lead">([\s\S]*?)</p>', hero.group(1))
            actual = [plain(h1.group(1)) if h1 else None,
                      plain(lead.group(1)) if lead else None]
            if actual != expected:
                raise ValueError(f"expected {expected!r}; got {actual!r}")
            if re.search(r"выдохнуть|глубин|\bопору\b|пространств", plain(hero.group(1)), flags=re.I):
                raise ValueError("old metaphor appears in hero")
            return f"OK {url}"
        except Exception as exc:
            reason = str(exc)
            if attempt < 5:
                time.sleep(6)
    return f"FAIL {url}: {reason}"

with ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(check_one, approved.items()))
for result in results:
    print(result)
if any(result.startswith("FAIL") for result in results):
    sys.exit(1)
print(f"PASS: all {len(approved)} published pages match GitHub-approved hero text")
