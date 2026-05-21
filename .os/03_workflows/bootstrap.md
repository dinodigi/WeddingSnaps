---
id: bootstrap
# Intentionally empty. Bootstrap is NOT on the event-driven dispatch path
# in v1: discovery completion is a user-initiated UI action that calls
# runWorkflow directly with createBootstrapApplier. The _triggers.json map
# still names discovery.completed → bootstrap as the future autonomous
# wiring (see S-002); v1 invokes this playbook directly, not via the
# event router. Do not "fix" this empty array to make the trigger appear —
# the deliberate omission is the contract.
triggers: []
loads:
  - 00_identity/discovery.json
output_schema: schemas/bootstrap-output.schema.json
description: Take a completed discovery transcript and produce a complete .os/ folder + root scaffolding.
---

# Bootstrap a new project

You are setting up a new project from a discovery transcript. The user has just answered 8-15 questions about what they're building. Your job is to turn those answers into a fully-functioning `.os/` folder and the deploy-target-specific root files.

## Inputs

- `00_identity/discovery.json` — the complete answer transcript

## Outputs (write via core operations)

1. `00_identity/project.json` — the project identity record
2. `00_identity/stack.json` — the stack choices
3. `01_intent/brief.md` — distilled product brief (~80-100 lines, structured: what / who / what it does / what it isn't / core promise / out of scope)
4. `01_intent/plan.md` — milestones with target dates, scope per milestone, out-of-scope-for-v1 list
5. `01_intent/architecture.md` — tech overview, stack rationale, key decisions
6. `01_intent/prd.md` — the full product requirements doc (ADR-012) — see "How to write prd.md"
7. `01_intent/roadmap.json` — structured milestone data
8. `02_state/tasks/` — 8-12 starter tasks seeded based on stack choices
9. `02_state/epics/` — initial epics grouping the seed tasks
10. `04_knowledge/library/*` — snapshot library entries relevant to chosen features
11. `05_agent/system.md` — project-specific agent prompt
12. Root scaffolding files based on `stack.json.deploy_target`

## Bootstrapping around existing code

If `discovery.json` has `existing_code: true`, this project is an **existing codebase being adopted** (ADR-008 Path B — repo import), not a greenfield build. The answers were synthesised from a code scan, not a Q&A. Adjust your output:

- **Seed tasks** describe *adopting* `.os/` into a live repo — e.g. "Document the existing architecture", "Define the v1 milestone for the current codebase", "Adopt the propose-change workflow". Do NOT seed greenfield setup tasks ("set up the repo", "install dependencies", "configure the deploy target") — that work is already done.
- **`architecture.md`** describes the *detected* stack and structure (framework, monorepo vs single-package layout, integrations) as it already exists — framed as "here is what the codebase does", not "here is what we will build".
- **`brief.md` / `plan.md`** frame v1 as the next phase of an existing product, not a from-scratch build.
- **Skip output #12 (root scaffolding files)** — the applier does not copy a deploy-target pack for an imported project; the repo already has its root files. `stack.json.deploy_target` still records the target.

## How to think about seed tasks

Look at `stack.json` and `discovery.json.answers.mvp_features`. For each MVP feature, seed 1-3 tasks. For each stack choice that requires setup (auth, db, deploy), seed a setup task.

Examples:
- If `auth_needed` includes magic-link → seed "Set up Clerk + magic-link auth" task
- If `database` is postgres → seed "Initial schema + migrations" task
- If `deploy_target` is replit → seed "Configure .replit + replit.nix" task

## How to think about library snapshots

Look at `discovery.json.answers.mvp_features` and tags. For each feature that maps to a library category (auth, multi-tenancy, payments, file-uploads, search, notifications, feature-flags, observability, ai-features), copy that category's entries into the user's `library/`. Pin the version in `library/_version.json`.

## How to write brief.md

Use this structure exactly:
1. ## What we're building (3-5 sentences, no marketing-speak)
2. ## Who it's for (specific audience, not "everyone")
3. ## What it does (numbered: capture / surface / edit / keep, or the equivalent for their product)
4. ## What it isn't (3-5 explicit non-goals)
5. ## Core loop (one-line narrative)
6. ## MVP scope (bulleted)
7. ## Out of scope v1 (bulleted)

## How to write plan.md

Use the structure in our own `01_intent/plan.md` as a template:
- ## Where we are
- ## Milestones to v1 (5 milestones, each with goal/includes/done-when)
- ## Out of scope for v1
- ## Beyond v1 (rough roadmap)
- ## Risks named
- ## How this plan stays alive

## How to write prd.md

`prd.md` is the full product requirements doc — the complete product vision, fuller than the distilled `brief.md`, so agents planning any later milestone have the whole picture (ADR-012).

- **If `discovery.json` has a `prd` field**, the project was incubated (ADR-008 Path C) and the PRD is already written — the applier persists `discovery.json.prd` verbatim. You may omit `prd_md` from your output.
- **If `discovery.json` has no `prd` field** (the Q&A path), compose a concise PRD into the `prd_md` output field: problem, target users, core value, the feature set with short descriptions, what's out of scope, the stack, and any notable architecture decisions.

## Output expectations

- Every artifact validates against its schema (run validation before writing)
- Every file write goes through core operations
- Append a `project.bootstrapped` event when complete
- Append a `bootstrap.summary` changelog entry with the counts of generated files/tasks/library entries
