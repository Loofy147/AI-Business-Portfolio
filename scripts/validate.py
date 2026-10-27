#!/usr/bin/env python3
"""Structural and JavaScript-syntax checks for the self-contained portfolio UI."""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
REQUIRED_PATHS = [
    ROOT / "README.md",
    ROOT / "SECURITY.md",
    ROOT / "docs" / "ARCHITECTURE.md",
    ROOT / "docs" / "BUILD-ROADMAP.md",
    ROOT / "docs" / "INTEGRATION-STANDARDS.md",
    ROOT / "docs" / "OPERATING-MODEL.md",
    ROOT / "scripts" / "validate.py",
]
REQUIRED_MARKERS = [
    'id="app"',
    'id="nav"',
    'id="page"',
    'id="modal-root"',
    'id="toast-root"',
    "localStorage",
    "renderOverview",
    "renderVentures",
    "renderBuild",
    "renderIntegrations",
    "renderCapabilities",
    "renderActivity",
    "exportState",
    "candidate",
    "verified",
    "archive-venture",
    "function openArchiveForm",
    "status-archived",
    "ai-business-portfolio.v0.1",
]


class DocumentAudit(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.duplicates: list[str] = []
        self.links_to_external_styles: list[str] = []
        self.external_scripts: list[str] = []
        self.title_seen = False
        self.in_title = False
        self.title_text = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = dict(attrs)
        node_id = attrs_map.get("id")
        if node_id:
            if node_id in self.ids:
                self.duplicates.append(node_id)
            self.ids.append(node_id)
        if tag == "title":
            self.in_title = True
        if tag == "link" and attrs_map.get("rel", "").lower() == "stylesheet":
            href = attrs_map.get("href", "") or ""
            if href.startswith(("http://", "https://", "//")):
                self.links_to_external_styles.append(href)
        if tag == "script":
            src = attrs_map.get("src", "") or ""
            if src.startswith(("http://", "https://", "//")):
                self.external_scripts.append(src)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
            self.title_seen = True

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_text += data


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def main() -> int:
    missing = [str(path.relative_to(ROOT)) for path in REQUIRED_PATHS if not path.is_file()]
    if missing:
        fail("required files are missing: " + ", ".join(missing))
    if not INDEX.is_file():
        fail("index.html is missing")

    source = INDEX.read_text(encoding="utf-8")
    for marker in REQUIRED_MARKERS:
        if marker not in source:
            fail(f"required application marker is missing: {marker}")

    audit = DocumentAudit()
    try:
        audit.feed(source)
        audit.close()
    except Exception as exc:  # HTMLParser is deliberately used without dependencies.
        fail(f"HTML could not be parsed: {exc}")

    if not audit.title_seen or not audit.title_text.strip():
        fail("document has no non-empty title")
    if audit.duplicates:
        fail("duplicate static HTML IDs: " + ", ".join(sorted(set(audit.duplicates))))
    if audit.links_to_external_styles:
        fail("the initial UI must not depend on external stylesheets")
    if audit.external_scripts:
        fail("the initial UI must not load remote scripts")

    scripts = re.findall(r"<script(?:\s[^>]*)?>(.*?)</script\s*>", source, flags=re.I | re.S)
    if len(scripts) != 1:
        fail(f"expected exactly one inline application script; found {len(scripts)}")

    node = shutil.which("node")
    if node:
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as tmp:
            tmp.write(scripts[0])
            temp_path = Path(tmp.name)
        try:
            result = subprocess.run(
                [node, "--check", str(temp_path)],
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode != 0:
                print(result.stdout, end="")
                print(result.stderr, end="")
                fail("JavaScript syntax check failed")
            print("PASS: embedded JavaScript syntax (node --check)")
        finally:
            temp_path.unlink(missing_ok=True)
    else:
        print("SKIP: Node.js not installed; embedded JavaScript syntax was not checked")

    print(f"PASS: required repository files ({len(REQUIRED_PATHS)})")
    print(f"PASS: required application markers ({len(REQUIRED_MARKERS)})")
    print(f"PASS: HTML title and {len(audit.ids)} unique static IDs")
    print("PASS: no remote script or external stylesheet dependency")
    print("NOTE: this check does not replace browser, accessibility, authorization, or end-to-end tests.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
