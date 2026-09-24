"""Cross-document consistency tests for the Repairo docs repository (ticket S-2).

The brief references a budget, follow-on design deliverables, and a repository
layout. These tests keep those references honest: files that are linked must
exist, and headline facts (budget cap, occupant count, bedroom count) must not
drift between the brief, the budget note and the README.
"""

from __future__ import annotations

import re
from pathlib import Path


def _relative_md_links(text: str) -> list[str]:
    """Return local (non-http) link targets from a Markdown document."""
    links = re.findall(r"\]\(([^)]+)\)", text)
    out = []
    for link in links:
        target = link.split("#")[0].strip()
        if target and not target.startswith(("http://", "https://", "mailto:")):
            out.append(target)
    return out


def test_brief_internal_links_resolve(repo_root: Path, brief_text: str) -> None:
    """Every relative link in BRIEF.md points at a file that exists."""
    base = repo_root / "docs"
    missing = [t for t in _relative_md_links(brief_text) if not (base / t).resolve().exists()]
    assert not missing, f"BRIEF.md links to missing files: {missing}"


def test_readme_internal_links_resolve(repo_root: Path, readme_text: str) -> None:
    """Every relative link in README.md points at a file that exists."""
    missing = [t for t in _relative_md_links(readme_text) if not (repo_root / t).resolve().exists()]
    assert not missing, f"README.md links to missing files: {missing}"


def test_referenced_artifacts_exist(repo_root: Path) -> None:
    """The core documentation artifacts the brief depends on are present."""
    for rel in ["docs/BRIEF.md", "docs/brief.md", "docs/budget.md", "README.md"]:
        assert (repo_root / rel).exists(), f"Required artifact missing: {rel}"


def test_budget_cap_consistent(brief_lower: str, budget_text: str) -> None:
    """The USD 100,000 cap in the brief matches the figure in the budget note."""
    assert "usd 100,000" in brief_lower
    assert "100,000" in budget_text, "Budget note must carry the 100,000 headline figure"


def test_occupant_count_consistent(brief_lower: str, readme_text: str) -> None:
    """Family-of-five is stated consistently across brief and README."""
    assert "family of five" in brief_lower or "family of 5" in brief_lower
    readme_lower = readme_text.lower()
    assert "family of 5" in readme_lower or "5 (owner" in readme_lower or "family of five" in readme_lower


def test_bedroom_count_is_three(brief_lower: str) -> None:
    """The programme fixes bedrooms at three; guard against silent drift."""
    assert "3 bedrooms" in brief_lower or "**3**" in brief_lower
    # There must be no contradictory statement of a different bedroom count.
    for bad in ["2 bedrooms", "4 bedrooms", "5 bedrooms"]:
        assert bad not in brief_lower, f"Brief contradicts the 3-bedroom programme: '{bad}'"


def test_currency_confirmed_usd(brief_lower: str) -> None:
    """The brief resolves the currency ambiguity to USD (the budget note leaves it TBC)."""
    assert "currency confirmed as usd" in brief_lower or "usd 100,000" in brief_lower


def test_designs_directory_present(repo_root: Path) -> None:
    """designs/ exists with its convention README, per the repository layout."""
    designs = repo_root / "designs"
    assert designs.is_dir(), "designs/ directory must exist"
    assert (designs / "README.md").exists(), "designs/README.md (naming convention) must exist"
