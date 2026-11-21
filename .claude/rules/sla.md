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

## Which incidents can breach

Only `open` and `in_progress` incidents can breach. A `resolved` or `closed`
incident is finished, so nobody needs to act on it and it must never appear in a
list of work that needs attention.

`VALID_STATUSES` has four entries. Two of them mean active and two mean finished.
Any filter that decides what still needs attention must account for all four.

## How the derived fields behave

- `minutesRemaining` is negative once the deadline has passed.
- `breached` is `true` only when `minutesRemaining` is below zero.
- Changing a target means the support contract changed. Never adjust these values to
  make a test pass.
