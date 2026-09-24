# Repairo documentation test suite

Repairo is a **documentation repository**, not an application. This suite proves the
design deliverables actually satisfy the brief, so a dropped requirement fails the
pipeline instead of shipping.

## What it checks

- **Acceptance criteria** (`tests/test_acceptance_criteria.py`) — one test per criterion in
  [`docs/BRIEF.md` section 6](../docs/BRIEF.md), asserting the brief commits to each one
  (budget cap, 3 bedrooms for a family of five, monsoon-ready roof/plinth/drainage,
  cross-ventilation and passive cooling, daylight everywhere, indoor–outdoor flow, local
  materials, minimalistic-modern intent), plus that section 6 lists exactly eight criteria and
  section 7 names the follow-on deliverables.
- **Document consistency** (`tests/test_document_consistency.py`) — every relative link in the
  brief and README resolves to a file that exists; the USD 100,000 cap, the family-of-five
  occupant count and the 3-bedroom programme do not drift between documents; the `designs/`
  directory and its convention README are present.

The tests read the committed Markdown/HTML — they assert *facts about the artifact*, not its
exact wording, so refining prose keeps them green and only a missing commitment turns them red.

## Run it

Requires Python 3.9+.

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

The same command runs in CI on every push and pull request — see
[`.github/workflows/tests.yml`](../.github/workflows/tests.yml).
