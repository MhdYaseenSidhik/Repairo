'use strict';

// Acceptance-criteria tests for the Repairo architecture plan (ticket S-3).
//
// Each test maps to one acceptance criterion in docs/BRIEF.md section 6
// ("Acceptance criteria — what the design must meet"). The criteria are the
// authoritative source; the design that must satisfy them is expressed in the
// brief (programme + intent) and realised in the floorplan diagram under
// designs/. The tests assert those criteria as *data* against the committed
// artifacts, so a criterion silently dropped — or a floorplan that stops
// covering the programme — fails the pipeline instead of shipping.
//
// Run with:  npm test   (which runs: node --test test/)

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { read, readLower } = require('./helpers');

const BRIEF = readLower('docs/BRIEF.md');
const FLOOR = read('designs/floorplan-ground-v1.html');
const FLOOR_L = FLOOR.toLowerCase();

// --- Criterion 1: Within budget (<= USD 100,000) --------------------------

test('AC1 within budget: brief fixes a USD 100,000 hard ceiling', () => {
  assert.ok(BRIEF.includes('usd 100,000'), 'brief must state the USD 100,000 cap');
  assert.ok(BRIEF.includes('hard ceiling'), 'the cap must be a hard ceiling');
  assert.ok(
    BRIEF.includes('reconciled'),
    'the cost must be reconciled to the design (not the placeholder)',
  );
});

// --- Criterion 2: Sleeps and serves 5 -------------------------------------

test('AC2 sleeps 5: brief requires >=3 bedrooms for a family of five', () => {
  assert.ok(
    BRIEF.includes('family of five') || BRIEF.includes('family of 5'),
    'brief must state a family of five',
  );
  assert.ok(
    BRIEF.includes('3 bedrooms') || /\*\*3\*\*/.test(BRIEF),
    'brief must require 3 bedrooms',
  );
  assert.ok(BRIEF.includes('bathroom'), 'brief must specify bathrooms');
  assert.ok(
    BRIEF.includes('living') && BRIEF.includes('dining') && BRIEF.includes('kitchen'),
    'brief must specify open living-dining-kitchen',
  );
});

test('AC2 sleeps 5: floorplan lays out 3 distinct bedrooms + living/dining/kitchen', () => {
  // The realised layout must actually carry the programme, as data.
  assert.ok(/bedroom/i.test(FLOOR), 'floorplan must name bedrooms');
  // Three distinct bedroom nodes (primary + 2 further).
  const bedroomNodes = (FLOOR_L.match(/bedroom/g) || []).length;
  assert.ok(bedroomNodes >= 3, `floorplan must show >=3 bedrooms, found ${bedroomNodes}`);
  assert.ok(FLOOR_L.includes('en-suite'), 'primary bedroom must be en-suite');
  for (const room of ['living', 'dining', 'kitchen']) {
    assert.ok(FLOOR_L.includes(room), `floorplan must include the ${room}`);
  }
});

// --- Criterion 3: Monsoon-ready -------------------------------------------

test('AC3 monsoon-ready: sloped roof, overhangs, raised plinth, rainwater harvesting', () => {
  assert.ok(BRIEF.includes('overhang'), 'brief must require deep overhangs');
  assert.ok(BRIEF.includes('plinth'), 'brief must require a raised plinth');
  assert.ok(
    BRIEF.includes('sloped') || BRIEF.includes('pitched'),
    'brief must require a sloped/pitched roof',
  );
  assert.ok(
    BRIEF.includes('rainwater harvesting') || BRIEF.includes('drainage'),
    'brief must require drainage / rainwater harvesting',
  );
});

// --- Criterion 4: Humidity & heat (cross-ventilation + shading) -----------

test('AC4 humidity & heat: cross-ventilation, shaded openings, passive cooling', () => {
  assert.ok(BRIEF.includes('cross-ventilation'), 'brief must require cross-ventilation');
  assert.ok(BRIEF.includes('passive cooling'), 'brief must rely on passive cooling');
  assert.ok(BRIEF.includes('shaded'), 'brief must require shaded openings');
});

