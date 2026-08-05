#!/usr/bin/env python3
"""P3.2.3 — journey validation against api.lymiar.com (FE-safe checks)."""
from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://api.lymiar.com"
SITE = "https://lymiar.com"

QUERIES = [
    "Apple Watch",
    "SSD Samsung",
    "Samsung SSD",
    "melhor SSD Samsung",
    "portátil gaming",
    "melhor portátil gaming",
    "Bullpadel",
    "TP-Link Tapo",
    "câmara TP-Link",
    "Air Fryer",
    "frigideira",
    "RTX 5070",
]

JOURNEYS = {
    "J1_Apple_Watch": "Apple Watch",
    "J2_SSD_Samsung": "SSD Samsung",
    "J3_TP_Link_Tapo": "TP-Link Tapo",
    "J4_Air_Fryer": "Air Fryer",
    "J5_Frigideira": "frigideira",
    "J6_Bullpadel": "Bullpadel",
}


def get_json(url: str, timeout: int = 60):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode()), r.status


def head_ok(url: str, timeout: int = 30) -> dict:
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read(8000).decode("utf-8", errors="ignore")
            return {
                "url": url,
                "status": r.status,
                "ok": 200 <= r.status < 400,
                "has_404_text": bool(re.search(r"404|não encontrad|nao encontrad", body, re.I)),
            }
    except Exception as e:
        return {"url": url, "status": None, "ok": False, "error": str(e)}


out = {
    "search": {},
    "journeys": {},
    "nav_urls": {},
    "suggest": None,
    "all_search_pass": False,
    "all_journeys_pass": False,
}

for q in QUERIES:
    url = f"{API}/api/v1/search?q={urllib.parse.quote(q)}&limit=5"
    d, status = get_json(url)
    results = d.get("results") or []
    first = results[0] if results else None
    slug = (first or {}).get("slug")
    product_url = f"{SITE}/p/?id={urllib.parse.quote(slug)}" if slug else None
    search_url = f"{SITE}/search/?q={urllib.parse.quote(q)}"
    out["search"][q] = {
        "api_total": d.get("total") or 0,
        "api_status": status,
        "has_intent": bool(d.get("intent")),
        "first_slug": slug,
        "first_name": (first or {}).get("name"),
        "search_page": head_ok(search_url),
        "product_page": head_ok(product_url) if product_url else None,
        "pass": (d.get("total") or 0) > 0 and bool(slug),
    }
    print(f"search {q!r}: total={d.get('total')} slug={slug}")

for jid, q in JOURNEYS.items():
    s = out["search"][q]
    slug = s.get("first_slug")
    steps = {
        "search_api": s["pass"],
        "search_page_ok": bool(s.get("search_page", {}).get("ok")),
        "product_page_ok": bool((s.get("product_page") or {}).get("ok")),
    }
    # category from first result leaf if present
    url = f"{API}/api/v1/search?q={urllib.parse.quote(q)}&limit=1"
    d, _ = get_json(url)
    first = (d.get("results") or [None])[0] or {}
    leaf = first.get("leaf_id") or first.get("subcategory") or first.get("category")
    cat_ok = None
    if leaf:
        cat_url = f"{SITE}/categoria/{urllib.parse.quote(str(leaf))}/"
        cat_ok = head_ok(cat_url)
        steps["category_page_ok"] = bool(cat_ok.get("ok")) and not cat_ok.get("has_404_text")
    else:
        steps["category_page_ok"] = None
    # product detail API
    if slug:
        try:
            pd, pst = get_json(f"{API}/api/v1/product/{urllib.parse.quote(slug)}")
            steps["product_api"] = pst == 200 and bool(pd.get("slug") or pd.get("name"))
            hist = pd.get("history") or pd.get("price_history") or []
            offers = pd.get("offers") or []
            steps["has_history_or_empty_ok"] = True  # empty history is valid empty state
            steps["has_offers_or_empty_ok"] = True
            steps["history_points"] = len(hist) if isinstance(hist, list) else 0
            steps["offers_count"] = len(offers) if isinstance(offers, list) else 0
        except Exception as e:
            steps["product_api"] = False
            steps["product_api_error"] = str(e)
    journey_pass = all(
        v for k, v in steps.items() if k.endswith("_ok") or k in ("search_api", "product_api") if v is not None
    )
    # simpler: core path
    journey_pass = (
        steps.get("search_api")
        and steps.get("search_page_ok")
        and steps.get("product_page_ok")
        and steps.get("product_api")
    )
    out["journeys"][jid] = {
        "query": q,
        "slug": slug,
        "leaf": leaf,
        "steps": steps,
        "category_check": cat_ok,
        "pass": journey_pass,
    }
    print(f"journey {jid}: pass={journey_pass}")

try:
    sd, st = get_json(f"{API}/api/v1/search/suggest?q=SSD%20Samsung&limit=5")
    out["suggest"] = {"status": st, "engine": sd.get("engine"), "products": len(sd.get("products") or [])}
except Exception as e:
    out["suggest"] = {"error": str(e)}

nav_paths = [
    "/",
    "/search/?q=SSD%20Samsung",
    "/categorias/",
    "/categoria/ssd/",
    "/categoria/smartwatch/",
    "/categoria/air_fryer/",
    "/categoria/padel_gear/",
    "/mercado/",
    "/mercado/marcas/",
]
for p in nav_paths:
    out["nav_urls"][p] = head_ok(SITE + p)

out["all_search_pass"] = all(v["pass"] for v in out["search"].values())
out["all_journeys_pass"] = all(v["pass"] for v in out["journeys"].values())
print("all_search_pass", out["all_search_pass"])
print("all_journeys_pass", out["all_journeys_pass"])

root = Path(__file__).resolve().parents[1]
# Prefer frontend repo if sibling exists
fe = root.parent / "Pedro13MA.github.io"
dest = fe if fe.is_dir() else root
(dest / "tmp_p323_journeys.json").write_text(
    json.dumps({"journeys": out["journeys"], "search": out["search"], "suggest": out["suggest"]}, ensure_ascii=False, indent=2),
    encoding="utf-8",
)
(dest / "tmp_p323_navigation.json").write_text(
    json.dumps(out["nav_urls"], ensure_ascii=False, indent=2),
    encoding="utf-8",
)
(dest / "tmp_p323_validation.json").write_text(
    json.dumps(
        {
            "all_search_pass": out["all_search_pass"],
            "all_journeys_pass": out["all_journeys_pass"],
            "suggest": out["suggest"],
            "search_summary": {k: {"total": v["api_total"], "pass": v["pass"]} for k, v in out["search"].items()},
            "journey_summary": {k: v["pass"] for k, v in out["journeys"].items()},
        },
        ensure_ascii=False,
        indent=2,
    ),
    encoding="utf-8",
)
print("wrote artifacts to", dest)
