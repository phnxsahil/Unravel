"""Locate the packaged browser interface or the development build."""
from pathlib import Path


def frontend_directory() -> Path:
    packaged = Path(__file__).resolve().parent / "_web"
    if (packaged / "index.html").is_file():
        return packaged
    return Path(__file__).resolve().parents[2] / "byline" / "dist"
