'use strict';

const store = require('../data/store');
const sla = require('../lib/sla');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function withSla(incident) {
  return {
    ...incident,
    slaDeadline: sla.deadlineFor(incident).toISOString(),
    minutesRemaining: sla.minutesRemaining(incident),
    breached: sla.isBreached(incident)
  };
}

function listIncidents({ status, priority } = {}) {
  let results = store.all();
  if (status) results = results.filter((i) => i.status === status);
  if (priority) results = results.filter((i) => i.priority === priority);
  return results.map(withSla);
}

function getIncident(id) {
  const incident = store.findById(id);
  return incident ? withSla(incident) : undefined;
}

// Statuses that mean someone is still working on the incident. A resolved or
// closed incident is finished, so it never belongs in a list of work to act on.
const ACTIVE_STATUSES = ['open', 'in_progress'];

// An incident is at risk once 25% or less of its resolution target remains.
// This is a product decision rather than contract data, so it lives here and
// not alongside SLA_TARGET_HOURS in src/lib/sla.js.
const AT_RISK_FRACTION = 0.25;

// Reuses listIncidents() so every incident passes through withSla once. The
// value used to filter, the value used to sort and the value in the response
// are then all the same reading of the clock.
function listAtRiskIncidents() {
  return listIncidents()
    .filter((i) => ACTIVE_STATUSES.includes(i.status))
    .filter(
      (i) =>
        i.minutesRemaining <=
        sla.targetHoursFor(i.priority) * 60 * AT_RISK_FRACTION
    )
    .sort((a, b) => a.minutesRemaining - b.minutesRemaining);
}

function createIncident(payload) {
  const title = (payload.title || '').trim();
  if (!title) {
    throw new ValidationError('title is required');
  }
  if (!store.VALID_PRIORITIES.includes(payload.priority)) {
    throw new ValidationError(
      `priority must be one of ${store.VALID_PRIORITIES.join(', ')}`
    );
  }
  return withSla(store.create({ title, priority: payload.priority, assignee: payload.assignee }));
}

function updateStatus(id, status) {
  if (!store.VALID_STATUSES.includes(status)) {
    throw new ValidationError(
      `status must be one of ${store.VALID_STATUSES.join(', ')}`
    );
  }
  const updated = store.update(id, { status });
  return updated ? withSla(updated) : undefined;
}

function assign(id, assignee) {
  if (!assignee) {
    throw new ValidationError('assignee is required');
  }
  const updated = store.update(id, { assignee });
  return updated ? withSla(updated) : undefined;
}

module.exports = {
  ValidationError,
  listIncidents,
  listAtRiskIncidents,
  getIncident,
  createIncident,
  updateStatus,
  assign
};
