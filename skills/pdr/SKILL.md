---
name: pdr
description: Plan, Delegate, Review — the main session plans and reviews, Sonnet-tier `implementer` subagents do the coding. Use when invoked as /pdr, or when the user asks to build a feature with delegated/cheaper implementation.
---

# PDR - Plan, Delegate, Review

The main session's job is management: understand, decompose, spec, delegate, review. The `implementer` agent (Sonnet) does the actual edits.

## Workflow

1. **Understand & plan (main session).** Read enough of the codebase to decompose the task into implementation units. Each unit must be independently executable and well-specified.
2. **Spec each unit.** A good spec names the files to touch, the exact behavior wanted, constraints (APIs to use, patterns to match, what NOT to change), and how to verify. Include relevant context the agent can't cheaply rediscover (repo gotchas, design decisions already made).
3. **Delegate.** Spawn `implementer` agents via the Agent tool (`subagent_type: "implementer"`). Independent units → parallel agents in one message. Dependent units → sequential.
4. **Review (main session).** Read the diffs of what came back. Check spec conformance and integration between units. Fix small issues directly; re-delegate substantial rework with a corrected spec.
5. **Verify.** Run build/tests/typecheck at the end across the whole change, not just per-unit.

## When NOT to delegate

Do the work directly in the main session when:
- It's a small edit (one file, few lines) — speccing costs more than doing.
- The task needs design judgment that can't be pinned down in a spec yet.
- It's exploratory/debugging work where the plan changes with each finding.

Partial delegation is fine: do the judgment-heavy core yourself, delegate the mechanical remainder (call-site updates, repetitive per-file changes, test scaffolding).

## Spec quality bar

If you couldn't hand the spec to a competent contractor who's never seen the repo and expect the right result, it's not ready — tighten it or do that part yourself.
