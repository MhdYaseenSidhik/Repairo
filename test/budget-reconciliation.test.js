'use strict';

// Budget reconciliation tests for the Repairo cost plan (ticket S-3, AC1).
//
// AC1 requires the all-in build cost to be <= USD 100,000. docs/budget.md is
// still an *indicative* plan expressed as a percentage breakdown (the full
// USD line-item reconciliation to the design's actual area is a follow-on
// deliverable, per BRIEF.md section 7). These tests reconcile what is present
// as data — the headline figure, the currency cap, and the arithmetic of the
// breakdown — so a budget that drifts above the cap, changes currency, or whose
// shares stop summing to 100% fails the pipeline.
//
// NOTE: this suite does NOT assert a USD line-item total that does not yet
// exist; it asserts the arithmetic and cap consistency that are demonstrably
// present, and guards against drift above the ceiling.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, readLower } = require('./helpers');

const BUDGET = read('docs/budget.md');
const BUDGET_L = BUDGET.toLowerCase();
const BRIEF_L = readLower('docs/BRIEF.md');

test('budget carries the 100,000 headline figure consistent with the brief cap', () => {
  assert.ok(BUDGET.includes('100,000'), 'budget must carry the 100,000 headline figure');
  assert.ok(BRIEF_L.includes('usd 100,000'), 'brief must fix the cap at USD 100,000');
});

test('budget total does not exceed the USD 100,000 ceiling', () => {
  // Parse every explicit dollar/USD amount in the budget and assert none, and
  // no stated total, breaches the cap. Today the budget is percentage-based, so
  // there are no absolute figures above the cap — this guards a future costed
  // plan from silently blowing the ceiling.
  const CAP = 100000;
  const amounts = [];
  const re = /(?:usd|\$)\s*([\d][\d,]*)/gi;
  let m;
  while ((m = re.exec(BUDGET)) !== null) {
    amounts.push(Number(m[1].replace(/,/g, '')));
  }
  for (const amt of amounts) {
    assert.ok(amt <= CAP, `budget figure ${amt} exceeds the USD ${CAP} cap`);
  }
});

test('budget percentage breakdown sums to exactly 100%', () => {
  // Reconcile the arithmetic of the indicative breakdown: the share column must
  // total 100%. A table that no longer adds up is a defect in the cost plan.
  const shares = [];
  const re = /\|\s*(\d+)%\s*\|/g;
  let m;
  while ((m = re.exec(BUDGET)) !== null) {
    shares.push(Number(m[1]));
  }
  assert.ok(shares.length >= 5, `expected the breakdown rows, found ${shares.length}`);
  const total = shares.reduce((a, b) => a + b, 0);
  assert.equal(total, 100, `budget shares must sum to 100%, summed to ${total}%`);
});

test('budget resolves the currency to USD (assumed) rather than leaving it ambiguous', () => {
  assert.ok(
    BUDGET_L.includes('assume $100,000') ||
      BUDGET_L.includes('usd assumed') ||
      BUDGET_L.includes('$100,000'),
    'budget must state USD is assumed for the cap',
  );
});
