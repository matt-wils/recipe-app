#!/usr/bin/env python3
"""
One-off helper: download recipe photos from Wikipedia/Wikimedia Commons.

Each recipe slug is mapped to a Wikipedia article title; we take that article's
lead image (a Commons file with a known license), download a ~640px rendition
into public/recipe-photos/<slug>.<ext>, and record provenance + license in
public/recipe-photos/CREDITS.md so attribution is preserved.

Run:  python3 scripts/fetch-photos.py
This isn't part of the build — it's how the bundled placeholder→real photos were
sourced. Re-run it to refresh/add images, then reference <slug>.<ext> in
recipes.yaml.
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

UA = "recipe-app/1.0 (personal recipe PWA; contact via github.com/matt-wils/recipe-app)"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "recipe-photos")

# slug -> Wikipedia article title whose lead image represents the dish.
MANIFEST = {
    # existing example recipes
    "shredded-chicken-beans-rice": "Arroz con pollo",
    "sheet-pan-sausage-peppers": "Italian sausage",
    "salmon-broccoli-traybake": "Salmon as food",
    "oatmeal-banana-pb": "Oatmeal",
    "ground-beef-tacos": "Taco",
    "pesto-pasta-peas": "Pesto",
    "greek-yogurt-bowl": "Strained yogurt",
    "slow-cooker-pulled-pork": "Pulled pork",
    # gerd-friendly / simple
    "ginger-chicken-congee": "Congee",
    "tamagoyaki": "Tamagoyaki",
    "banana-oat-pancakes": "Pancake",
    "melon-cottage-cheese": "Fruit salad",
    "chicken-rice-soup": "Chicken soup",
    "cobb-salad": "Cobb salad",
    "steamed-cod-bok-choy": "Fish as food",
    # chinese
    "mapo-tofu": "Mapo tofu",
    "egg-fried-rice": "Fried rice",
    # japanese
    "salmon-teriyaki": "Teriyaki",
    "miso-soup": "Miso soup",
    "tonkatsu": "Tonkatsu",
    # korean
    "bibimbap": "Bibimbap",
    "bulgogi": "Bulgogi",
    "kimchi-fried-rice": "Kimchi fried rice",
    # german
    "pork-schnitzel": "Schnitzel",
    "bratwurst-sauerkraut": "Bratwurst",
    "spaetzle": "Spätzle",
    # mexican
    "chicken-fajitas": "Fajita",
    "huevos-rancheros": "Huevos rancheros",
    # surprises
    "pad-thai": "Pad thai",
    "shakshuka": "Shakshouka",
    "butter-chicken": "Butter chicken",
    "margherita-pizza": "Pizza Margherita",
}


def get(url):
    # Wikimedia rate-limits bursts (HTTP 429); back off and retry politely.
    delay = 3
    for attempt in range(5):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 4:
                time.sleep(delay)
                delay *= 2
                continue
            raise


def get_json(url):
    return json.loads(get(url).decode("utf-8"))


def summary(title):
    url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title)
    return get_json(url)


def commons_filename(thumb_url):
    # .../commons/thumb/4/44/Dolsot-bibimbap.jpg/640px-... -> Dolsot-bibimbap.jpg
    m = re.search(r"/commons/(?:thumb/)?[0-9a-f]/[0-9a-f]{2}/([^/]+)", thumb_url)
    return urllib.parse.unquote(m.group(1)) if m else None


def license_info(filename):
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&format=json"
        "&prop=imageinfo&iiprop=extmetadata&titles=File:"
        + urllib.parse.quote(filename)
    )
    try:
        data = get_json(url)
        page = next(iter(data["query"]["pages"].values()))
        ext = page["imageinfo"][0]["extmetadata"]

        def field(k):
            return re.sub(r"<[^>]+>", "", ext.get(k, {}).get("value", "")).strip()

        return field("LicenseShortName") or "see source", field("Artist") or "unknown"
    except Exception:
        return "see source", "unknown"


def main():
    os.makedirs(OUT, exist_ok=True)
    credits = []
    failures = []
    for slug, title in MANIFEST.items():
        try:
            s = summary(title)
            thumb = (s.get("thumbnail") or {}).get("source") or (
                s.get("originalimage") or {}
            ).get("source")
            if not thumb:
                raise RuntimeError("no image in summary")
            big = re.sub(r"/\d+px-", "/640px-", thumb)
            try:
                blob = get(big)
            except Exception:
                blob = get(thumb)  # fall back to original size
            cf = commons_filename(thumb) or ""
            # Extension from the real Commons filename (e.g. Bibimbap.jpg -> jpg).
            ext = os.path.splitext(cf)[1].lstrip(".").lower() or "jpg"
            ext = {"jpeg": "jpg"}.get(ext, ext)
            fname = f"{slug}.{ext}"
            with open(os.path.join(OUT, fname), "wb") as f:
                f.write(blob)
            time.sleep(1.5)  # be gentle between dishes
            lic, artist = license_info(cf) if cf else ("see source", "unknown")
            page_url = s.get("content_urls", {}).get("desktop", {}).get("page", "")
            credits.append((fname, title, page_url, lic, artist))
            print(f"  ok  {fname:34} <- {title}  [{lic}]")
        except Exception as e:
            failures.append((slug, title, str(e)))
            print(f"  !!  {slug:34} <- {title}  FAILED: {e}", file=sys.stderr)

    with open(os.path.join(OUT, "CREDITS.md"), "w") as f:
        f.write("# Photo credits\n\n")
        f.write(
            "Recipe photos are lead images from the linked Wikipedia articles, "
            "hosted on Wikimedia Commons. Each is reused under the license noted "
            "below (most are Creative Commons; see the source page for full terms "
            "and the original author). Generated by `scripts/fetch-photos.py`.\n\n"
        )
        f.write("| File | Dish | Source | License | Author |\n")
        f.write("| --- | --- | --- | --- | --- |\n")
        for fname, title, url, lic, artist in sorted(credits):
            artist = artist.replace("|", "/")[:60]
            f.write(f"| `{fname}` | {title} | [{title}]({url}) | {lic} | {artist} |\n")

    print(f"\nDownloaded {len(credits)}, failed {len(failures)}")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
