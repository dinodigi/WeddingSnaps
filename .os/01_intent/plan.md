# Plan — rest-express

## Where we are
The codebase exists and is actively developed using React. A discovery scan has been completed and `.os/` is being bootstrapped for the first time. No prior structured planning artefacts exist inside `.os/`.

---

## Milestones to v1

### M1 — .os/ Adoption Foundation
**Goal:** The project is fully described inside `.os/` and every contributor knows how to use it.

**Includes:**
- Document existing architecture in `architecture.md`
- Confirm and complete `stack.json` with real framework/language/deploy details
- Write the product brief and plan
- Run the first agent session against the live codebase

**Done when:** `architecture.md` is accurate, `stack.json` matches the real codebase, and at least one task has been completed via the `.os/` workflow.

---

### M2 — Codebase Triage & Debt Mapping
**Goal:** Known tech debt, missing tests, and open feature gaps are listed as tasks in `.os/`.

**Includes:**
- Review existing components and routes for undocumented behaviour
- Tag debt tasks with `tech-debt`
- Identify any missing test coverage areas
- Define epics that match the current feature set

**Done when:** All known debt items have a corresponding task, and epics cover every major feature area.

---

### M3 — Active Feature Development
**Goal:** The next meaningful product feature is planned, built, and shipped using the `.os/` workflow.

**Includes:**
- Feature epic created and broken into tasks
- Propose-change workflow used for any breaking changes
- Architecture updated to reflect new feature

**Done when:** Feature is merged and `architecture.md` reflects the change.

---

### M4 — Quality & Observability
**Goal:** The app has a baseline of quality gates and runtime observability.

**Includes:**
- Linting and formatting enforced
- Key component tests written
- Error boundaries in place
- Any monitoring/logging wired up

**Done when:** CI passes on every PR; no unhandled errors in production.

---

### M5 — v1 Declared
**Goal:** The product is feature-complete for its stated v1 scope.

**Includes:**
- All M1–M4 milestones completed
- `prd.md` and `plan.md` updated to reflect shipped reality
- Retrospective notes captured in `.os/`
- Roadmap updated with post-v1 ideas

**Done when:** Team signs off on v1; roadmap shows what comes next.

---

## Out of scope for v1
- Backend rewrite or framework migration
- Multi-tenant architecture
- Native mobile app
- Automated deployment pipeline changes

---

## Beyond v1
- Progressive Web App (PWA) capabilities
- Performance budget tracking
- Design system extraction
- Backend API layer (if applicable)

---

## Risks named
1. **Undocumented existing behaviour** — architecture.md may be incomplete until the team reviews it.
2. **Low discovery confidence (0.6)** — project type was inferred, not confirmed; stack.json may need manual correction.
3. **No defined deploy target** — deploy pipeline is unknown; tasks may surface gaps.

---

## How this plan stays alive
Every sprint, the team reviews open tasks, closes completed ones, and ensures the active milestone's "done when" criteria are still accurate. `plan.md` is updated whenever a milestone is completed or scope changes.
