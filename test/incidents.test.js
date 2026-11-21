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

test.after(() => {
  server.close();
});

test.beforeEach(() => {
  store.seed();
});

test('GET /health reports ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('GET /incidents returns the seeded incidents', async () => {
  const res = await fetch(`${baseUrl}/incidents`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.incidents.length, 5);
});

test('GET /incidents filters by status', async () => {
  const res = await fetch(`${baseUrl}/incidents?status=open`);
  const body = await res.json();
  assert.equal(body.incidents.length, 3);
  assert.ok(body.incidents.every((i) => i.status === 'open'));
});

test('GET /incidents filters by priority', async () => {
  const res = await fetch(`${baseUrl}/incidents?priority=P1`);
  const body = await res.json();
  assert.equal(body.incidents.length, 1);
  assert.equal(body.incidents[0].priority, 'P1');
});

test('GET /incidents/:id returns one incident', async () => {
  const res = await fetch(`${baseUrl}/incidents/1`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.id, 1);
  assert.match(body.title, /Checkout service/);
});

test('GET /incidents/:id returns 404 when missing', async () => {
  const res = await fetch(`${baseUrl}/incidents/999`);
  assert.equal(res.status, 404);
});

test('POST /incidents creates an incident', async () => {
  const res = await fetch(`${baseUrl}/incidents`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'VPN drops every few minutes', priority: 'P2' })
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.title, 'VPN drops every few minutes');
  assert.equal(body.status, 'open');
});

test('POST /incidents rejects a missing title', async () => {
  const res = await fetch(`${baseUrl}/incidents`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ priority: 'P2' })
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /title is required/);
});

test('POST /incidents rejects an unknown priority', async () => {
  const res = await fetch(`${baseUrl}/incidents`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Printer offline', priority: 'URGENT' })
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /priority must be one of/);
});

test('PATCH /incidents/:id/status updates the status', async () => {
  const res = await fetch(`${baseUrl}/incidents/2/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'resolved' })
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'resolved');
});

test('PATCH /incidents/:id/status rejects an unknown status', async () => {
  const res = await fetch(`${baseUrl}/incidents/2/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'nearly_done' })
  });
  assert.equal(res.status, 400);
});

test('PATCH /incidents/:id/assignee sets the assignee', async () => {
  const res = await fetch(`${baseUrl}/incidents/2/assignee`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ assignee: 'portal-team' })
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.assignee, 'portal-team');
});
