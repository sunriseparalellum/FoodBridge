import requests
from bs4 import BeautifulSoup

def fetch_og_metadata(url: str) -> dict:
    try:
        resp = requests.get(url, timeout=5, headers={"User-Agent": "Chrome/122.0.0.0 Safari/537.36, Mozilla/5.0"})

        soup = BeautifulSoup(resp.content, "html.parser")

        def meta(prop):
            tag = soup.find("meta", property=prop)
            return tag["content"] if tag and tag.has_attr("content") else ""

        title = meta("og:title") or (soup.title.string.strip() if soup.title and soup.title.string else "")
        return {
            "og_title": title,
            "og_description": meta("og:description"),
            "og_image": meta("og:image"),
        }
    except Exception:
        return {"og_title": "", "og_description": "", "og_image": ""}
