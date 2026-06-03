"""Replace near-white backgrounds in product JPGs with site background #0a0a0c."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

BG = (10, 10, 12)
THRESHOLD = 228
CHROMA_MAX = 32


def replace_white_bg(src: Path, dst: Path) -> None:
    img = Image.open(src).convert("RGB")
    w, h = img.size
    pixels = img.load()
    out = Image.new("RGB", (w, h), BG)
    out_pixels = out.load()

    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            brightness = (r + g + b) / 3
            chroma = max(r, g, b) - min(r, g, b)
            if brightness >= THRESHOLD and chroma <= CHROMA_MAX:
                out_pixels[x, y] = BG
            elif brightness >= THRESHOLD - 18 and chroma <= CHROMA_MAX + 8:
                t = (brightness - (THRESHOLD - 18)) / 18
                t = max(0.0, min(1.0, t))
                out_pixels[x, y] = tuple(
                    int(BG[i] * t + (r, g, b)[i] * (1 - t)) for i in range(3)
                )
            else:
                out_pixels[x, y] = (r, g, b)

    out.save(dst, "PNG", optimize=True)
    print(f"Wrote {dst}")


def main() -> None:
    root = Path(__file__).resolve().parents[1] / "public" / "images" / "products"
    for name in ("clay-matte.jpg", "red.jpg"):
        src = root / name
        if not src.exists():
            print(f"Skip missing {src}")
            continue
        dst = root / (src.stem + ".png")
        replace_white_bg(src, dst)


if __name__ == "__main__":
    main()
