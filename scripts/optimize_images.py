"""Convert images to WebP with quality optimization."""
from pathlib import Path
from PIL import Image

IMG_DIR = Path(__file__).parent.parent / "img"
ASSETS_DIR = IMG_DIR / "portfolio"


def to_webp(src: Path, quality: int, max_width: int) -> None:
    """Save src as WebP next to it, downscaling to max_width when needed."""
    dst = src.with_suffix(".webp")
    with Image.open(src) as im:
        if im.width > max_width:
            ratio = max_width / im.width
            new_size = (max_width, int(im.height * ratio))
            im = im.resize(new_size, Image.LANCZOS)
        im.save(dst, "WEBP", quality=quality, method=6)
    src_size = src.stat().st_size
    dst_size = dst.stat().st_size
    savings = (1 - dst_size / src_size) * 100
    print(f"{src.name} -> {dst.name}: {src_size//1024}KB -> {dst_size//1024}KB ({savings:.0f}% smaller)")


# Portfolio images: lossy, q=80, max width 1200
for src in IMG_DIR.glob("portfolio*.jpg"):
    to_webp(src, quality=82, max_width=1200)

# Profile picture: q=85
to_webp(IMG_DIR / "perfil.png", quality=85, max_width=800)

# Project screenshot (Swagger): q=82, max width 1200
to_webp(IMG_DIR / "profitpos-swagger.png", quality=82, max_width=1200)

print("\nDone!")
