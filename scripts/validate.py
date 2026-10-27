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
MAIN = ROOT / "src" / "main.ts"
BACKEND = ROOT / "backend" / "index.ts"
REQUIRED_PATHS = [
    ROOT / "README.md",
    ROOT / "SECURITY.md",
    ROOT / "docs" / "ARCHITECTURE.md",
    ROOT / "docs" / "BUILD-ROADMAP.md",
    ROOT / "docs" / "INTEGRATION-STANDARDS.md",
    ROOT / "docs" / "OPERATING-MODEL.md",
    ROOT / "scripts" / "validate.py",
    MAIN,
    BACKEND,
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
    "sign-in",
    "renderAuthGate",
    "syncWorkspaceNow",
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
    main_source = MAIN.read_text(encoding="utf-8") if MAIN.is_file() else ""
    backend_source = BACKEND.read_text(encoding="utf-8") if BACKEND.is_file() else ""
    combined_source = source + "\\n" + main_source + "\\n" + backend_source
    for marker in REQUIRED_MARKERS:
        if marker not in combined_source:
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

    script_tags = re.findall(r"<script\\b[^>]*>", source, flags=re.I)
    script_bodies = re.findall(r"<script\\b[^>]*>(.*?)</script\\s*>", source, flags=re.I | re.S)
    if len(script_tags) != 1 or len(script_bodies) != 1:
        fail("index.html must contain exactly one script tag")
    if './src/main.ts' not in script_tags[0] or script_bodies[0].strip():
        fail("index.html must load src/main.ts and contain no inline application script")
    if "import { api, auth }" not in main_source:
        fail("frontend must use the AppDeploy auth/API client")
    if "requireAuth()" not in backend_source or "ctx.user!.userId" not in backend_source:
        fail("workspace API must derive data partitioning from the authenticated user")
    if "'GET /api/workspace'" not in backend_source or "'PUT /api/workspace'" not in backend_source:
        fail("authenticated workspace read/write routes are missing")

    node = shutil.which("node")
    if node:
        with tempfile.NamedTemporaryFile("w", suffix=".mjs", encoding="utf-8", delete=False) as tmp:
            tmp.write(main_source)
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
            print("PASS: frontend module syntax (node --check)")
        finally:
            temp_path.unlink(missing_ok=True)
    else:
        print("SKIP: Node.js not installed; embedded JavaScript syntax was not checked")

    print(f"PASS: required repository files ({len(REQUIRED_PATHS)})")
    print(f"PASS: required application markers ({len(REQUIRED_MARKERS)})")
    print(f"PASS: HTML title and {len(audit.ids)} unique static IDs")
    print("PASS: no remote script or external stylesheet dependency")
    print("PASS: authenticated backend route and user-partition invariants")
    print("NOTE: this check does not replace TypeScript compilation, browser, accessibility, tenant-isolation, or end-to-end tests.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
