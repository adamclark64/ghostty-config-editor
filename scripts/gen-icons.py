#!/usr/bin/env python3
"""Generate placeholder app icons using only the Python standard library.

Produces a solid-color 1024x1024 master PNG with a centered "G" glyph
drawn via a bitmap. From that master, macOS `sips` + `iconutil` create the
other sizes. Replace later with a real icon via `pnpm tauri icon <png>`.
"""
import struct
import zlib
import os
import subprocess
import sys

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src-tauri", "icons")
os.makedirs(OUT_DIR, exist_ok=True)

# Simple 8x8 bitmap glyph for a "G" — scaled up per-pixel in the output.
GLYPH = [
    " ######",
    "##    #",
    "#      ",
    "#   ###",
    "#    ##",
    "#    ##",
    "##   ##",
    " ######",
]
GLYPH_W = 7
GLYPH_H = 8

BG = (38, 30, 11)          # ghostty dark bg from your config
FG = (255, 135, 0)         # ghostty orange

def write_png(path: str, width: int, height: int, pixels: bytes) -> None:
    """Write an RGBA PNG. `pixels` is width*height*4 bytes."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    # Raw scanlines with filter byte 0 prepended to each row.
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(pixels[y * stride : (y + 1) * stride])

    ihdr = struct.pack(
        ">IIBBBBB",
        width, height,
        8,     # bit depth
        6,     # color type RGBA
        0, 0, 0
    )
    idat = zlib.compress(bytes(raw), 9)

    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", idat))
        f.write(chunk(b"IEND", b""))


def render_master(size: int = 1024) -> bytes:
    """Render a solid-background square with a centered G glyph."""
    px = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            i = (y * size + x) * 4
            px[i], px[i+1], px[i+2], px[i+3] = BG[0], BG[1], BG[2], 255

    # Glyph drawing: each cell = size/16 px on a side, centered in a 8x8 grid.
    cell = size // 16
    glyph_px_w = cell * GLYPH_W
    glyph_px_h = cell * GLYPH_H
    x0 = (size - glyph_px_w) // 2
    y0 = (size - glyph_px_h) // 2
    for gy, row in enumerate(GLYPH):
        for gx, ch in enumerate(row):
            if ch == "#":
                for py in range(cell):
                    for pix in range(cell):
                        X = x0 + gx * cell + pix
                        Y = y0 + gy * cell + py
                        i = (Y * size + X) * 4
                        px[i], px[i+1], px[i+2], px[i+3] = FG[0], FG[1], FG[2], 255
    return bytes(px)


def main() -> int:
    master_path = os.path.join(OUT_DIR, "_master_1024.png")
    master = render_master(1024)
    write_png(master_path, 1024, 1024, master)

    # macOS-only tooling: sips for resize, iconutil for .icns.
    sips = "sips"
    def resize(out: str, size: int) -> None:
        subprocess.check_call(
            [sips, "-z", str(size), str(size), master_path, "--out", out],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    resize(os.path.join(OUT_DIR, "32x32.png"), 32)
    resize(os.path.join(OUT_DIR, "128x128.png"), 128)
    resize(os.path.join(OUT_DIR, "128x128@2x.png"), 256)
    resize(os.path.join(OUT_DIR, "icon.png"), 512)

    # Build .icns via iconutil.
    iconset_dir = os.path.join(OUT_DIR, "AppIcon.iconset")
    os.makedirs(iconset_dir, exist_ok=True)
    resize(os.path.join(iconset_dir, "icon_16x16.png"), 16)
    resize(os.path.join(iconset_dir, "icon_16x16@2x.png"), 32)
    resize(os.path.join(iconset_dir, "icon_32x32.png"), 32)
    resize(os.path.join(iconset_dir, "icon_32x32@2x.png"), 64)
    resize(os.path.join(iconset_dir, "icon_128x128.png"), 128)
    resize(os.path.join(iconset_dir, "icon_128x128@2x.png"), 256)
    resize(os.path.join(iconset_dir, "icon_256x256.png"), 256)
    resize(os.path.join(iconset_dir, "icon_256x256@2x.png"), 512)
    resize(os.path.join(iconset_dir, "icon_512x512.png"), 512)
    # Master is already 1024
    import shutil
    shutil.copyfile(master_path, os.path.join(iconset_dir, "icon_512x512@2x.png"))

    subprocess.check_call(
        ["iconutil", "-c", "icns", iconset_dir, "-o", os.path.join(OUT_DIR, "icon.icns")]
    )
    shutil.rmtree(iconset_dir)
    os.remove(master_path)

    print(f"Icons generated in {OUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
