"""Audit typed_attributes coverage by leaf — FASE 7.14."""
from __future__ import annotations

import json
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path

DB = Path("/opt/limiar/limiar.db")
if not DB.exists():
    DB = Path("limiar.db")

db = sqlite3.connect(str(DB))
db.row_factory = sqlite3.Row
cols = {r[1] for r in db.execute("PRAGMA table_info(products)")}
leaf_col = "leaf_id" if "leaf_id" in cols else None
typed_col = "typed_attributes" if "typed_attributes" in cols else None
print("leaf_col", leaf_col, "typed_col", typed_col)

TARGET_ALIASES = {
    "cpu": "cpu",
    "processor": "cpu",
    "motherboard": "motherboard",
    "mobos": "motherboard",
    "ram": "ram",
    "memory": "ram",
    "gpu": "gpu",
    "graphics": "gpu",
    "ssd": "ssd",
    "nvme": "ssd",
    "psu": "psu",
    "fonte": "psu",
    "power_supply": "psu",
    "case": "case",
    "caixa": "case",
    "chassis": "case",
    "cooler": "cooler",
    "cooling": "cooler",
}


def norm_leaf(raw: str | None) -> str:
    s = (raw or "unknown").lower().strip()
    return TARGET_ALIASES.get(s, s)


all_by_leaf: Counter[str] = Counter()
if leaf_col:
    for r in db.execute(f"SELECT {leaf_col} AS leaf, COUNT(*) c FROM products GROUP BY 1"):
        all_by_leaf[norm_leaf(r["leaf"])] += r["c"]

by_leaf_n: Counter[str] = Counter()
by_leaf_keys: dict[str, Counter[str]] = defaultdict(Counter)
examples: dict[str, set[str]] = defaultdict(set)

if typed_col:
    q = f"SELECT {leaf_col or 'NULL'} AS leaf, {typed_col} AS typed FROM products"
    for r in db.execute(q):
        raw = r["typed"]
        if raw is None:
            continue
        if isinstance(raw, str) and raw.strip() in ("", "{}", "null", "NULL"):
            continue
        try:
            data = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            continue
        if not isinstance(data, dict) or not data:
            continue
        leaf = norm_leaf(r["leaf"] if leaf_col else None)
        by_leaf_n[leaf] += 1
        for k, v in data.items():
            if v is None:
                continue
            if isinstance(v, str) and not v.strip():
                continue
            by_leaf_keys[leaf][k] += 1
            key = f"{leaf}:{k}"
            if len(examples[key]) < 4:
                examples[key].add(str(v)[:48])

FOCUS = ("cpu", "motherboard", "ram", "gpu", "ssd", "psu", "case", "cooler")
report = {}
for leaf in FOCUS:
    total = all_by_leaf.get(leaf, 0)
    with_typed = by_leaf_n.get(leaf, 0)
    keys = by_leaf_keys.get(leaf, Counter())
    report[leaf] = {
        "products": total,
        "with_typed": with_typed,
        "typed_pct": round(100 * with_typed / max(total, 1), 1) if total else 0.0,
        "attrs": {
            k: {
                "n": n,
                "pct_of_typed": round(100 * n / max(with_typed, 1), 1),
                "pct_of_leaf": round(100 * n / max(total, 1), 1) if total else 0.0,
                "examples": sorted(examples[f"{leaf}:{k}"]),
            }
            for k, n in keys.most_common(50)
        },
    }

out = {
    "db": str(DB),
    "focus": report,
    "other_leaves_with_typed": {
        k: by_leaf_n[k]
        for k in sorted(by_leaf_n, key=lambda x: -by_leaf_n[x])
        if k not in FOCUS
    }[:30]
    if False
    else {
        k: by_leaf_n[k]
        for k, _ in sorted(by_leaf_n.items(), key=lambda x: -x[1])
        if k not in FOCUS
    },
}
print(json.dumps(out, ensure_ascii=False, indent=2))
