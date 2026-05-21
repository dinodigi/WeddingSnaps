# Brief — rest-express

## What we're building
rest-express is an existing React web application being adopted into the `.os/` project-management and agent-assisted workflow. The codebase already exists and is running; this bootstrap captures its current state so the team can plan, track, and iterate using structured milestones and tasks. No greenfield setup is required — the goal is to bring the project under organised `.os/` governance.

## Who it's for
The developers and contributors working on the rest-express codebase who want structured planning, documented architecture, and an agentic workflow on top of code that already exists.

## What it does
1. **Captures** the existing React codebase structure, dependencies, and conventions in living documentation.
2. **Surfaces** the current state of the product through a defined v1 milestone and roadmap.
3. **Tracks** ongoing work via epics and tasks that map to real in-flight changes.
4. **Keeps** architecture and product intent up-to-date as the project evolves.

## What it isn't
- Not a from-scratch build — all repo scaffolding, dependency installation, and deploy configuration already exist.
- Not a migration to a different framework or stack.
- Not a documentation-only project — tasks should map to real product value.
- Not a monorepo restructure unless explicitly planned.

## Core loop
Developer opens `.os/`, picks the next task from the active milestone, implements it in the existing codebase, and marks it done — keeping the roadmap honest.

## MVP scope
- `.os/` identity, stack, brief, plan, and architecture documents written and accurate.
- v1 milestone defined with meaningful epics and tasks.
- Existing architecture documented.
- Propose-change workflow adopted by the team.
- Agent system prompt tuned to the actual codebase.

## Out of scope v1
- CI/CD pipeline changes driven by `.os/`
- Automated issue mirroring to GitHub
- Multi-workspace or multi-repo federation
