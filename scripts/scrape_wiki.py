"""Refresh craft data from the NationsGlory Dark Fandom wiki.

Usage: python3 scripts/scrape_wiki.py
Writes to data/crafts.json (merged with any user-added entries marked source='user').
"""
import json
import os
import re
import sys
import unicodedata
import urllib.parse
import urllib.request

BASE = "https://nationsglory-dark.fandom.com/fr"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(ROOT, "data", "raw")
OUT = os.path.join(ROOT, "data", "crafts.json")

CATEGORIES = {
    "Crafts": ("crafts-de-base", "Crafts de base"),
    "Armes_Communes": ("armes-communes", "Armes Communes"),
    "Armes_Peu_Communes": ("armes-peu-communes", "Armes Peu Communes"),
    "Armures": ("armures", "Armures"),
    "Outils": ("outils", "Outils"),
}


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^\w\s-]", "", s).strip().lower()
    return re.sub(r"[\s_]+", "-", s)


def fetch(page):
    url = f"{BASE}/api.php?action=parse&page={urllib.parse.quote(page)}&format=json&prop=wikitext"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.loads(r.read())
        return data.get("parse", {}).get("wikitext", {}).get("*", "")


def parse_wikitext(text, cat_slug, cat_name):
    title_re = re.compile(r"=+\s*'{3}(.+?)'{3}\s*=+", re.DOTALL)
    parts = title_re.split(text)
    crafts = []
    for i in range(1, len(parts), 2):
        name = re.sub(r"\s+", " ", parts[i]).strip()
        body = parts[i + 1] if i + 1 < len(parts) else ""
        if not name or "CATÉGORIE" in name.upper():
            continue
        img_match = re.search(r"\[\[Fichier:([^|\]]+)", body)
        image = img_match.group(1).strip() if img_match else None
        ingredients = []
        for line in body.split("\n"):
            line = line.strip()
            m = re.match(r"♦\s*(\d+)\s*x\s*(.+)", line)
            if m:
                qty = int(m.group(1))
                ing = re.sub(r"<[^>]+>", "", m.group(2)).strip("'\" ")
                ing = re.sub(r"\s+", " ", ing)
                ingredients.append({"qty": qty, "name": ing})
        crafts.append({
            "id": f"{cat_slug}-{slugify(name)}",
            "name": name,
            "category": cat_slug,
            "categoryName": cat_name,
            "image": image,
            "ingredients": ingredients,
            "source": "wiki",
        })
    return crafts


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    os.makedirs(RAW_DIR, exist_ok=True)

    existing_user = []
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8") as f:
            for c in json.load(f):
                if c.get("source") == "user":
                    existing_user.append(c)

    wiki_crafts = []
    for page, (cat_slug, cat_name) in CATEGORIES.items():
        try:
            wt = fetch(page)
            with open(os.path.join(RAW_DIR, f"{page}.txt"), "w", encoding="utf-8") as f:
                f.write(wt)
            cs = parse_wikitext(wt, cat_slug, cat_name)
            print(f"{page}: {len(cs)}")
            wiki_crafts.extend(cs)
        except Exception as e:
            print(f"FAIL {page}: {e}")

    all_crafts = wiki_crafts + existing_user
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(all_crafts, f, indent=2, ensure_ascii=False)
    print(f"\nTotal: {len(all_crafts)} ({len(wiki_crafts)} wiki + {len(existing_user)} user)")


if __name__ == "__main__":
    main()
