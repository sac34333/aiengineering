# incident-service

A small incident management REST API. Support agents raise incidents, assign them
to a team, and move them through a status workflow. Every incident has a priority
from P1 to P4, and the support contract sets a resolution target for each priority.

This repository is the hands-on project for the **Agentic Systems for Enterprise
Engineering** course. You will clone it, set up a coding harness against it, and
then build a feature and fix a defect using a real agent session.

## Running it

```bash
npm install
npm start          # http://localhost:3000
npm test
```

Node 20 or later. Express is the only runtime dependency.

## The domain

An **incident** is a reported problem with a service.

| Field | Meaning |
| --- | --- |
| `id` | Numeric identifier |
| `title` | Short description of the problem |
| `priority` | `P1` (most urgent) through `P4` |
| `status` | `open`, `in_progress`, `resolved`, `closed` |
| `assignee` | Team responsible, or `null` if unassigned |
| `createdAt` | ISO timestamp of when it was raised |

### Service level targets

The support contract commits to resolving incidents within a fixed number of
**hours** from when they were raised:

| Priority | Resolution target |
| --- | --- |
| P1 | 1 hour |
| P2 | 4 hours |
| P3 | 24 hours |
| P4 | 72 hours |

Responses include three derived fields: `slaDeadline`, `minutesRemaining`
(negative once the deadline has passed) and `breached`.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness check |
| `GET` | `/incidents` | List incidents, optionally `?status=` or `?priority=` |
| `GET` | `/incidents/:id` | Fetch one incident |
| `POST` | `/incidents` | Raise an incident (`title`, `priority`, optional `assignee`) |
| `PATCH` | `/incidents/:id/status` | Move an incident through the workflow |
| `PATCH` | `/incidents/:id/assignee` | Assign an incident to a team |

## Layout

```
src/
  server.js                  entry point
  app.js                     express app wiring
  routes/incidents.js        HTTP layer
  services/incidentService.js business rules and validation
  data/store.js              in-memory store with seed data
  lib/sla.js                 service level target calculations
test/
  incidents.test.js          API tests (node:test)
```

Data is held in memory and resets on restart. There is no database, no auth and
no CI pipeline yet. That is deliberate: several of those gaps are the exercises.
