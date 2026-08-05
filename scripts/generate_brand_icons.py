"""Generate Lymiar favicons / PWA / OG from brand logotipo."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
BRAND = PUBLIC / "brand" / "lymiar-logotipo.png"
ICONS = PUBLIC / "icons"


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)
    img = Image.open(BRAND).convert("RGBA")
    print("source", img.size)

    def square(size: int) -> Image.Image:
        return img.resize((size, size), Image.Resampling.LANCZOS)

    square(16).save(PUBLIC / "favicon-16x16.png")
    square(32).save(PUBLIC / "favicon-32x32.png")
    square(180).save(PUBLIC / "apple-touch-icon.png")
    square(192).save(ICONS / "android-chrome-192x192.png")
    square(512).save(ICONS / "android-chrome-512x512.png")
    square(192).save(PUBLIC / "android-chrome-192x192.png")
    square(512).save(PUBLIC / "android-chrome-512x512.png")

    ico_imgs = [square(16), square(32), square(48)]
    ico_imgs[0].save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(i.width, i.height) for i in ico_imgs],
        append_images=ico_imgs[1:],
    )

    og_w, og_h = 1200, 630
    bg = img.getpixel((8, 8))[:3]
    og = Image.new("RGB", (og_w, og_h), bg)
    mark = square(420)
    og.paste(mark, ((og_w - mark.width) // 2, (og_h - mark.height) // 2), mark)
    og.save(PUBLIC / "og-default.png", optimize=True)

    for rel in [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
        "og-default.png",
        "brand/lymiar-logotipo.png",
        "icons/android-chrome-192x192.png",
        "icons/android-chrome-512x512.png",
    ]:
        fp = PUBLIC / rel
        print(f"OK {rel} ({fp.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
