# incident-service

An incident management REST API. Support agents raise incidents, assign them to a
team, and move them through a status workflow until they are closed.

## Commands

- `npm install` — install dependencies
- `npm start` — run the service on http://localhost:3000
- `npm test` — run the full test suite

Run `npm test` before committing.

## Architecture

The service is layered. Keep each layer's job separate:

- `src/routes/` — HTTP only. Read the request, choose the status code. No business rules here.
- `src/services/` — business rules and validation. New behavior goes here.
- `src/data/store.js` — the in-memory store and its seed data.
- `src/lib/sla.js` — resolution deadline calculations.

Business logic belongs in `src/services/`, not in `src/routes/`.

## Conventions

- Use CommonJS (`require` and `module.exports`). This project is not ES modules.
- Validation failures throw `ValidationError` from the service layer. Routes catch it
  and return HTTP 400.
- Tests use Node's built-in runner (`node:test`) and call the API over real HTTP.
  There is no test framework to configure.
- Every new endpoint needs a test in `test/incidents.test.js`.
- Data is in memory and reseeded per test with `store.seed()`. Do not add a database.

## Domain

- Priorities are `P1`, `P2`, `P3`, `P4`. `P1` is most urgent.
- Statuses are `open`, `in_progress`, `resolved`, `closed`.
- Every response includes three derived fields: `slaDeadline`, `minutesRemaining`
  and `breached`.
