"""Shared fixtures for the Repairo documentation test suite.

Repairo is a documentation repository, not an application. These tests verify
that the authoritative design brief (docs/BRIEF.md) and its follow-on artifacts
actually document each acceptance criterion the design must meet — i.e. that the
deliverable is complete and internally consistent against its own brief.

The suite is deliberately implementation-agnostic: it reads the committed
Markdown/HTML artifacts and asserts facts about their content, so it keeps
passing as prose is refined and only fails when a required commitment goes
missing.
"""

from __future__ import annotations

from pathlib import Path

import pytest

# Repository root = parent of this tests/ directory.
REPO_ROOT = Path(__file__).resolve().parent.parent


def _read(relpath: str) -> str:
    path = REPO_ROOT / relpath
    if not path.exists():
        pytest.fail(f"Expected artifact is missing: {relpath}")
    return path.read_text(encoding="utf-8")


@pytest.fixture(scope="session")
def repo_root() -> Path:
    return REPO_ROOT


@pytest.fixture(scope="session")
def brief_text() -> str:
    """The authoritative design brief and its acceptance criteria."""
    return _read("docs/BRIEF.md")


@pytest.fixture(scope="session")
def brief_lower() -> str:
    return _read("docs/BRIEF.md").lower()


@pytest.fixture(scope="session")
def budget_text() -> str:
    return _read("docs/budget.md")


@pytest.fixture(scope="session")
def readme_text() -> str:
    return _read("README.md")
