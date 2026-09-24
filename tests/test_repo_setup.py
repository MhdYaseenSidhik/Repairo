"""Repository-setup acceptance tests for the Repairo repository (ticket S-1).

S-1 scaffolded the documentation repository: the docs/ and designs/ directories,
an environment example, a git-ignore policy, the Markdown lint gate and its CI
workflow. These tests pin that scaffold so a later change cannot silently remove
a piece of the repository contract the rest of the work depends on.

The suite is implementation-agnostic: it asserts that the required files exist
and carry the commitments S-1 promised, not their exact wording.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


# --- Directory scaffold -----------------------------------------------------


def test_docs_directory_present(repo_root: Path) -> None:
    """docs/ holds the written design artifacts."""
    assert (repo_root / "docs").is_dir(), "docs/ directory must exist"


def test_designs_directory_has_convention_readme(repo_root: Path) -> None:
    """designs/ exists and documents its file-naming convention."""
    designs = repo_root / "designs"
    assert designs.is_dir(), "designs/ directory must exist"
    readme = designs / "README.md"
    assert readme.exists(), "designs/README.md (naming convention) must exist"
    text = readme.read_text(encoding="utf-8").lower()
    assert "convention" in text, "designs/README.md must state the naming convention"
    assert "version" in text, "designs/README.md must require a version in file names"


# --- Environment / secrets policy ------------------------------------------


def test_env_example_present(repo_root: Path) -> None:
    """An .env.example documents configuration without committing secrets."""
    example = repo_root / ".env.example"
    assert example.exists(), ".env.example must exist so the next person can configure the repo"


def test_gitignore_excludes_env_and_cruft(repo_root: Path) -> None:
    """.gitignore keeps the real .env and build cruft out of the history."""
    gitignore = repo_root / ".gitignore"
    assert gitignore.exists(), ".gitignore must exist"
    text = gitignore.read_text(encoding="utf-8")
    assert re.search(r"^\.env$", text, flags=re.MULTILINE), ".gitignore must ignore .env"
    assert "node_modules/" in text, ".gitignore must ignore node_modules/"
    assert "__pycache__/" in text, ".gitignore must ignore Python __pycache__/"


def test_real_env_is_not_committed(repo_root: Path) -> None:
    """The real .env must never be tracked — only the example may be committed."""
    assert not (repo_root / ".env").exists(), "A real .env must not be present in the repo"


# --- Markdown lint gate -----------------------------------------------------


def test_markdownlint_config_present_and_valid(repo_root: Path) -> None:
    """The lint gate has a config, and it parses (JSONC with // comments stripped)."""
    cfg = repo_root / ".markdownlint-cli2.jsonc"
    assert cfg.exists(), ".markdownlint-cli2.jsonc must exist"
    raw = cfg.read_text(encoding="utf-8")
    # Strip // line comments so the JSONC parses as JSON.
    stripped = re.sub(r"^\s*//.*$", "", raw, flags=re.MULTILINE)
    data = json.loads(stripped)
    assert "config" in data, "lint config must carry a 'config' block"
    assert data.get("globs"), "lint config must declare the globs it checks"


def test_lint_workflow_runs_markdownlint(repo_root: Path) -> None:
    """CI runs the Markdown lint command on push and pull request."""
    wf = repo_root / ".github" / "workflows" / "lint.yml"
    assert wf.exists(), "lint workflow must exist"
    text = wf.read_text(encoding="utf-8")
    assert "markdownlint-cli2" in text, "lint workflow must invoke markdownlint-cli2"
    assert "pull_request" in text, "lint workflow must run on pull_request"


# --- Test gate wired into CI ------------------------------------------------


def test_test_workflow_runs_pytest(repo_root: Path) -> None:
    """CI runs this very test suite on push and pull request."""
    wf = repo_root / ".github" / "workflows" / "tests.yml"
    assert wf.exists(), "tests workflow must exist"
    text = wf.read_text(encoding="utf-8")
    assert "pytest" in text, "tests workflow must run pytest"
    assert "requirements-dev.txt" in text, "tests workflow must install requirements-dev.txt"


def test_suite_runs_by_one_documented_command(repo_root: Path) -> None:
    """pytest.ini pins the single documented command: python -m pytest."""
    ini = repo_root / "pytest.ini"
    assert ini.exists(), "pytest.ini must exist so the suite runs with one command"
    text = ini.read_text(encoding="utf-8")
    assert "testpaths" in text, "pytest.ini must declare testpaths"


def test_readme_present(repo_root: Path) -> None:
    """The repository root README exists and names the project."""
    readme = repo_root / "README.md"
    assert readme.exists(), "README.md must exist at the repository root"
    assert readme.read_text(encoding="utf-8").strip(), "README.md must not be empty"
