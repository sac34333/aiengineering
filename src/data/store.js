'use strict';

// In-memory store. Replaced by a real database in production; kept simple
// here so the service runs with no external dependencies.

const VALID_PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

function hoursAgo(n) {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}

let nextId = 1;
let incidents = [];

function seed() {
  nextId = 1;
  incidents = [
    {
      id: nextId++,
      title: 'Checkout service returning 500 for card payments',
      priority: 'P1',
      status: 'in_progress',
      assignee: 'payments-team',
      createdAt: hoursAgo(2)
    },
    {
      id: nextId++,
      title: 'Customer portal slow to load invoices',
      priority: 'P3',
      status: 'open',
      assignee: null,
      createdAt: hoursAgo(6)
    },
    {
      id: nextId++,
      title: 'Nightly billing export failed',
      priority: 'P2',
      status: 'open',
      assignee: 'billing-team',
      createdAt: hoursAgo(1)
    },
    {
      // Raised 3.5 hours ago against a 4-hour target, so roughly half an hour
      // of the target is left. Close to its deadline but not past it.
      id: nextId++,
      title: 'Password reset emails delayed',
      priority: 'P2',
      status: 'open',
      assignee: 'identity-team',
      createdAt: hoursAgo(3.5)
    },
    {
      // Finished work. Long past its target, but nobody needs to act on it.
      id: nextId++,
      title: 'Typo on the account settings page',
      priority: 'P4',
      status: 'resolved',
      assignee: 'web-team',
      createdAt: hoursAgo(100)
    },
    {
      // Also finished, and closed rather than resolved.
      id: nextId++,
      title: 'Legacy VPN certificate warning',
      priority: 'P2',
      status: 'closed',
      assignee: 'network-team',
      createdAt: hoursAgo(10)
    }
  ];
}

seed();

function all() {
  return incidents.map((i) => ({ ...i }));
}

function findById(id) {
  const found = incidents.find((i) => i.id === Number(id));
  return found ? { ...found } : undefined;
}

function create({ title, priority, assignee = null }) {
  const incident = {
    id: nextId++,
    title,
    priority,
    status: 'open',
    assignee,
    createdAt: new Date().toISOString()
  };
  incidents.push(incident);
  return { ...incident };
}

function update(id, changes) {
  const index = incidents.findIndex((i) => i.id === Number(id));
  if (index === -1) return undefined;
  incidents[index] = { ...incidents[index], ...changes };
  return { ...incidents[index] };
}

module.exports = {
  VALID_PRIORITIES,
  VALID_STATUSES,
  seed,
  all,
  findById,
  create,
  update
};
