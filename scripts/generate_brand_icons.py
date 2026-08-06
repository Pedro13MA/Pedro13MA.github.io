"""Generate Lymiar brand masters + favicons / PWA / OG from Desktop/LYMIAR kit.

Sources (Desktop/LYMIAR):
  1.png — primary vertical (social, OG, hero)
  2.png — square with breathing room (profile, apple-touch)
  3.png — horizontal (navbar, footer, email)
  4.png — isotype / mark (app icon, favicon small, notification)
"""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
BRAND = PUBLIC / "brand"
ICONS = PUBLIC / "icons"

# Prefer Desktop kit; fall back to already-copied masters in public/brand/src.
DESKTOP_KIT = Path.home() / "Desktop" / "LYMIAR"
KIT_FALLBACK = BRAND / "src"


def content_bbox(im: Image.Image, white_thr: int = 248) -> tuple[int, int, int, int]:
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            if r > white_thr and g > white_thr and b > white_thr:
                continue
            found = True
            minx = min(minx, x)
            miny = min(miny, y)
            maxx = max(maxx, x)
            maxy = max(maxy, y)
    if not found:
        return (0, 0, w, h)
    return (minx, miny, maxx + 1, maxy + 1)


def crop_content(im: Image.Image, pad_ratio: float = 0.06) -> Image.Image:
    """Crop to content with proportional padding (white)."""
    box = content_bbox(im)
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    pad = int(max(bw, bh) * pad_ratio)
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    cropped = im.crop((x0, y0, x1, y1))
    # Flatten onto white for predictable compositing
    bg = Image.new("RGBA", cropped.size, (255, 255, 255, 255))
    bg.alpha_composite(cropped)
    return bg


def fit_square(im: Image.Image, size: int, bg=(255, 255, 255, 255)) -> Image.Image:
    """Contain image in a square canvas (breathing room preserved)."""
    canvas = Image.new("RGBA", (size, size), bg)
    copy = im.copy()
    copy.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas.paste(
        copy,
        ((size - copy.width) // 2, (size - copy.height) // 2),
        copy,
    )
    return canvas


def resolve_source(name: str) -> Path:
    for base in (DESKTOP_KIT, KIT_FALLBACK):
        p = base / name
        if p.is_file():
            return p
    raise FileNotFoundError(
        f"Missing {name}. Place kit in {DESKTOP_KIT} or {KIT_FALLBACK}"
    )


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    ICONS.mkdir(parents=True, exist_ok=True)
    KIT_FALLBACK.mkdir(parents=True, exist_ok=True)

    mapping = {
        "1.png": "lymiar-logo-primary.png",
        "2.png": "lymiar-logo-square.png",
        "3.png": "lymiar-logo-horizontal.png",
        "4.png": "lymiar-mark.png",
    }

    cropped: dict[str, Image.Image] = {}
    for src_name, dest_name in mapping.items():
        src = resolve_source(src_name)
        # Keep a copy of the kit inside the repo for reproducible builds
        shutil.copy2(src, KIT_FALLBACK / src_name)
        full = Image.open(src).convert("RGBA")
        # Full canvas masters (as delivered)
        full.save(BRAND / dest_name.replace(".png", "-full.png"), optimize=True)
        cut = crop_content(full, pad_ratio=0.08 if src_name != "2.png" else 0.12)
        cut.save(BRAND / dest_name, optimize=True)
        cropped[dest_name] = cut
        print(f"master {dest_name} {cut.size} from {src}")

    primary = cropped["lymiar-logo-primary.png"]
    square = cropped["lymiar-logo-square.png"]
    horizontal = cropped["lymiar-logo-horizontal.png"]
    mark = cropped["lymiar-mark.png"]

    # Back-compat path used across the app / JSON-LD
    primary.save(BRAND / "lymiar-logotipo.png", optimize=True)
    mark.save(BRAND / "lymiar-favicon.png", optimize=True)

    # Favicons: isotype (readable at 16–32)
    for size, name in [(16, "favicon-16x16.png"), (32, "favicon-32x32.png")]:
        fit_square(mark, size).convert("RGBA").save(PUBLIC / name)

    ico_imgs = [fit_square(mark, s) for s in (16, 32, 48)]
    ico_imgs[0].save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(i.width, i.height) for i in ico_imgs],
        append_images=ico_imgs[1:],
    )

    # Apple touch / profile-like: square with breathing room (2.png)
    fit_square(square, 180).save(PUBLIC / "apple-touch-icon.png")

    # PWA / app icons: isotype (4.png)
    for size in (192, 512):
        out = fit_square(mark, size)
        out.save(PUBLIC / f"android-chrome-{size}x{size}.png")
        out.save(ICONS / f"android-chrome-{size}x{size}.png")

    # Open Graph 1200×630 — primary vertical centered
    og_w, og_h = 1200, 630
    og = Image.new("RGB", (og_w, og_h), (255, 255, 255))
    hero = primary.copy()
    hero.thumbnail((560, 560), Image.Resampling.LANCZOS)
    # paste with alpha
    layer = Image.new("RGBA", (og_w, og_h), (255, 255, 255, 255))
    layer.paste(
        hero,
        ((og_w - hero.width) // 2, (og_h - hero.height) // 2),
        hero,
    )
    layer.convert("RGB").save(PUBLIC / "og-default.png", optimize=True)

    # Navbar-ready horizontal at common heights (optional helpers)
    for h in (40, 48, 64):
        ratio = horizontal.width / horizontal.height
        w = int(round(h * ratio))
        horizontal.resize((w, h), Image.Resampling.LANCZOS).save(
            BRAND / f"lymiar-logo-horizontal-{h}.png",
            optimize=True,
        )

    for rel in [
        "brand/lymiar-logo-primary.png",
        "brand/lymiar-logo-square.png",
        "brand/lymiar-logo-horizontal.png",
        "brand/lymiar-mark.png",
        "brand/lymiar-logotipo.png",
        "brand/lymiar-favicon.png",
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
        "og-default.png",
        "icons/android-chrome-192x192.png",
        "icons/android-chrome-512x512.png",
    ]:
        fp = PUBLIC / rel
        print(f"OK {rel} ({fp.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
