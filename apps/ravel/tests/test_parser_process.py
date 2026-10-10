import json
import subprocess
import sys

import pytest

from apps.ravel import cli


@pytest.mark.parametrize("path,language,body", [
    ("tiny.py", "python", "def answer():\n    return 42\n"),
    ("tiny.tsx", "tsx", "export const Answer = () => <button>Answer</button>;"),
    ("tiny.js", "javascript", "export function answer() { return 42; }"),
])
def test_source_parse_survives_in_a_subprocess(path, language, body):
    files = [{"path": path, "language": language, "body": body}]
    result = subprocess.run(
        [sys.executable, "-c", "import json,sys; from apps.ravel.source import parse; parse(json.loads(sys.argv[1]))", json.dumps(files)],
        capture_output=True, text=True, timeout=20,
    )
    assert result.returncode == 0, result.stderr


def test_doctor_reports_native_parser_crash(monkeypatch):
    monkeypatch.setattr(cli.subprocess, "run", lambda *args, **kwargs: subprocess.CompletedProcess(args, -11))
    passed, message = cli.check_parser()
    assert not passed
    assert "crashed" in message and "tree-sitter==0.25.2" in message


def test_doctor_parser_probe_is_ready():
    assert cli.check_parser()[0]
