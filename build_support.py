"""Bundle the already-built Vite interface in the Python wheel."""
from pathlib import Path
import shutil
from setuptools.command.build_py import build_py


class UnravelBuild(build_py):
    def run(self):
        if self.editable_mode:
            return super().run()
        source = Path(__file__).resolve().parent / "web" / "dist"
        if not (source / "index.html").is_file():
            raise RuntimeError("Build the Unravel interface first: npm ci --prefix web && npm run build --prefix web")
        super().run()
        build_root = Path(self.build_lib).resolve()
        destination = (build_root / "apps" / "unravel" / "_web").resolve()
        if not destination.is_relative_to(build_root):
            raise RuntimeError("The asset destination escaped the package build directory.")
        if destination.exists():
            shutil.rmtree(destination)
        shutil.copytree(source, destination)
