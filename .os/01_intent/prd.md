# Product Requirements Document — rest-express

## Problem
The rest-express codebase is actively developed but lacks structured planning, documented architecture, and a defined milestone roadmap. Contributors work without a shared source-of-truth for product intent, making it hard to prioritise, onboard new developers, or reason about scope.

## Target Users
- **Primary:** The engineering team (or solo developer) working on rest-express day-to-day.
- **Secondary:** Any stakeholder who needs visibility into what is being built and why.

## Core Value
A single `.os/` folder that captures the product's intent, current state, and next steps — turning an undocumented codebase into a legible, plannable project.

## Feature Set

### 1. Identity & Stack Documentation
A `project.json` and `stack.json` that accurately describe what is being built, by whom, and with which technologies. Updated whenever the stack changes.

### 2. Product Brief & Plan
`brief.md` and `plan.md` give every contributor a shared understanding of scope, goals, and milestones — preventing scope creep and misaligned priorities.

### 3. Architecture Documentation
`architecture.md` describes the system as it exists today: directory structure, key decisions, integration points, and data flows. Living document, updated on each meaningful architectural change.

### 4. Epics & Tasks
Structured work items (`02_state/epics/`, `02_state/tasks/`) that map to real product features. Agents and humans alike can pick up tasks and work against the milestone.

### 5. Propose-Change Workflow
Any breaking architectural or scope change goes through a lightweight proposal process before implementation. Prevents unilateral rewrites.

### 6. Agent System Prompt
`05_agent/system.md` tunes the AI agent to the actual codebase conventions, so agent-assisted work stays consistent with the existing style.

## Out of Scope
- Changing the underlying tech stack
- Automated CI/CD driven by `.os/`
- Multi-repo or multi-workspace federation
- Native mobile apps

## Stack (detected)
- **Framework:** React 18.x
- **Language:** TypeScript (assumed)
- **Backend:** Express (inferred)
- **Deploy:** Unknown — to be confirmed

## Notable Architecture Decisions
1. **Adoption-first:** `.os/` describes the existing system rather than prescribing a new one. The codebase leads; the docs follow.
2. **Low-ceremony:** No new tooling is introduced solely for `.os/` compliance. Markdown files and JSON schemas are the only artefacts.
3. **Incremental fidelity:** `architecture.md` starts with inferred structure and is improved by the team over time — a partial truth is better than no truth.
