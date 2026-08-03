"""Generate public/sitemap-categorias.xml from category-slugs.ts"""
from __future__ import annotations

import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
text = (root / "src/lib/category-slugs.ts").read_text(encoding="utf-8")
part = text.split("CATEGORY_MENU_L1")[0]
ids = re.findall(r'"([a-z0-9_]+)"', part)
origin = "https://pedro13ma.github.io"
lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]
for s in ids:
    lines.extend(
        [
            "  <url>",
            f"    <loc>{origin}/categoria/{s}/</loc>",
            "    <changefreq>daily</changefreq>",
            "    <priority>0.7</priority>",
            "  </url>",
        ]
    )
lines.append("</urlset>")
(root / "public/sitemap-categorias.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
(root / "public/sitemap-landing.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    "</urlset>\n",
    encoding="utf-8",
)
print(f"wrote {len(ids)} category urls")
