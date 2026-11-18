'use strict';

// Service level agreement targets, in hours, measured from when the
// incident was created. These values come from the support contract.
const SLA_TARGET_HOURS = {
  P1: 1,
  P2: 4,
  P3: 24,
  P4: 72
};

function targetHoursFor(priority) {
  const hours = SLA_TARGET_HOURS[priority];
  if (hours === undefined) {
    throw new Error(`Unknown priority: ${priority}`);
  }
  return hours;
}

// The moment this incident must be resolved by.
function deadlineFor(incident) {
  const created = new Date(incident.createdAt);
  const hours = targetHoursFor(incident.priority);
  return new Date(created.getTime() + hours * 60 * 1000);
}

// Minutes remaining before the deadline. Negative once it has passed.
function minutesRemaining(incident, now = new Date()) {
  const deadline = deadlineFor(incident);
  return Math.round((deadline.getTime() - now.getTime()) / 60000);
}

function isBreached(incident, now = new Date()) {
  return minutesRemaining(incident, now) < 0;
}

module.exports = {
  SLA_TARGET_HOURS,
  targetHoursFor,
  deadlineFor,
  minutesRemaining,
  isBreached
};
