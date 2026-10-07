"""Create an offline, responsive index of the verified screenshot captures."""
from pathlib import Path
from html import escape
import json


def main():
    root = Path(__file__).resolve().parents[1] / ".local/screenshots/unravel-release"
    folders = sorted(p for p in root.iterdir() if p.is_dir() and (p / "metadata.json").exists())
    count = sum(len(list(p.glob("*.png"))) for p in folders)
    groups = []
    for folder in folders:
        metadata = json.loads((folder / "metadata.json").read_text())
        width = metadata["viewport"]["width"]
        height = metadata["viewport"]["height"]
        theme = metadata["theme"]
        figures = []
        for file in sorted(folder.glob("*.png")):
            url = escape(f"{folder.name}/{file.name}", quote=True)
            name = escape(file.stem.replace("-", " "))
            figures.append(f'<a class="capture" href="{url}"><img loading="lazy" src="{url}" alt="{name}, {width}px {theme}"><span>{name}</span></a>')
        groups.append(f'<details><summary>{width} × {height} · {theme} · {len(figures)} captures</summary><p><a href="{folder.name}/metadata.json">Viewport, theme and capture receipts</a></p><div class="grid">{"".join(figures)}</div></details>')
    page = f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unravel screenshot gallery</title>
<style>body{{margin:0;background:#0c0d10;color:#f0f0f2;font:16px/1.6 system-ui,sans-serif}}main{{max-width:1184px;margin:auto;padding:48px 24px}}h1{{font-size:36px;line-height:1.2}}p{{color:#b0b1ba;max-width:780px}}a{{color:#adc0ff}}details{{padding:24px 0;border-top:1px solid #383940}}summary{{cursor:pointer;font-size:20px}}summary:focus-visible,a:focus-visible{{outline:2px solid #adc0ff;outline-offset:4px}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px}}.capture{{display:block;background:#141519;border:1px solid #383940;border-radius:8px;overflow:hidden;text-decoration:none}}img{{display:block;width:100%;height:240px;object-fit:contain;object-position:top;background:#202126}}span{{display:block;padding:16px}}</style>
<main><h1>Unravel: verified screens</h1><p>{count} captures across five widths and both themes. Open a capture to inspect its original dimensions. The gallery includes full pages, landing sections, documentation sections and every walkthrough state.</p><p>A full-page image represents one pinned scene; the four separate story captures show all four states. Documentation section images are viewport captures positioned at their section heading. Prepared demonstrations are simulations.</p>{"".join(groups)}</main></html>'''
    (root / "index.html").write_text(page, encoding="utf-8")
    print(f"Gallery: {count} PNGs, {len(folders)} verified viewport/theme groups.")


if __name__ == "__main__":
    main()
