'use strict';

// Shared helpers for the Repairo acceptance-criteria test suite.
//
// Repairo is a documentation repository, not an application. The meaningful
// suite therefore verifies the design deliverables against the brief's own
// acceptance criteria (docs/BRIEF.md section 6) as *data*: it reads the
// committed Markdown and HTML artifacts and asserts facts about their content,
// so refining prose keeps the suite green and only a dropped requirement — or a
// design that no longer meets a criterion — turns it red.

const fs = require('node:fs');
const path = require('node:path');

// Repository root = parent of this test/ directory.
const REPO_ROOT = path.resolve(__dirname, '..');

function repoPath(rel) {
  return path.join(REPO_ROOT, rel);
}

function exists(rel) {
  return fs.existsSync(repoPath(rel));
}

function read(rel) {
  const p = repoPath(rel);
  if (!fs.existsSync(p)) {
    throw new Error(`Expected artifact is missing: ${rel}`);
  }
  return fs.readFileSync(p, 'utf8');
}

function readLower(rel) {
  return read(rel).toLowerCase();
}

// Extract every Mermaid node label from a flowchart source. Node labels appear
// as ["..."] (rectangles), ("...") (rounded), or (("...")) (circles).
function mermaidLabels(source) {
  const labels = [];
  const re = /\[+"?([^"\]]+?)"?\]+|\(+"([^"]+)"\)+/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    labels.push((m[1] || m[2]).trim());
  }
  return labels;
}

module.exports = { REPO_ROOT, repoPath, exists, read, readLower, mermaidLabels };
