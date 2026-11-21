'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const sla = require('../src/lib/sla');

function raisedHoursAgo(h, priority) {
  return { priority, createdAt: new Date(Date.now() - h * 60 * 60 * 1000).toISOString() };
}

// From .claude/rules/sla.md: targets are measured in hours, and a P1 raised
// exactly one hour ago is precisely at its deadline.
test('a P1 raised one hour ago is exactly at its deadline', () => {
  const incident = raisedHoursAgo(1, 'P1');
  assert.equal(sla.minutesRemaining(incident), 0);
  assert.equal(sla.isBreached(incident), false);
});

test('a P3 raised six hours ago has 18 hours left on a 24-hour target', () => {
  const incident = raisedHoursAgo(6, 'P3');
  assert.equal(sla.minutesRemaining(incident), 18 * 60);
  assert.equal(sla.isBreached(incident), false);
});

test('a P2 raised five hours ago has breached its 4-hour target by an hour', () => {
  const incident = raisedHoursAgo(5, 'P2');
  assert.equal(sla.minutesRemaining(incident), -60);
  assert.equal(sla.isBreached(incident), true);
});
