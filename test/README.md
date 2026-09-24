# Repairo test suite

Repairo is a **documentation repository**, not an application. This suite proves
the **architecture plan actually meets the brief's acceptance criteria**, so a
dropped requirement — or a design that stops satisfying a criterion — fails the
pipeline instead of shipping.

The tests read the committed Markdown and HTML and assert **facts about the
artifacts as data** (budget arithmetic, bedroom count, roof/plinth/drainage,
cross-ventilation, daylight, indoor–outdoor flow, local materials, and that the
floorplan diagram exists and parses). Refining prose keeps them green; only a
missing commitment or a broken artifact turns them red.

## Run it

Requires Node.js 20+ (already this repo's engine). No install is needed — the
suite uses Node's built-in test runner and assertion library.

```bash
npm test
```

That runs `node --test test/` — the same command CI runs on every push and pull
request (see [`../.github/workflows/lint.yml`](../.github/workflows/lint.yml),
job **tests**).

## What it checks

| File | Covers |
|------|--------|
| `test/acceptance-criteria.test.js` | One test per `docs/BRIEF.md` §6 criterion — USD 100,000 hard-ceiling budget, ≥3 bedrooms for a family of five, monsoon roof/plinth/drainage, cross-ventilation + shading + passive cooling, daylight (no dark internal rooms), indoor–outdoor flow + small footprint, local materials, minimalistic-modern — asserted against the brief and reconciled against the floorplan layout. Plus §6 lists exactly eight criteria and the Kerala/5-acre/monsoon context is anchored. |
| `test/budget-reconciliation.test.js` | `docs/budget.md` carries the 100,000 headline, no figure exceeds the USD 100,000 cap, the percentage breakdown sums to exactly 100%, and the currency resolves to USD. |
| `test/design-artifacts.test.js` | `designs/floorplan-ground-v1.html` exists, is well-formed HTML with one balanced Mermaid block and the Mermaid runtime wired in, and the Mermaid source parses into a connected flowchart with the programme's rooms (≥3 bedrooms, living/dining/kitchen, courtyard, verandah). |

## Known gaps (asserted honestly, not rounded up to passed)

- **Budget** is still an *indicative percentage plan*. The full USD line-item
  reconciliation to the design's actual area is a follow-on deliverable
  (`docs/BRIEF.md` §7). The suite reconciles the arithmetic and cap that are
  present; it does **not** fabricate a costed total that does not yet exist.
- The architecture criteria are asserted against `docs/BRIEF.md` (which owns the
  criteria) and the floorplan diagram — the repository's authoritative
  expression of the plan. A separate standalone architecture-plan document is
  not present; when one lands, add its assertions here.
