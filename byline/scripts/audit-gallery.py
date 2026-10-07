"""Build local, full-resolution links and review sheets for recorded viewport audits."""
import json
import re
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parents[2] / "audit"
phases = ("before", "after-1", "after-2", "after-3", "after-4", "after-5", "after-6")
for phase in phases:
    directory = root / phase
    if not directory.exists():
        continue
    review = directory / "review"
    review.mkdir(exist_ok=True)
    groups = []
    for folder in sorted(directory.iterdir()):
        if not folder.is_dir() or not re.fullmatch(r"\d+x\d+-(light|dark)", folder.name):
            continue
        files = sorted(folder.glob("scroll-*.png"))
        for start in range(0, len(files), 8):
            sheet = Image.new("RGB", (1360, 660), "#dddddd")
            draw = ImageDraw.Draw(sheet)
            for index, image_path in enumerate(files[start:start + 8]):
                with Image.open(image_path) as original:
                    thumb = original.copy()
                    thumb.thumbnail((332, 300))
                    x, y = index % 4 * 340, index // 4 * 330
                    sheet.paste(thumb, (x, y + 25))
                    draw.text((x + 5, y + 5), folder.name + " " + image_path.stem, fill="black")
            sheet.save(review / f"{folder.name}-{start // 8}.png")
        all_files = sorted(folder.glob("*.png"))
        groups.append(f'<details><summary>{folder.name} · {len(all_files)} renders</summary><div class="frames">' +
                      "".join(f'<figure><a href="{folder.name}/{file.name}" target="_blank"><img src="{folder.name}/{file.name}" loading="lazy" alt="{folder.name} {file.stem}"></a><figcaption><a href="{folder.name}/{file.name}" target="_blank">{file.stem} — open original size</a></figcaption></figure>' for file in all_files) +
                      f'</div><a href="{folder.name}/measurements.json">Measurements for every scroll step and state</a></details>')
    html = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unravel audit — ' + phase + '</title><style>body{background:#141416;color:#eee;font:16px/1.6 system-ui;margin:32px}a{color:#b8c4ff}summary{cursor:pointer;padding:16px;border-top:1px solid #444}.frames{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}figure{margin:0}img{width:100%;height:auto}figcaption{font-size:14px;padding:8px 0}h1{font-size:32px}</style><h1>Unravel landing — ' + phase + '</h1><p>Each original is a viewport PNG at 100% browser scale, DPR 1. Preview thumbnails are reduced; open the image link for full resolution. No long-page screenshots.</p><p><a href="../index.html">All passes</a> · <a href="summary.json">Audit summary</a></p>' + "".join(groups) + '</html>'
    (directory / "index.html").write_text(html, encoding="utf-8")
(root / "index.html").write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Unravel landing audit</title><style>body{font:18px/1.8 system-ui;background:#141416;color:#eee;margin:48px}a{color:#b8c4ff}</style><h1>Unravel landing audit</h1><p>Five viewports, light and dark. Native viewport renders and per-scroll measurements.</p><ul>' + "".join(f'<li><a href="{phase}/index.html">{phase}</a></li>' for phase in phases if (root / phase / "index.html").exists()) + '</ul></html>', encoding="utf-8")
print("Updated native-render galleries and all scroll review sheets.")
