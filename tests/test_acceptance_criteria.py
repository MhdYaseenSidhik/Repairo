"""Acceptance-criteria tests for the Repairo design brief (ticket S-2).

Each test below maps to one acceptance criterion in docs/BRIEF.md section 6
("Acceptance criteria — what the design must meet"). The test asserts that the
brief actually commits to that requirement, so a criterion silently dropped
during editing fails the pipeline instead of shipping.

Run with:  python -m pytest -q
"""

from __future__ import annotations

import re


# --- Section 6 acceptance criteria -----------------------------------------


def test_criterion_within_budget(brief_lower: str) -> None:
    """AC: total all-in build cost is <= USD 100,000, evidenced by a costed plan."""
    assert "usd 100,000" in brief_lower, "Brief must state the USD 100,000 cap"
    assert "hard ceiling" in brief_lower, "Budget must be described as a hard ceiling"
    # The criterion demands the cost be reconciled to the design's actual area.
    assert "reconciled" in brief_lower, "Brief must require the cost be reconciled to the design"


def test_criterion_sleeps_and_serves_five(brief_lower: str) -> None:
    """AC: at least 3 bedrooms, adequate bathrooms, open living-dining-kitchen for 5."""
    assert "family of five" in brief_lower or "family of 5" in brief_lower or "5 (owner" in brief_lower
    assert "3 bedrooms" in brief_lower or "**3**" in brief_lower, "Brief must require 3 bedrooms"
    assert "bathroom" in brief_lower, "Brief must specify bathrooms"
    assert "living" in brief_lower and "dining" in brief_lower and "kitchen" in brief_lower


def test_criterion_monsoon_ready(brief_lower: str) -> None:
    """AC: sloped/pitched roof, deep overhangs, raised plinth, drainage/rainwater harvesting."""
    assert "overhang" in brief_lower, "Brief must require deep overhangs"
    assert "plinth" in brief_lower, "Brief must require a raised plinth"
    assert ("sloped" in brief_lower or "pitched" in brief_lower), "Brief must require a sloped/pitched roof"
    assert "rainwater harvesting" in brief_lower, "Brief must require rainwater harvesting"


def test_criterion_humidity_and_heat(brief_lower: str) -> None:
    """AC: every habitable room has cross-ventilation and shaded openings; passive cooling."""
    assert "cross-ventilation" in brief_lower, "Brief must require cross-ventilation"
    assert "passive cooling" in brief_lower, "Brief must rely on passive cooling"
    assert "shaded" in brief_lower, "Brief must require shaded openings"


def test_criterion_daylight_everywhere(brief_lower: str) -> None:
    """AC: every habitable room naturally lit; no dark internal rooms."""
    assert "natural light" in brief_lower or "naturally lit" in brief_lower or "daylight" in brief_lower
    assert "no dark internal rooms" in brief_lower, "Brief must forbid dark internal rooms"


def test_criterion_open_to_nature(brief_lower: str) -> None:
    """AC: large framed openings, indoor-outdoor flow, small footprint on the 5-acre plot."""
    assert "framed" in brief_lower and "opening" in brief_lower
    assert "indoor" in brief_lower and "outdoor" in brief_lower, "Brief must require indoor-outdoor flow"
    assert ("verandah" in brief_lower or "courtyard" in brief_lower or "sit-out" in brief_lower)
    assert "small footprint" in brief_lower, "Brief must require a small footprint"


def test_criterion_local_materials(brief_lower: str) -> None:
    """AC: palette predominantly locally sourced and climate-tested."""
    assert "local" in brief_lower, "Brief must require local materials"
    # At least one named local, climate-tested material.
    named = ["laterite", "brick", "timber", "filler-slab", "tiled"]
    assert any(m in brief_lower for m in named), f"Brief must name a local material from {named}"


def test_criterion_minimalistic_and_modern(brief_lower: str) -> None:
    """AC: clean lines, restrained palette, honest materials; reads modern and uncluttered."""
    assert "minimalistic" in brief_lower and "modern" in brief_lower
    assert "clean lines" in brief_lower, "Brief must state clean lines"
    assert "honest materials" in brief_lower, "Brief must state honest materials"


# --- Structural integrity of the brief document ----------------------------


def test_brief_has_all_eight_acceptance_criteria(brief_text: str) -> None:
    """Section 6 must enumerate exactly the eight checkbox criteria the tests cover."""
    section = brief_text.split("## 6.")[1].split("## 7.")[0]
    checkboxes = re.findall(r"^\s*- \[[ xX]\] ", section, flags=re.MULTILINE)
    assert len(checkboxes) == 8, (
        f"Expected 8 acceptance criteria in section 6, found {len(checkboxes)}"
    )


def test_brief_lists_followon_deliverables(brief_lower: str) -> None:
    """Section 7 must name the deliverables that follow the brief."""
    for item in ["site plan", "floor plan", "budget", "material schedule"]:
        assert item in brief_lower, f"Brief section 7 must name deliverable: {item}"


def test_brief_declares_kerala_tropical_context(brief_lower: str) -> None:
    """The brief must anchor the design in its site/climate context."""
    assert "kerala" in brief_lower
    assert "5-acre" in brief_lower or "5 acre" in brief_lower or "5 acres" in brief_lower
    assert "monsoon" in brief_lower
