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

Rules that follow from the contract:

- `SLA_TARGET_HOURS` holds these targets in hours, not minutes and not milliseconds.
- A P1 incident raised exactly one hour ago is precisely at its deadline:
  `minutesRemaining` is `0` and `breached` is `false`.
- `minutesRemaining` is negative once the deadline has passed.
- `breached` is `true` only when `minutesRemaining` is below zero.
- Changing a target means the support contract changed. Never adjust these values to
  make a test pass.
