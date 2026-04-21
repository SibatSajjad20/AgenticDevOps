import os
import httpx
from crewai.tools import tool
from typing import Tuple, List

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
ALLOWED_EXTENSIONS = {".py", ".js", ".ts", ".tsx", ".jsx", ".md", ".json", ".yaml", ".yml", ".env.example"}
def _parse_owner_repo(repo_url: str) -> Tuple[str, str]:
    parts = repo_url.rstrip("/").split("/")
    return parts[-2], parts[-1]

def _get_all_files(owner: str, repo: str, path: str = "") -> List[dict]:
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    res = httpx.get(url, headers=HEADERS)
    res.raise_for_status()
    files = []
    for item in res.json():
        if item["type"] == "dir":
            files.extend(_get_all_files(owner, repo, item["path"]))
        elif any(item["name"].endswith(ext) for ext in ALLOWED_EXTENSIONS):
            files.append(item)
    return files

def fetch_repo_files(repo_url: str) -> dict:
    """Plain function used directly by main.py to scrape repo files."""
    owner, repo = _parse_owner_repo(repo_url)
    files = _get_all_files(owner, repo)
    result = {}
    for f in files:
        raw = httpx.get(f["download_url"], headers=HEADERS)
        result[f["path"]] = raw.text
    return result

@tool("GitHub Repo Scraper")
def scrape_github_repo(repo_url: str) -> dict:
    """Scrapes all relevant source files from a GitHub repository URL.
    Returns a dict mapping file_path -> file_content."""
    return fetch_repo_files(repo_url)
