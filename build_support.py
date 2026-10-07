"""Bundle the already-built Vite interface in the Python wheel."""
from pathlib import Path
import shutil
from setuptools.command.build_py import build_py


class RavelBuild(build_py):
    def run(self):
        if self.editable_mode:
            return super().run()
        source = Path(__file__).resolve().parent / "byline" / "dist"
        if not (source / "index.html").is_file():
            raise RuntimeError("Build the Ravel interface first: npm ci --prefix byline && npm run build --prefix byline")
        super().run()
        build_root = Path(self.build_lib).resolve()
        destination = (build_root / "apps" / "ravel" / "_web").resolve()
        if not destination.is_relative_to(build_root):
            raise RuntimeError("The asset destination escaped the package build directory.")
        if destination.exists():
            shutil.rmtree(destination)
        shutil.copytree(source, destination)
