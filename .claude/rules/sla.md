---
paths:
  - "src/lib/sla.js"
  - "src/services/**/*.js"
  - "test/**/*.test.js"
---

# Service level targets

Resolution targets come from the support contract. They are measured in **hours**
from the incident's `createdAt`.

| Priority | Resolution target |
| --- | --- |
| P1 | 1 hour |
| P2 | 4 hours |
| P3 | 24 hours |
| P4 | 72 hours |

## Which incidents are still being worked on

`VALID_STATUSES` in `src/data/store.js` lists four statuses:

- `open` and `in_progress` mean someone is still working on the incident.
- `resolved` and `closed` mean the work is finished.

Never include a finished incident in a list of work to act on. There is nothing
left to do on it.

Closing an incident does not stop its clock, so a finished incident keeps counting
past its deadline and can look badly overdue. Use the status, not the deadline, to
decide whether it still needs attention.

## How the derived fields behave

- `minutesRemaining` is negative once the deadline has passed.
- `breached` is `true` only when `minutesRemaining` is below zero.
- Changing a target means the support contract changed. Never adjust these values to
  make a test pass.
