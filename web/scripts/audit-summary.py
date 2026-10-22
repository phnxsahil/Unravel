"""Summarize the measured audit without counting reduced review sheets as renders."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2] / "audit"
result = {}
phases = ("before", "after-1", "after-2", "after-3", "after-4", "after-5", "after-6")
for phase in phases:
    variants = []
    for path in sorted((root / phase).glob("[0-9]*x*-*/measurements.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        frames = data["frames"]
        texts = [item for frame in frames for item in frame["text"]]
        controls = [item for frame in frames for item in frame["controls"]]
        muted = [item for item in texts if "77, 77, 77" in item["color"] or "181, 181, 189" in item["color"]]
        variants.append({
            "name": data["name"],
            "nativeRenders": len(list(path.parent.glob("*.png"))),
            "scrollFrames": len(frames),
            "minimumTextSize": min(item["size"] for item in texts),
            "minimumContentContrast": min(item["ratio"] for item in texts),
            "minimumMutedContrast": min((item["ratio"] for item in muted), default=None),
            "minimumControlWidth": min(item["width"] for item in controls),
            "minimumControlHeight": min(item["height"] for item in controls),
            "hero": next(item for item in frames[0]["sections"] if item["selector"] == "div.hero-product"),
            "story": next(item for item in frames[0]["sections"] if item["selector"] == "div.story-pin"),
        })
    result[phase] = variants
result["interactions"] = [json.loads(path.read_text(encoding="utf-8")) for path in sorted((root / "interaction-checks").glob("*.json"))]
(root / "metrics.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
for phase in phases:
    variants = result[phase]
    print(phase, sum(x["nativeRenders"] for x in variants), "native renders", sum(x["scrollFrames"] for x in variants), "scroll frames")
for variant in result["after-6"]:
    print(variant["name"], "min text", variant["minimumTextSize"], "min contrast", variant["minimumContentContrast"], "muted", variant["minimumMutedContrast"], "targets", round(variant["minimumControlWidth"], 1), round(variant["minimumControlHeight"], 1), "story", variant["story"]["position"])
