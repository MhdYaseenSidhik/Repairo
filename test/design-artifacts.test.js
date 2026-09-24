'use strict';

// Design-artifact tests for the Repairo floorplan diagram (ticket S-3).
//
// AC requires the rendered diagrams / floorplan to exist and parse. The
// floorplan under designs/ is an HTML page that embeds a Mermaid flowchart.
// These tests assert the file exists, is well-formed HTML, carries exactly one
// balanced Mermaid block, and that the Mermaid source parses into a connected
// flowchart with the labelled rooms the programme requires — so a broken,
// empty, or malformed diagram fails the pipeline instead of shipping.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { exists, read, mermaidLabels } = require('./helpers');

const FLOORPLAN = 'designs/floorplan-ground-v1.html';

test('floorplan HTML exists under designs/', () => {
  assert.ok(exists(FLOORPLAN), `${FLOORPLAN} must exist`);
});

test('floorplan is well-formed HTML with a single balanced mermaid block', () => {
  const html = read(FLOORPLAN);
  assert.ok(/<!doctype html>/i.test(html), 'must declare <!doctype html>');
  assert.ok(/<html[\s>]/i.test(html) && /<\/html>/i.test(html), 'must have balanced <html>');
  assert.ok(/<head[\s>]/i.test(html) && /<\/head>/i.test(html), 'must have a <head>');
  assert.ok(/<body[\s>]/i.test(html) && /<\/body>/i.test(html), 'must have a <body>');

  const opens = (html.match(/<pre class="mermaid">/g) || []).length;
  const closes = (html.match(/<\/pre>/g) || []).length;
  assert.equal(opens, 1, 'must contain exactly one mermaid <pre> block');
  assert.equal(closes, 1, 'mermaid <pre> block must be closed');

  // The mermaid runtime must be wired in so the diagram actually renders.
  assert.ok(/mermaid(\.min)?\.js/i.test(html), 'must load the mermaid runtime');
  assert.ok(/mermaid\.initialize/i.test(html), 'must initialise mermaid');
});

test('mermaid source parses into a flowchart with connected nodes', () => {
  const html = read(FLOORPLAN);
  const block = html.match(/<pre class="mermaid">([\s\S]*?)<\/pre>/);
  assert.ok(block, 'mermaid block must be extractable');
  const source = block[1];

  // A flowchart declaration.
  assert.ok(/^\s*flowchart\s+(LR|RL|TB|BT|TD)/m.test(source), 'must declare a flowchart');

  // Node labels parse out.
  const labels = mermaidLabels(source);
  assert.ok(labels.length >= 8, `expected >=8 labelled nodes, found ${labels.length}`);

  // Edges connect the plan (--- , -.-> , --> ). A floorplan with no adjacencies
  // is not a plan.
  const edges = (source.match(/---|-\.->|-->/g) || []).length;
  assert.ok(edges >= 5, `expected >=5 adjacencies between rooms, found ${edges}`);

  // Every subgraph that is opened is closed.
  const subOpens = (source.match(/subgraph\b/g) || []).length;
  const subCloses = (source.match(/^\s*end\s*$/gm) || []).length;
  assert.ok(subOpens >= 1, 'plan must group rooms into at least one wing (subgraph)');
  assert.equal(subCloses, subOpens, 'every subgraph must be closed with `end`');
});

test('floorplan is referenced from a designs README that documents the convention', () => {
  assert.ok(exists('designs/README.md'), 'designs/README.md must exist');
  const readme = read('designs/README.md').toLowerCase();
  assert.ok(readme.includes('convention'), 'designs README must state the naming convention');
});
