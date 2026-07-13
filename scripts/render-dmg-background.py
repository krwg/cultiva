#!/usr/bin/env python3
"""Compose Apple-style DMG background from the existing Cultiva app icon."""

from __future__ import annotations

import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / 'build'
ICON_PATH = BUILD / 'icon.png'
OUT_PNG = BUILD / 'dmg-background-658.png'
OUT_TIFF = BUILD / 'background.tiff'

W, H = 658, 498
APP_X, APP_Y = 180, 220  # electron-builder: from bottom-left
APPS_X, APPS_Y = 478, 220
ICON_SIZE = 96

FONT_CANDIDATES = [
    '/System/Library/Fonts/SFNS.ttf',
    '/System/Library/Fonts/HelveticaNeue.ttc',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/Library/Fonts/Arial.ttf',
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_CANDIDATES:
        if not os.path.exists(path):
            continue
        try:
            index = 1 if bold and path.endswith('.ttc') else 0
            return ImageFont.truetype(path, size=size, index=index)
        except OSError:
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def bottom_to_top(y_bottom: int) -> int:
    return H - y_bottom


def vertical_gradient(img: Image.Image) -> None:
    px = img.load()
    top = (245, 245, 247)
    bottom = (255, 255, 255)
    for y in range(H):
        t = y / max(H - 1, 1)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)) + (255,)
        for x in range(W):
            px[x, y] = color


def paste_icon_centered(base: Image.Image, icon: Image.Image, cx: int, cy_top: int, size: int) -> None:
    icon = icon.convert('RGBA').resize((size, size), Image.Resampling.LANCZOS)
    x = cx - size // 2
    y = cy_top - size // 2
    base.paste(icon, (x, y), icon)


def draw_curved_arrow(draw: ImageDraw.ImageDraw, x1: int, y1: int, x2: int, y2: int) -> None:
    color = (174, 174, 178, 255)
    width = 2
    steps = 48
    mx = (x1 + x2) / 2
    my = min(y1, y2) - 42
    points = []
    for i in range(steps + 1):
        t = i / steps
        px = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t ** 2 * x2
        py = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t ** 2 * y2
        points.append((px, py))
    draw.line(points, fill=color, width=width, joint='curve')

    end = points[-1]
    prev = points[-2]
    angle = math.atan2(end[1] - prev[1], end[0] - prev[0])
    arrow_len = 10
    left = (
        end[0] - arrow_len * math.cos(angle - math.pi / 7),
        end[1] - arrow_len * math.sin(angle - math.pi / 7),
    )
    right = (
        end[0] - arrow_len * math.cos(angle + math.pi / 7),
        end[1] - arrow_len * math.sin(angle + math.pi / 7),
    )
    draw.polygon([end, left, right], fill=color)


def draw_applications_folder(base: Image.Image, cx: int, cy_top: int, size: int = 72) -> None:
    layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x0 = cx - size // 2
    y0 = cy_top - size // 2
    body = (232, 232, 237, 255)
    tab = (210, 210, 215, 255)
    stroke = (199, 199, 204, 255)
    tab_h = size // 4
    tab_w = size // 2
    draw.rounded_rectangle((x0, y0 + tab_h, x0 + size, y0 + size), radius=10, fill=body, outline=stroke, width=1)
    draw.rounded_rectangle((x0 + 8, y0, x0 + 8 + tab_w, y0 + tab_h + 4), radius=6, fill=tab, outline=stroke, width=1)
    base.alpha_composite(layer)


def main() -> None:
    if not ICON_PATH.exists():
        raise SystemExit(f'Missing app icon: {ICON_PATH}')

    img = Image.new('RGBA', (W, H))
    vertical_gradient(img)
    draw = ImageDraw.Draw(img)

    icon = Image.open(ICON_PATH)
    app_cy = bottom_to_top(APP_Y)
    apps_cy = bottom_to_top(APPS_Y)

    paste_icon_centered(img, icon, APP_X, app_cy, ICON_SIZE)
    draw_applications_folder(img, APPS_X, apps_cy, 72)
    draw_curved_arrow(draw, APP_X + ICON_SIZE // 2 + 8, app_cy, APPS_X - 40, apps_cy)

    title_font = load_font(30, bold=True)
    sub_font = load_font(15)
    label_font = load_font(12)

    title = 'Cultiva'
    subtitle = 'Grow your habits'
    apps_label = 'Applications'

    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_w = title_bbox[2] - title_bbox[0]
    draw.text(((W - title_w) / 2, H - 92), title, fill=(29, 29, 31), font=title_font)

    sub_bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    sub_w = sub_bbox[2] - sub_bbox[0]
    draw.text(((W - sub_w) / 2, H - 58), subtitle, fill=(134, 134, 139), font=sub_font)

    apps_bbox = draw.textbbox((0, 0), apps_label, font=label_font)
    apps_w = apps_bbox[2] - apps_bbox[0]
    draw.text((APPS_X - apps_w / 2, apps_cy + 46), apps_label, fill=(134, 134, 139), font=label_font)

    app_label = 'Cultiva'
    app_bbox = draw.textbbox((0, 0), app_label, font=label_font)
    app_w = app_bbox[2] - app_bbox[0]
    draw.text((APP_X - app_w / 2, app_cy + 56), app_label, fill=(134, 134, 139), font=label_font)

    BUILD.mkdir(parents=True, exist_ok=True)
    out_rgb = Image.new('RGB', (W, H), (255, 255, 255))
    out_rgb.paste(img, mask=img.split()[3])
    out_rgb.save(OUT_PNG, format='PNG', optimize=True)
    out_rgb.save(OUT_TIFF, format='TIFF', compression='tiff_lzw')
    print(f'[render-dmg-background] {OUT_PNG}')
    print(f'[render-dmg-background] {OUT_TIFF}')


if __name__ == '__main__':
    main()