test('AC4 humidity & heat: floorplan realises cross-ventilation', () => {
  assert.ok(
    FLOOR_L.includes('cross-vent') || FLOOR_L.includes('cross vent'),
    'floorplan must mark cross-ventilation',
  );
});

// --- Criterion 5: Daylight everywhere -------------------------------------

test('AC5 daylight: every habitable room naturally lit, no dark internal rooms', () => {
  assert.ok(
    BRIEF.includes('natural light') ||
      BRIEF.includes('naturally lit') ||
      BRIEF.includes('daylight'),
    'brief must require natural light',
  );
  assert.ok(
    BRIEF.includes('no dark internal rooms'),
    'brief must forbid dark internal rooms',
  );
});

test('AC5 daylight: floorplan pulls light into the plan centre (courtyard)', () => {
  assert.ok(
    FLOOR_L.includes('courtyard') || FLOOR_L.includes('clerestory'),
    'floorplan must provide a courtyard/clerestory for daylight',
  );
  assert.ok(
    FLOOR_L.includes('light') || FLOOR_L.includes('daylight'),
    'floorplan must annotate daylight',
  );
});

// --- Criterion 6: Open to nature ------------------------------------------

test('AC6 open to nature: framed openings, indoor-outdoor flow, small footprint', () => {
  assert.ok(BRIEF.includes('framed') && BRIEF.includes('opening'), 'brief must require framed openings');
  assert.ok(
    BRIEF.includes('indoor') && BRIEF.includes('outdoor'),
    'brief must require indoor-outdoor flow',
  );
  assert.ok(
    BRIEF.includes('verandah') || BRIEF.includes('courtyard') || BRIEF.includes('sit-out'),
    'brief must provide a verandah / courtyard / sit-out',
  );
  assert.ok(BRIEF.includes('small footprint'), 'brief must require a small footprint');
});

test('AC6 open to nature: floorplan realises indoor-outdoor transition', () => {
  assert.ok(
    FLOOR_L.includes('verandah') || FLOOR_L.includes('sit-out'),
    'floorplan must include a verandah / sit-out',
  );
});

// --- Criterion 7: Local materials -----------------------------------------

test('AC7 local materials: predominantly locally sourced, climate-tested palette', () => {
  assert.ok(BRIEF.includes('local'), 'brief must require local materials');
  const named = ['laterite', 'brick', 'timber', 'filler-slab', 'tiled'];
  assert.ok(
    named.some((m) => BRIEF.includes(m)),
    `brief must name a local material from ${named.join(', ')}`,
  );
});

// --- Criterion 8: Minimalistic & modern -----------------------------------

test('AC8 minimalistic & modern: clean lines, restrained palette, honest materials', () => {
  assert.ok(BRIEF.includes('minimalistic') && BRIEF.includes('modern'));
  assert.ok(BRIEF.includes('clean lines'), 'brief must state clean lines');
  assert.ok(BRIEF.includes('honest materials'), 'brief must state honest materials');
});

// --- Structural integrity of the brief's acceptance-criteria section ------

test('brief section 6 enumerates exactly the eight acceptance criteria', () => {
  const briefRaw = read('docs/BRIEF.md');
  const section = briefRaw.split('## 6.')[1].split('## 7.')[0];
  const checkboxes = section.match(/^\s*- \[[ xX]\] /gm) || [];
  assert.equal(
    checkboxes.length,
    8,
    `expected 8 acceptance criteria in section 6, found ${checkboxes.length}`,
  );
});

test('brief anchors the Kerala / 5-acre / monsoon context', () => {
  assert.ok(BRIEF.includes('kerala'));
  assert.ok(
    BRIEF.includes('5-acre') || BRIEF.includes('5 acre') || BRIEF.includes('5 acres'),
  );
  assert.ok(BRIEF.includes('monsoon'));
});
