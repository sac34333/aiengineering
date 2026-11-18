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
  getIncident,
  createIncident,
  updateStatus,
  assign
};
