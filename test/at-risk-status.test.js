'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const store = require('../src/data/store');

let server;
let baseUrl;

test.before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(() => server.close());
test.beforeEach(() => store.seed());

// From .claude/rules/sla.md: only open and in_progress incidents can breach.
// A resolved or closed incident is finished and needs no action.
test('GET /incidents/at-risk excludes closed incidents', async () => {
  const res = await fetch(`${baseUrl}/incidents/at-risk`);
  const body = await res.json();
  assert.ok(body.incidents.every((i) => i.status !== 'closed'));
});

test('GET /incidents/at-risk only returns open or in_progress incidents', async () => {
  const res = await fetch(`${baseUrl}/incidents/at-risk`);
  const body = await res.json();
  assert.ok(body.incidents.every((i) => i.status === 'open' || i.status === 'in_progress'));
});
